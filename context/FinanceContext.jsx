"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [budget, setBudget] = useState(null); // Global budget
    const [categoryBudgets, setCategoryBudgets] = useState([]); // Array of { category_id, amount_limit, ... }
    const [loading, setLoading] = useState(true);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Categories
                const { data: cats, error: catError } = await supabase.from("categories").select("*");
                if (catError) throw catError;
                setCategories(cats || []);

                // 2. Fetch Transactions (ordered by date desc)
                const { data: txs, error: txError } = await supabase
                    .from("transactions")
                    .select("*, categories(name, icon, type)")
                    .order("transaction_date", { ascending: false });
                if (txError) throw txError;
                setTransactions(txs || []);

                // 3. Fetch Global Budget (for current month) - logic can be refined
                // For now, just getting the latest one or a default
                const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
                const { data: budgets, error: budgetError } = await supabase
                    .from("global_budgets")
                    .select("*")
                    .eq("month_year", currentMonth)
                    .maybeSingle();

                // If no budget exists, we might want to create one or just handle null
                if (!budgetError && budgets) {
                    setBudget(budgets);
                } else {
                    // Fallback or create logic could go here
                    setBudget({ amount_limit: 80000 }); // Default fallback from UI
                }

                // 4. Fetch Category Budgets
                const { data: catBudgets, error: catBudgetError } = await supabase
                    .from("budgets")
                    .select("*")
                    .eq("month_year", currentMonth);

                if (catBudgetError) console.error("Error fetching category budgets:", catBudgetError);
                setCategoryBudgets(catBudgets || []);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Add Transaction
    const addTransaction = async (newTx) => {
        try {
            // Optimistic Update (optional, but let's just wait for DB for safety first)
            const { amount, type, category_id, description, transaction_date } = newTx;

            const { data, error } = await supabase
                .from("transactions")
                .insert([{
                    amount,
                    type,
                    category_id,
                    description,
                    transaction_date: transaction_date || new Date().toISOString().split('T')[0]
                }])
                .select("*, categories(name, icon, type)")
                .single();

            if (error) throw error;

            // Update State
            setTransactions((prev) => [data, ...prev]);
            return { success: true };
        } catch (error) {
            console.error("Error adding transaction:", error);
            return { success: false, error };
        }
    };

    // Delete Transaction
    const deleteTransaction = async (id) => {
        try {
            const { error } = await supabase.from("transactions").delete().eq("id", id);
            if (error) throw error;

            setTransactions((prev) => prev.filter((t) => t.id !== id));
            return { success: true };
        } catch (error) {
            console.error("Error deleting transaction:", error);
            return { success: false, error };
        }
    };

    // Update Global Budget
    const updateGlobalBudget = async (newAmount) => {
        try {
            const currentMonth = new Date().toISOString().slice(0, 7);
            // We assume a unique constraint on month_year, or we just insert a new row if not expecting conflict. 
            // Ideally we should have the ID if we fetched it.
            // Let's try upsert on month_year if possible, or just insert.
            // For safety, let's correct the fetch logic to include ID if needed, but upsert with onConflict should work if schema allows.
            // If not, we might create duplicates. Let's assume basic insert/update for now.

            const payload = {
                month_year: currentMonth,
                amount_limit: newAmount,
                // created_at: new Date() // Supabase handles this usually
            };

            // If we have an existing budget ID, use it to update.
            if (budget?.id) {
                const { data, error } = await supabase
                    .from("global_budgets")
                    .update({ amount_limit: newAmount })
                    .eq("id", budget.id)
                    .select()
                    .single();
                if (error) throw error;
                setBudget(data);
            } else {
                // Insert new
                const { data, error } = await supabase
                    .from("global_budgets")
                    .insert([payload])
                    .select()
                    .single();
                if (error) throw error;
                setBudget(data);
            }

            return { success: true };
        } catch (error) {
            console.error("Error updating budget:", error);
            return { success: false, error };
        }
    };

    // Update Category Budget
    const updateCategoryBudget = async (categoryId, newLimit) => {
        try {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const payload = {
                category_id: categoryId,
                amount_limit: newLimit,
                month_year: currentMonth
            };

            // Upsert mechanism
            const { data, error } = await supabase
                .from("budgets")
                .upsert(payload, { onConflict: 'category_id, month_year' })
                .select()
                .single();

            if (error) throw error;

            // Update local state
            setCategoryBudgets(prev => {
                const filtered = prev.filter(b => b.category_id !== categoryId);
                return [...filtered, data];
            });

            return { success: true };
        } catch (error) {
            console.error("Error updating category budget:", error);
            return { success: false, error };
        }
    };

    // Derived State
    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;

    const budgetLimit = budget?.amount_limit || 80000;
    const budgetUsed = totalExpense; // Check if budget is expense-only? Usually yes.
    const budgetRemaining = budgetLimit - budgetUsed;
    const spendingPercentage = budgetLimit > 0 ? Math.round((budgetUsed / budgetLimit) * 100) : 0;

    // Advanced Metrics
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    // Runway (Balance / Average Monthly Expense). If no expense, effectively infinite, but let's cap or show symbol.
    // For simplicity, using current month expense as "burn rate" if > 0, else fallback.
    const burnRate = totalExpense > 0 ? totalExpense : 0;
    let runway = "No Burn";
    if (burnRate > 0) {
        const months = balance / burnRate;
        runway = months > 60 ? "60+" : Math.round(months).toString();
    } else if (balance === 0) {
        runway = "0";
    }

    // Solvency Check
    const solvencyGap = budgetRemaining - balance;
    const isInsolvent = solvencyGap > 0;

    // Top Expense Category for "Pulse"
    // Use a simple map to find top category
    const expenseByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            const catName = t.categories?.name || 'Uncategorized';
            acc[catName] = (acc[catName] || 0) + Number(t.amount);
            return acc;
        }, {});

    const topCategoryEntry = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0];
    const topCategoryName = topCategoryEntry ? topCategoryEntry[0] : "No expenses";
    const topCategoryAmount = topCategoryEntry ? topCategoryEntry[1] : 0;

    // Modal State
    const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);

    return (
        <FinanceContext.Provider
            value={{
                transactions,
                categories,
                loading,
                addTransaction,
                deleteTransaction,
                updateGlobalBudget,
                updateCategoryBudget,
                isAddTxModalOpen,
                openAddTxModal: () => setIsAddTxModalOpen(true),
                closeAddTxModal: () => setIsAddTxModalOpen(false),
                financials: {
                    balance,
                    income: totalIncome,
                    expense: totalExpense,
                    budgetLimit,
                    budgetUsed,
                    budgetRemaining,
                    spendingPercentage,
                    solvency: {
                        isInsolvent,
                        gap: solvencyGap
                    },
                    savingsRate,
                    runway,
                    topCategory: { name: topCategoryName, amount: topCategoryAmount },
                    categoryMetrics: categories.filter(c => c.type === 'expense').map(cat => {
                        const limitEntry = categoryBudgets.find(b => b.category_id === cat.id);
                        const limit = limitEntry ? Number(limitEntry.amount_limit) : 0;
                        const used = expenseByCategory[cat.name] || 0;

                        const usedAccurate = transactions
                            .filter(t => t.category_id === cat.id && t.type === 'expense')
                            .reduce((sum, t) => sum + Number(t.amount), 0);

                        return {
                            id: cat.id,
                            name: cat.name,
                            icon: cat.icon,
                            limit,
                            used: usedAccurate,
                            remaining: Math.max(0, limit - usedAccurate),
                            pct: limit > 0 ? Math.min(100, Math.round((usedAccurate / limit) * 100)) : 0
                        };
                    })
                }
            }}
        >
            {children}
        </FinanceContext.Provider>
    );
}

export const useFinance = () => useContext(FinanceContext);
