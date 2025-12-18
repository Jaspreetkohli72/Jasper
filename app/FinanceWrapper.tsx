import { createClient } from "@/lib/supabaseServer";
import { FinanceProvider } from "@/context/FinanceContext";

export default async function FinanceWrapper({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Parallel Fetching on Server
    const [
        { data: cats },
        { data: conts },
        { data: txs },
        { data: budgets },
        { data: catBudgets }
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

    const initialData = {
        categories: cats || [],
        contacts: conts || [],
        transactions: txs || [],
        globalBudget: budgets || null,
        categoryBudgets: catBudgets || []
    };

    return (
        <FinanceProvider initialData={initialData}>
            {children}
        </FinanceProvider>
    );
}
