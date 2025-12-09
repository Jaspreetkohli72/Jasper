"use client";

import React, { useState } from "react";
import { Home, BarChart2, Target, User, Plus, CreditCard } from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFinance } from "../context/FinanceContext";

export default function MobileNav() {
    const pathname = usePathname();
    const { openAddTxModal } = useFinance();

    const navItems = [
        { name: "Home", icon: Home, href: "/" },
        { name: "Insights", icon: BarChart2, href: "/insights" },
    ];

    const rightNavItems = [
        { name: "Budget", icon: Target, href: "/goals" }, // Mapping to goals for now or new budget page
        { name: "Transactions", icon: CreditCard, href: "/accounts" }, // Mapping to accounts for placeholder
    ];

    return (
        <nav className="fixed left-1/2 bottom-[14px] -translate-x-1/2 w-[min(420px,calc(100%-32px))] rounded-[30px] p-[6px_10px] flex items-center justify-between gap-1.5 bg-[rgba(10,10,25,0.9)] border border-[rgba(255,255,255,0.08)] shadow-[0_18px_40px_rgba(0,0,0,0.95),0_0_0_1px_rgba(15,23,42,0.9)] backdrop-blur-[28px] saturate-[1.9] z-20 md:hidden">
            {navItems.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    className={`flex-1 flex flex-col items-center gap-[2px] text-[0.65rem] ${pathname === item.href ? "text-gray-200 opacity-100" : "text-muted opacity-90"
                        }`}
                >
                    <item.icon size={19} />
                    <span>{item.name}</span>
                </Link>
            ))}

            <div className="flex-none relative -translate-y-3">
                <button
                    onClick={openAddTxModal}
                    className="w-[54px] h-[54px] rounded-full border-none bg-[radial-gradient(circle_at_20%_0,#fff_0,#5b8dff_35%,#7c3aed_70%,#020617_100%)] shadow-[0_20px_40px_rgba(15,23,42,0.95),0_0_0_2px_rgba(148,163,184,0.4)] flex items-center justify-center text-[#f9fafb] cursor-pointer"
                >
                    <Plus size={24} strokeWidth={3} />
                </button>
            </div>

            {rightNavItems.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    className={`flex-1 flex flex-col items-center gap-[2px] text-[0.65rem] ${pathname === item.href ? "text-gray-200 opacity-100" : "text-muted opacity-90"
                        }`}
                >
                    <item.icon size={19} />
                    <span>{item.name}</span>
                </Link>
            ))}
        </nav>
    );
}
