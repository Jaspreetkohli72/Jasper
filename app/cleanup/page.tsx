"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Category = {
    id: string;
    name: string;
};

export default function CleanupPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [cats, setCats] = useState<Category[]>([]);

    const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

    useEffect(() => {
        const listAndCleanup = async () => {
            try {
                addLog("Fetching ALL categories...");
                const { data: allCats, error } = await supabase.from("categories").select("*");
                if (error) throw error;

                const typedCats: Category[] = allCats || [];
                setCats(typedCats);
                addLog(`Total categories found: ${typedCats.length}`);

                const targets = typedCats.filter((c) => ["Rent", "Health", "Utilities"].includes(c.name));
                addLog(`Target categories found: ${targets.length} (${targets.map((c) => c.name).join(", ")})`);

                if (targets.length === 0) {
                    addLog("Checking for fuzzy matches...");
                    const fuzzy = typedCats.filter((c) => /rent|health|utilities/i.test(c.name));
                    addLog(`Fuzzy matches: ${fuzzy.length} (${fuzzy.map((c) => c.name).join(", ")})`);
                }

                if (targets.length > 0) {
                    const ids = targets.map((c) => c.id);
                    addLog(`Deleting ${ids.length} categories...`);

                    // Delete dependants
                    await supabase.from("transactions").delete().in("category_id", ids);
                    await supabase.from("budgets").delete().in("category_id", ids);

                    const { error: delError } = await supabase.from("categories").delete().in("id", ids);
                    if (delError) {
                        addLog(`DELETE ERROR: ${delError.message}`);
                        console.error(delError);
                    } else {
                        addLog("Deletion successful.");
                    }
                }

            } catch (err: any) {
                addLog(`ERROR: ${err.message || "Unknown error"}`);
            }
        };
        listAndCleanup();
    }, []);

    return (
        <div className="p-10 bg-slate-900 h-screen text-white overflow-auto font-mono text-xs">
            <h1 className="text-xl font-bold mb-4">Cleanup Debug</h1>
            <div className="mb-4 text-green-300">
                Logs:
                {logs.map((l, i) => <div key={i}>{l}</div>)}
            </div>
            <div>
                All Categories:
                <ul className="list-disc pl-5">
                    {cats.map((c) => (
                        <li key={c.id}>{c.id}: "{c.name}"</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
