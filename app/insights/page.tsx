"use client";
import React from "react";
import Analytics from "../../components/Dashboard/Analytics";
import DetailedAnalytics from "../../components/Insights/DetailedAnalytics";

export default function InsightsPage() {
    return (
        <div className="flex flex-col gap-4 pb-24">
            <header className="flex items-center justify-between px-3 pt-0 pb-2">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[1.2rem] font-semibold text-text">Financial Insights</span>
                </div>
            </header>
            <Analytics />
            <DetailedAnalytics />
        </div>
    );
}
