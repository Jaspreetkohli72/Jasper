"use client";
import React from "react";
import Analytics from "../../components/Dashboard/Analytics";

export default function InsightsPage() {
    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-[1.1rem] font-semibold text-text px-2">Financial Insights</h2>
            <Analytics />
        </div>
    );
}
