import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import GlobalModalWrapper from "@/components/GlobalModalWrapper";
import type { Metadata, Viewport } from "next";
import FinanceWrapper from "./FinanceWrapper";
import Loading from "./loading";
import { Suspense } from "react";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full" suppressHydrationWarning>
        <div className="bg-layer" />
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <div className="bg-orb orb-3" />

        <Suspense fallback={<Loading />}>
          <FinanceWrapper>
            <div className="min-h-screen flex gap-[18px] max-w-[1200px] mx-auto md:p-5 lg:p-6">
              <Sidebar />
              <main className="flex-1 flex flex-col gap-4 px-4 pb-4 pt-2 md:p-0">
                {children}
              </main>
            </div>

            <MobileNav />
            <GlobalModalWrapper />
          </FinanceWrapper>
        </Suspense>
      </body>
    </html>
  );
}
