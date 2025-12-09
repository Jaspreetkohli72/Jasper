"use client";
import React from "react";
import { useFinance } from "../../context/FinanceContext";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function BudgetCard() {
    const { financials, loading } = useFinance();

    if (loading) return <div className="glass p-3.5 h-32 animate-pulse rounded-[18px]" />;

    const progress = Math.min((financials.budgetUsed / financials.budgetLimit) * 100, 100);

    return (
        <div className="glass p-3.5 md:p-3 flex flex-col gap-2.5">
            <div className="flex justify-between items-center gap-2">
                <div>
                    <div className="text-[0.86rem] font-medium">Monthly budget</div>
                    <div className="text-[0.76rem] text-muted">Global limit</div>
                </div>
                <div className="text-[0.7rem] px-2 py-1 rounded-full border border-[rgba(148,163,184,0.6)] text-gray-200 bg-[rgba(15,23,42,0.85)]">
                    Global · {formatCurrency(financials.budgetLimit)}
                </div>
            </div>

            <div className="flex justify-between items-baseline gap-3 mt-1">
                <div className="text-[1.05rem] font-semibold">Used: {formatCurrency(financials.budgetUsed)}</div>
                <div className="text-[0.8rem] text-[#bbf7d0]">
                    Remaining: <span className="font-semibold">{formatCurrency(financials.budgetRemaining)}</span>
                </div>
            </div>

            <div className="mt-2.5 h-2 rounded-full bg-[rgba(15,23,42,0.9)] border border-[rgba(148,163,184,0.4)] overflow-hidden relative">
                <div
                    className="absolute inset-0 bg-gradient-to-r from-[#22c55e] via-[#f59e0b] to-[#ef4444] rounded-full origin-left transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex justify-between mt-1 text-[0.7rem] text-muted">
                <span>0%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
            </div>

            {financials.solvency?.isInsolvent && (
                <div className="mt-2 p-2 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-red-200 text-[0.75rem] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Budget Exceeds Balance
                    </div>
                </div>
            )}

            <div className="mt-2 flex justify-between gap-2 text-[0.78rem]">
                <button className="text-blue-100 opacity-90 hover:opacity-100 transition-opacity">
                    Adjust monthly budget
                </button>
                <button className="text-muted hover:text-gray-300 transition-colors">View history</button>
            </div>
        </div>
    );
}
