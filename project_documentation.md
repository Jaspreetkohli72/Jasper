# 📘 Personal Finance Tracker - Project Documentation

**Version:** 1.0.0
**Scope:** User Guide & System Architecture
**Repository:** [Jaspreetkohli72/testWallet](https://github.com/Jaspreetkohli72/testWallet.git)

---

# PART 1: User Guide

## 1. Introduction
This application is a modern, iOS-16 styled Personal Finance Tracker designed to help users manage their income, expenses, and budgets. It is built with **Streamlit** (Frontend) and **Supabase** (Backend/Database).

## 2. Features

### 📊 Dashboard
- **Financial Overview**: Real-time metrics for Total Balance, Total Income, and Total Expenses.
- **Budget Alerts**: Visual warnings (Red/Error) when category spending exceeds the defined monthly budget.
- **Visualizations**: 
    - **Income vs Expense**: Monthly bar chart comparison.
    - **Spending Breakdown**: Donut chart showing expense distribution by category.

### 💸 Transactions
- **Add New**:
    - Simple form to log Income or Expenses.
    - Date picker, Amount, Category selection (dynamic), and Description.
- **History**:
    - Tabular view of all recent transactions.

### ⚙️ Settings (Budget Management)
- **Budget Control**: Set specific monthly spending limits for each expense category.
- **Persistence**: Budgets are saved to Supabase and checked automatically against spending.

## 3. Design System (iOS 16 / Glassmorphism)
- **Aesthetic**: Uses translucency, blur effects (`backdrop-filter: blur(20px)`), and rounded corners to mimic the iOS 16 OEM design language.
- **Responsiveness**:
    - **Desktop**: Left Sidebar Navigation.
    - **Mobile**: Sticky Bottom Navigation (simulated via layout logic where applicable).
- **Typography**: Uses 'Inter' font to match the clean San Francisco system font look.

---

# PART 2: Technical Architecture

## 4. Tech Stack
- **Frontend**: Streamlit
- **Backend/Database**: Supabase (PostgreSQL)
- **Language**: Python 3.x
- **Visualization**: Plotly Express
- **ORM/Client**: `supabase-py`

## 5. Database Schema
The system uses three core tables in Supabase:

### `categories`
- `id` (UUID, PK): Unique identifier.
- `name` (Text): Category name (e.g., 'Food', 'Salary').
- `type` (Text): 'income' or 'expense'.
- `icon` (Text): Emoji icon.

### `transactions`
- `id` (UUID, PK): Unique identifier.
- `amount` (Numeric): Transaction value.
- `type` (Text): 'income' or 'expense'.
- `category_id` (UUID, FK): Link to `categories`.
- `transaction_date` (Date): Date of transaction.
- `description` (Text): User notes.

### `budgets`
- `id` (UUID, PK): Unique identifier.
- `category_id` (UUID, FK): Link to `categories`.
- `amount_limit` (Numeric): Monthly limit.
- `month_year` (Text): Format 'YYYY-MM'.

## 6. Setup & Deployment

### Prerequisites
1.  **Supabase Project**: Created with the provided schema (`db_schema.sql`).
2.  **Environment Variables**: `SUPABASE_URL` and `SUPABASE_KEY` configured in `utils/supabase_client.py` or `.streamlit/secrets.toml`.

### Installation
```bash
pip install -r requirements.txt
streamlit run app.py
```

## 7. Security & Notes
- **Authentication**: Currently uses Anonymous Key (Client-side safe). For multi-user support, Row Level Security (RLS) policies should be enabled on Supabase.
- **API Keys**: Hardcoded in `utils/supabase_client.py` for this specific deployment as per user request. In production, move to Environment Variables.
