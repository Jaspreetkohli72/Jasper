"use client";

import React, { useState } from "react";
import { Home, BarChart2, Target, User, Plus, CreditCard, Users } from "lucide-react";

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
        <nav className="fixed left-1/2 bottom-[14px] -translate-x-1/2 w-[min(420px,calc(100%-32px))] rounded-[30px] p-[6px_10px] flex items-center justify-between gap-1 bg-[rgba(10,10,25,0.9)] border border-[rgba(255,255,255,0.08)] shadow-[0_18px_40px_rgba(0,0,0,0.95),0_0_0_1px_rgba(15,23,42,0.9)] backdrop-blur-[28px] saturate-[1.9] z-20 md:hidden">
            <Link href="/" className={`flex-1 flex flex-col items-center gap-[2px] text-[0.65rem] ${pathname === "/" ? "text-gray-200 opacity-100" : "text-muted opacity-90"}`}>
                <Home size={19} />
                <span>Home</span>
            </Link>

            <Link href="/insights" className={`flex-1 flex flex-col items-center gap-[2px] text-[0.65rem] ${pathname === "/insights" ? "text-gray-200 opacity-100" : "text-muted opacity-90"}`}>
                <BarChart2 size={19} />
                <span>Insights</span>
            </Link>

            <Link href="/contacts" className={`flex-1 flex flex-col items-center gap-[2px] text-[0.65rem] ${pathname === "/contacts" ? "text-gray-200 opacity-100" : "text-muted opacity-90"}`}>
                <Users size={19} />
                <span>Contacts</span>
            </Link>

            <Link href="/goals" className={`flex-1 flex flex-col items-center gap-[2px] text-[0.65rem] ${pathname === "/goals" ? "text-gray-200 opacity-100" : "text-muted opacity-90"}`}>
                <Target size={19} />
                <span>Budget</span>
            </Link>

            <Link href="/accounts" className={`flex-1 flex flex-col items-center gap-[2px] text-[0.65rem] ${pathname === "/accounts" ? "text-gray-200 opacity-100" : "text-muted opacity-90"}`}>
                <CreditCard size={19} />
                <span>Txns</span>
            </Link>
        </nav>
    );
}
