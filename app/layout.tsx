import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { FinanceProvider } from "@/context/FinanceContext";
import GlobalModalWrapper from "@/components/GlobalModalWrapper";
import type { Metadata, Viewport } from "next";
import { createClient } from "@/lib/supabaseServer";

export const metadata: Metadata = {
  title: "Jasper",
  description: "Personal finance cockpit",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jasper",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full" suppressHydrationWarning>
        <FinanceProvider initialData={initialData}>
          <div className="bg-layer" />
          <div className="bg-orb orb-1" />
          <div className="bg-orb orb-2" />
          <div className="bg-orb orb-3" />

          <div className="min-h-screen flex gap-[18px] max-w-[1200px] mx-auto md:p-5 lg:p-6">
            <Sidebar />
            <main className="flex-1 flex flex-col gap-4 px-4 pb-4 pt-6 md:p-0">{children}</main>
          </div>

          <MobileNav />
          <GlobalModalWrapper />
        </FinanceProvider>
      </body>
    </html>
  );
}
