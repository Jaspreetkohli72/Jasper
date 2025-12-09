# Jasper

A modern, glassmorphic personal finance cockpit built with Next.js, Tailwind CSS, and Supabase.

![Jasper Dashboard](file:///C:/Users/Jaskaran/.gemini/antigravity/brain/64baa5ab-e68d-4be6-84a6-b19b3f8e5ae6/jasper_final_verify.png)

## Features

- **Dashboard**: Real-time overview of your financial health (Net Balance, Income, Expenses).
- **Jasper Layout**: 2-column responsive design optimized for financial clarity.
    - **Spending Overview**: Directly correlates category spending with your net balance.
    - **Cashflow Trend**: Visualizes your surplus history and savings rate over time.
- **Transactions**: Add, view, and delete income/expense records with category tagging.
- **Budgets & Goals**:
    - **Category Budgeting**: Set precise limits for `Food`, `Shopping`, `Travel`, etc.
    - **Global Budget**: Monthly spending cap enforcement.
- **Analytics**:
    - **Pulse Metrics**: Savings Rate, Runway (No Burn / Months left), Spending vs Budget.
    - **Solvency Warning**: Smart alerts when your budget is insolvent against your balance.
- **PWA Support**: Installable on mobile with native-like feel (`viewport-fit=cover`) and custom icons.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS (v4) + Custom CSS Variables (Glassmorphism)
- **Backend**: Supabase (PostgreSQL)
- **State**: React Context API (`FinanceContext`)
- **Icons**: Lucide React + Custom Jasper Assets

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd jasper
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create `.env.local` with your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

5.  **Deployment (Vercel)**:
    When deploying to Vercel, **you must add the following Environment Variables** in the Project Settings:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    
    *Without these, the build will fail or the app will not function.*


## Project Structure

- `/app`: Next.js App Router pages.
- `/components`: UI Logic (`Sidebar`, `BalanceCard`, `Analytics`).
- `/context`: Global state (`FinanceContext`).
- `/public`: Static assets (Jasper logos, manifest).

## Production Build

To build and run for production:
```bash
npm run build
npm start
```

## Recent Updates (Jasper v1.0)
- **Rebranding**: Complete migration from "Aurora Ledger" to "Jasper".
- **UX Polish**: Removed confusing decimals (`₹0` instead of `₹0.0k`), fixed layout gaps, and enhanced mobile responsiveness.
- **Infrastructure**: Cleaned up conflicting configuration and optimized build artifacts.
- **Production Readiness**: Fixed data fetching issues (406 errors) and verified production build stability.
