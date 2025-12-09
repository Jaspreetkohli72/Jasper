"use client";
import React, { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useFinance } from "../../context/FinanceContext";
import AddTransactionForm from "../AddTransactionForm";

// Helper for formatting currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function BalanceCard() {
    const { financials, loading } = useFinance();
    const [activeForm, setActiveForm] = useState(null); // 'income' | 'expense' | null

    if (loading) return <div className="glass-soft p-4 h-48 animate-pulse rounded-[26px]" />;

    return (
        <>
            <div className="glass-soft p-4 md:p-3.5 rounded-[26px] bg-[radial-gradient(circle_at_0_0,rgba(248,250,252,0.2),hsla(0,0%,0%,0)_55%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(15,23,42,0.85))] relative overflow-hidden group">
                {/* Glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[rgba(91,141,255,0.35)] via-[rgba(56,189,248,0.25)] to-[rgba(15,23,42,0.3)] mix-blend-screen opacity-70 pointer-events-none" />

                <div className="relative flex flex-col gap-2.5 z-10">
                    <div className="flex justify-between items-center gap-2.5">
                        <div>
                            <div className="text-[0.82rem] uppercase tracking-[0.14em] text-[rgba(226,232,240,0.9)]">
                                Net balance
                            </div>
                            <div className={`text-[1.6rem] font-semibold tracking-wide ${financials.balance >= 0 ? "text-white" : "text-red-300"}`}>
                                {formatCurrency(financials.balance)}
                            </div>
                        </div>
                    </div>

                    {/* Simple Text Metrics as requested */}
                    <div className="flex gap-3 text-[0.78rem] text-muted">
                        <span>
                            Income: <strong className="text-[#bbf7d0]">{formatCurrency(financials.income)}</strong>
                        </span>
                        <span>
                            Expenses: <strong className="text-[#fecaca]">{formatCurrency(financials.expense)}</strong>
                        </span>
                    </div>

                    {/* Action Buttons */}
                    {!activeForm ? (
                        <div className="grid grid-cols-2 gap-2.5 mt-1">
                            <button
                                onClick={() => setActiveForm('income')}
                                className="group/btn relative flex items-center justify-center gap-2 py-3 px-4 rounded-[20px] bg-gradient-to-br from-[#22c55e] to-[#41e2b8] shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-all"
                            >
                                <ArrowUp size={18} className="text-white" />
                                <span className="text-sm font-semibold text-white">Add Income</span>
                            </button>
                            <button
                                onClick={() => setActiveForm('expense')}
                                className="group/btn relative flex items-center justify-center gap-2 py-3 px-4 rounded-[20px] bg-gradient-to-br from-[#fb7185] to-[#f97316] shadow-lg shadow-orange-900/20 active:scale-[0.98] transition-all"
                            >
                                <ArrowDown size={18} className="text-white" />
                                <span className="text-sm font-semibold text-white">Add Expense</span>
                            </button>
                        </div>
                    ) : (
                        <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                            <AddTransactionForm
                                type={activeForm}
                                title={activeForm === "income" ? "You Received" : "You Paid"}
                                onClose={() => setActiveForm(null)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
