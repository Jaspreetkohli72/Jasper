"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [budget, setBudget] = useState(null);
    const [categoryBudgets, setCategoryBudgets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load from LocalStorage on mount
    useEffect(() => {
        const cached = typeof window !== 'undefined' ? localStorage.getItem('jasper_data') : null;
        if (cached) {
            try {
                const data = JSON.parse(cached);
                setTransactions(data.transactions || []);
                setCategories(data.categories || []);
                setContacts(data.contacts || []);
                setBudget(data.budget || null);
                setCategoryBudgets(data.categoryBudgets || []);
                setLoading(false); // Valid cache found, show immediately
            } catch (e) {
                console.error("Cache parse error", e);
            }
        }

        // Always fetch fresh data
        fetchData();
    }, []);

    // Save to LocalStorage whenever data changes
    useEffect(() => {
        if (!loading && transactions.length > 0) {
            const cache = {
                transactions,
                categories,
                contacts,
                budget,
                categoryBudgets
            };
            localStorage.setItem('jasper_data', JSON.stringify(cache));
        }
    }, [transactions, categories, contacts, budget, categoryBudgets, loading]);

    const fetchData = async () => {
        try {
            // Only set loading true if we didn't have cache
            // If we had cache, we update silently (Stale-While-Revalidate)
            // But we already handled initial loading state in the first effect logic implicitly?
            // Actually, we need to know if we successfully loaded cache.
            // Let's refine:
            // If cache exists, loading is already false.
            // If no cache, loading is true.

            const currentMonth = new Date().toISOString().slice(0, 7);

            const [
                { data: cats, error: catError },
                { data: conts, error: contError },
                { data: txs, error: txError },
                { data: budgets, error: budgetError },
                { data: catBudgets, error: catBudgetError }
            ] = await Promise.all([
                supabase.from("categories").select("*"),
                supabase.from("contacts").select("*"),
                supabase.from("transactions")
                    .select("*, categories(name, icon, type), contacts(name)")
                    .order("transaction_date", { ascending: false })
                    .order("created_at", { ascending: false }),
                supabase.from("global_budgets")
                    .select("*")
                    .eq("month_year", currentMonth)
                    .maybeSingle(),
                supabase.from("budgets")
                    .select("*")
                    .eq("month_year", currentMonth)
            ]);

            if (catError) throw catError;
            setCategories(cats || []);

            if (contError) console.warn("Contacts fetch error:", contError);
            setContacts(conts || []);

            if (txError) throw txError;
            setTransactions(txs || []);

            if (!budgetError && budgets) {
                setBudget(budgets);
            } else {
                setBudget({ amount_limit: 80000 });
            }

            if (catBudgetError) console.error("Error fetching category budgets:", catBudgetError);
            setCategoryBudgets(catBudgets || []);

            // Initial fetch done, loading is false (if it wasn't already)
            setLoading(false);

        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    // Add Transaction
    const addTransaction = async (newTx) => {
        try {
            // Optimistic Update (optional, but let's just wait for DB for safety first)
            const { amount, type, category_id, description, transaction_date, contact_id } = newTx;

            const payload = {
                amount,
                type,
                category_id,
                description,
                transaction_date: transaction_date || new Date().toISOString().split('T')[0]
            };
            if (contact_id) payload.contact_id = contact_id;

            const { data, error } = await supabase
                .from("transactions")
                .insert([payload])
                .select("*, categories(name, icon, type), contacts(name)")
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

    // Add Contact
    const addContact = async (contact) => {
        try {
            // Check for duplicates (case-insensitive)
            const exists = contacts.some(c => c.name.toLowerCase() === contact.name.trim().toLowerCase());
            if (exists) {
                return { success: false, error: { message: "Contact already exists" } };
            }

            const { data, error } = await supabase
                .from("contacts")
                .insert([contact])
                .select()
                .single();

            if (error) throw error;
            setContacts(prev => [...prev, data]);
            return { success: true, data };
        } catch (error) {
            console.error("Error adding contact:", error);
            return { success: false, error };
        }
    };

    // Delete Contact
    const deleteContact = async (id) => {
        console.log("Delete requested for ID:", id);
        try {
            const { error } = await supabase.from("contacts").delete().eq("id", id);

            if (error) {
                console.error("Supabase Delete Error:", error);
                throw error;
            }

            // Force local update first
            setContacts((prev) => prev.filter((c) => c.id !== id));

            // Just to be safe, we could technically re-fetch, but filter is usually reliable.
            // Let's stick to local update to be fast, but ensure we return success.
            return { success: true };
        } catch (error) {
            console.error("Delete failed:", error);
            return { success: false, error };
        }
    };

    // Update Contact
    const updateContact = async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from("contacts")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            setContacts((prev) => prev.map((c) => (c.id === id ? data : c)));
            return { success: true };
        } catch (error) {
            console.error("Error updating contact:", error);
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

    // Budget Logic (Excluding Contact Transactions)
    // We filter out any transaction that involves a contact (loans/debts) from the budget usage.
    const budgetableExpenses = transactions.filter(t => t.type === 'expense' && !t.contact_id);

    const budgetLimit = budget?.amount_limit || 80000;
    const budgetUsed = budgetableExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const budgetRemaining = budgetLimit - budgetUsed;
    const spendingPercentage = budgetLimit > 0 ? Math.round((budgetUsed / budgetLimit) * 100) : 0;

    // Contact Balances Calculation
    const contactsWithBalances = contacts.map(contact => {
        const contactTxs = transactions.filter(t => t.contact_id === contact.id);
        // If I paid (Expense), they owe me (Positive)
        const debtValue = contactTxs
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        // If they paid me (Income), it reduces debt (Negative)
        const creditValue = contactTxs
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        return {
            ...contact,
            balance: debtValue - creditValue
        };
    });

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

    // Top Expense Category for "Pulse" (Excluding Contacts)
    // Use a simple map to find top category
    const expenseByCategory = budgetableExpenses
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
    const [addTxInitialType, setAddTxInitialType] = useState("expense");

    return (
        <FinanceContext.Provider
            value={{
                transactions,
                categories,
                contacts: contactsWithBalances, // Expose with calculated balances
                addContact,
                updateContact,
                deleteContact,
                loading,
                addTransaction,
                deleteTransaction,
                updateGlobalBudget,
                updateCategoryBudget,
                isAddTxModalOpen,
                openAddTxModal: (type) => {
                    setAddTxInitialType(type || "expense");
                    setIsAddTxModalOpen(true);
                },
                closeAddTxModal: () => setIsAddTxModalOpen(false),
                addTxInitialType,
                financials: {
                    balance,
                    income: totalIncome,
                    expense: totalExpense,
                    budgetLimit,
                    budgetUsed, // Uses filtered amount
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
                        const used = expenseByCategory[cat.name] || 0; // Uses filtered map

                        const usedAccurate = budgetableExpenses
                            .filter(t => t.category_id === cat.id)
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
