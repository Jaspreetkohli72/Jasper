"use client";
import React from "react";
import { useFinance } from "../../context/FinanceContext";
import { Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react";

// Define Transaction type locally or import if available
type Transaction = {
    id: string;
    type: "income" | "expense";
    amount: number;
    description: string;
    transaction_date: string;
    categories?: {
        name: string;
    };
};

export default function AccountsPage() {
    const { transactions, deleteTransaction, loading } = useFinance();

    if (loading) return <div className="p-4 glass rounded-[26px] h-64 animate-pulse" />;

    return (
        <div className="flex flex-col gap-4">
            <div className="glass p-5 rounded-[26px]">
                <h2 className="text-[1.1rem] font-semibold mb-4 text-text">Transaction History</h2>

                <div className="flex flex-col gap-3">
                    {transactions.length === 0 ? (
                        <div className="text-center text-muted py-8 text-sm">No transactions yet</div>
                    ) : (
                        transactions.map((tx: Transaction) => (
                            <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "income"
                                        ? "bg-[rgba(34,197,94,0.15)] text-green-400"
                                        : "bg-[rgba(244,63,94,0.15)] text-rose-400"
                                        }`}>
                                        {tx.type === "income" ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                    </div>
                                    <div>
                                        <div className="text-[0.9rem] font-medium text-gray-200">
                                            {tx.categories?.name || "Uncategorized"}
                                        </div>
                                        <div className="text-[0.75rem] text-muted">
                                            {tx.description || tx.transaction_date}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`font-semibold text-[0.9rem] ${tx.type === "income" ? "text-green-400" : "text-gray-200"
                                        }`}>
                                        {tx.type === "income" ? "+" : "-"}₹{Number(tx.amount).toLocaleString()}
                                    </span>
                                    <button
                                        onClick={() => deleteTransaction(tx.id)}
                                        className="p-2 text-muted hover:text-rose-400 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
