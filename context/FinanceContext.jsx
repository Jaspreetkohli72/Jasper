"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [allGlobalBudgets, setAllGlobalBudgets] = useState([]);
    const [allCategoryBudgets, setAllCategoryBudgets] = useState([]);
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
                setAllGlobalBudgets(data.allGlobalBudgets || []);
                setAllCategoryBudgets(data.allCategoryBudgets || []);
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
                allGlobalBudgets,
                allCategoryBudgets
            };
            localStorage.setItem('jasper_data', JSON.stringify(cache));
        }
    }, [transactions, categories, contacts, allGlobalBudgets, allCategoryBudgets, loading]);

    const fetchData = async () => {
        try {
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
                supabase.from("global_budgets").select("*"),
                supabase.from("budgets").select("*")
            ]);

            if (catError) throw catError;
            setCategories(cats || []);

            if (contError) console.warn("Contacts fetch error:", contError);
            setContacts(conts || []);

            if (txError) throw txError;
            setTransactions(txs || []);

            if (!budgetError) setAllGlobalBudgets(budgets || []);
            if (catBudgetError) console.error("Error fetching category budgets:", catBudgetError);
            setAllCategoryBudgets(catBudgets || []);

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

    // Settle Contact (New)
    const settleContact = async (contactId) => {
        try {
            // Find contact to get current balance
            const contact = contactsWithBalances.find(c => c.id === contactId);
            if (!contact) throw new Error("Contact not found");

            const balance = contact.balance || 0;
            if (balance === 0) return { success: true, message: "Already settled" };

            // Create offsetting transaction
            // Balance > 0 means they owe me (Positive). To settle, I "Receive" money (Income).
            // Wait, if Balance is Positive (They Owe Me), I should ADD an Income OR they PAID me.
            // If Balance is Negative (I Owe Them), I should ADD an Expense OR I PAID them.
            // Let's verify: 
            // Income (+), Expense (-)
            // Net = Income - Expense
            // If Net is Positive, it means Income > Expense. Wait.
            // Contacts Logic:
            // "If I paid (Expense), they owe me (Positive)" -> Expense is treated as +Debt to them?
            // "If they paid me (Income), it reduces debt (Negative)"
            // Let's check `contactsWithBalances` logic in the file:
            // const debtValue = contactTxs.filter(t => t.type === 'expense').reduce...
            // const creditValue = contactTxs.filter(t => t.type === 'income').reduce...
            // balance: debtValue - creditValue
            // So: Expense (I pay) INCREASES balance (They owe me more).
            // Income (They pay) DECREASES balance.

            // So if Balance > 0 (They Owe Me), I need to Record an "Income" (They Pay Me) to reduce it to 0.
            // Amount = Balance. Type = 'income'.

            // If Balance < 0 (I Owe Them), I need to Record an "Expense" (I Pay Them) to increase it to 0.
            // Amount = abs(Balance). Type = 'expense'.

            const type = balance > 0 ? "income" : "expense";
            const amount = Math.abs(balance);

            const payload = {
                contact_id: contactId,
                amount: amount,
                type: type,
                description: "Account Settled",
                transaction_date: new Date().toISOString().split('T')[0],
                // We might need a dummy category or handle null category. 
                // Let's see if we can leave category_id null. Schema usually allows it.
            };

            const { data, error } = await supabase
                .from("transactions")
                .insert([payload])
                .select("*, categories(name, icon, type), contacts(name)")
                .single();

            if (error) throw error;

            setTransactions(prev => [data, ...prev]);
            return { success: true };
        } catch (error) {
            console.error("Error settling account:", error);
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
    const updateGlobalBudget = async (newAmount, monthYear) => {
        try {
            const targetMonth = monthYear || new Date().toISOString().slice(0, 7);
            const existingBudget = allGlobalBudgets.find(b => b.month_year === targetMonth);

            const payload = {
                month_year: targetMonth,
                amount_limit: newAmount,
            };

            if (existingBudget?.id) {
                const { data, error } = await supabase
                    .from("global_budgets")
                    .update({ amount_limit: newAmount })
                    .eq("id", existingBudget.id)
                    .select()
                    .single();
                if (error) throw error;
                setAllGlobalBudgets(prev => prev.map(b => b.id === existingBudget.id ? data : b));
            } else {
                const { data, error } = await supabase
                    .from("global_budgets")
                    .insert([payload])
                    .select()
                    .single();
                if (error) throw error;
                setAllGlobalBudgets(prev => [...prev, data]);
            }

            return { success: true };
        } catch (error) {
            console.error("Error updating budget:", error);
            return { success: false, error };
        }
    };

    // Add Category
    const addCategory = async (name, type, icon) => {
        try {
            const payload = { name, type, icon: icon || (type === 'income' ? 'ArrowDownLeft' : 'ShoppingCart') };
            const { data, error } = await supabase.from('categories').insert([payload]).select().single();

            if (error) throw error;

            setCategories(prev => [...prev, data]);
            return { success: true, data };
        } catch (error) {
            console.error("Error adding category:", error);
            return { success: false, error };
        }
    };

    // Delete Category
    const deleteCategory = async (id) => {
        try {
            // Safety Check: Is used in transactions?
            const isUsed = transactions.some(t => t.category_id === id);
            if (isUsed) {
                return { success: false, error: { message: "Cannot delete category with existing transactions." } };
            }

            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;

            setCategories(prev => prev.filter(c => c.id !== id));
            return { success: true };
        } catch (error) {
            console.error("Error deleting category:", error);
            return { success: false, error };
        }
    };

    // Update Category Budget
    const updateCategoryBudget = async (categoryId, newLimit, monthYear) => {
        try {
            const targetMonth = monthYear || new Date().toISOString().slice(0, 7);
            const payload = {
                category_id: categoryId,
                amount_limit: newLimit,
                month_year: targetMonth
            };

            // Upsert mechanism
            const { data, error } = await supabase
                .from("budgets")
                .upsert(payload, { onConflict: 'category_id, month_year' })
                .select()
                .single();

            if (error) throw error;

            // Update local state
            setAllCategoryBudgets(prev => {
                // Remove existing entry for this category and month if exists
                const filtered = prev.filter(b => !(b.category_id === categoryId && b.month_year === targetMonth));
                return [...filtered, data];
            });

            return { success: true };
        } catch (error) {
            console.error("Error updating category budget:", error);
            return { success: false, error };
        }
    };

    // Helper: Get Financials for a Specific Month
    const getFinancials = (monthStr) => {
        const targetMonth = monthStr || new Date().toISOString().slice(0, 7);

        // Filter transactions for this month
        const [year, month] = targetMonth.split('-');
        const monthTransactions = transactions.filter(t => {
            const d = new Date(t.transaction_date);
            return d.getFullYear() === parseInt(year) && (d.getMonth() + 1) === parseInt(month);
        });

        // Calculate Income & Expense
        const income = monthTransactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const expense = monthTransactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const balance = income - expense;

        // Budget Logic (Excluding Contact Transactions)
        const budgetableExpenses = monthTransactions.filter(t => t.type === 'expense' && !t.contact_id);
        const budgetObj = allGlobalBudgets.find(b => b.month_year === targetMonth);
        const budgetLimit = budgetObj?.amount_limit || 80000;
        const budgetUsed = budgetableExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
        const budgetRemaining = budgetLimit - budgetUsed;
        const spendingPercentage = budgetLimit > 0 ? Math.round((budgetUsed / budgetLimit) * 100) : 0;

        // Solvency
        const solvencyGap = budgetRemaining - balance;
        const isInsolvent = solvencyGap > 0;

        // Savings Rate
        const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

        // Runway (using Global Balance, not just monthly balance)
        const globalTotalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
        const globalTotalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
        const globalBalance = globalTotalIncome - globalTotalExpense;

        const burnRate = expense > 0 ? expense : 0;
        let runway = "No Burn";
        if (burnRate > 0) {
            const months = globalBalance / burnRate;
            runway = months > 60 ? "60+" : Math.round(months).toString();
        } else if (globalBalance === 0) {
            runway = "0";
        }

        // Top Category
        const expenseByCategory = budgetableExpenses
            .reduce((acc, t) => {
                const catName = t.categories?.name || 'Uncategorized';
                acc[catName] = (acc[catName] || 0) + Number(t.amount);
                return acc;
            }, {});

        const topCategoryEntry = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0];
        const topCategoryName = topCategoryEntry ? topCategoryEntry[0] : "No expenses";
        const topCategoryAmount = topCategoryEntry ? topCategoryEntry[1] : 0;

        // Category Metrics
        const categoryMetrics = categories.filter(c => c.type === 'expense').map(cat => {
            const limitEntry = allCategoryBudgets.find(b => b.category_id === cat.id && b.month_year === targetMonth);
            const limit = limitEntry ? Number(limitEntry.amount_limit) : 0;
            const used = expenseByCategory[cat.name] || 0;

            return {
                id: cat.id,
                name: cat.name,
                icon: cat.icon,
                limit,
                used,
                remaining: Math.max(0, limit - used),
                pct: limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
            };
        });

        return {
            balance, // Monthly Balance (Surplus/Deficit)
            income,
            expense,
            budgetLimit,
            budgetUsed,
            budgetRemaining,
            spendingPercentage,
            solvency: { isInsolvent, gap: solvencyGap },
            savingsRate,
            runway, // Keep global runway
            topCategory: { name: topCategoryName, amount: topCategoryAmount },
            categoryMetrics
        };
    };

    // Derived State for Current Month (Backwards Compatibility)
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const currentFinancials = getFinancials(currentMonthStr);

    // Contact Balances Calculation (Global)
    const contactsWithBalances = contacts.map(contact => {
        const contactTxs = transactions.filter(t => t.contact_id === contact.id);
        const debtValue = contactTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
        const creditValue = contactTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
        return { ...contact, balance: debtValue - creditValue };
    });

    // Modal State
    const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
    const [addTxInitialType, setAddTxInitialType] = useState("expense");

    return (
        <FinanceContext.Provider
            value={{
                transactions,
                categories,
                contacts: contactsWithBalances,
                addContact,
                updateContact,
                deleteContact,
                settleContact, // EXPOSED
                loading,
                addTransaction,
                deleteTransaction,
                updateGlobalBudget,
                updateCategoryBudget,
                addCategory,
                deleteCategory,
                isAddTxModalOpen,
                openAddTxModal: (type) => {
                    setAddTxInitialType(type || "expense");
                    setIsAddTxModalOpen(true);
                },
                closeAddTxModal: () => setIsAddTxModalOpen(false),
                addTxInitialType,
                getFinancials, // EXPOSED NEW FUNCTION
                financials: currentFinancials // EXISTING PROP MAPPED TO CURRENT MONTH
            }}
        >
            {children}
        </FinanceContext.Provider>
    );
}

export const useFinance = () => useContext(FinanceContext);
