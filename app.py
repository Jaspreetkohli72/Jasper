import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, date
from streamlit_option_menu import option_menu
from utils.supabase_client import init_supabase

# Page Config
st.set_page_config(
    page_title="My Wallet",
    page_icon="💸",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Load CSS
with open('assets/style.css') as f:
    st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

# Initialize DB
supabase = init_supabase()

# Session State
if 'page' not in st.session_state:
    st.session_state.page = "Dashboard"

# --- Helper Functions ---
def get_transactions():
    response = supabase.table('transactions').select("*").order('transaction_date', desc=True).execute()
    return pd.DataFrame(response.data) if response.data else pd.DataFrame()

def get_categories():
    response = supabase.table('categories').select("*").execute()
    return pd.DataFrame(response.data) if response.data else pd.DataFrame()

def get_budgets():
    response = supabase.table('budgets').select("*, categories(name)").execute()
    df = pd.DataFrame(response.data)
    if not df.empty:
        df['category_name'] = df['categories'].apply(lambda x: x['name'] if x else 'Unknown')
    return df

def check_budget_alerts(transactions_df, budgets_df):
    alerts = []
    if transactions_df.empty or budgets_df.empty:
        return alerts
    
    current_month = datetime.now().strftime("%Y-%m")
    # Filter this month's expenses
    this_month_tx = transactions_df[
        (pd.to_datetime(transactions_df['transaction_date']).dt.strftime('%Y-%m') == current_month) &
        (transactions_df['type'] == 'expense')
    ]
    
    # Group by category
    spending = this_month_tx.groupby('category_id')['amount'].sum().reset_index()
    
    # Merge with budgets
    merged = pd.merge(budgets_df, spending, on='category_id', how='left')
    merged['amount'] = merged['amount'].fillna(0)
    
    for _, row in merged.iterrows():
        if row['amount'] > row['amount_limit']:
            alerts.append(f"🚨 Over Budget: {row['category_name']} ({row['amount']} / {row['amount_limit']})")
    return alerts

# --- Navigation ---
# Sidebar for Desktop, Bottom for Mobile (simulated via layout)
with st.sidebar:
    st.image("https://img.icons8.com/3d-fluency/94/wallet.png", width=60)
    st.title("My Wallet")
    
    selected_page = option_menu(
        menu_title=None,
        options=["Dashboard", "Transactions", "Settings"],
        icons=["speedometer2", "list-task", "gear"],
        menu_icon="cast",
        default_index=0,
        styles={
            "container": {"padding": "0!important", "background-color": "transparent"},
            "icon": {"color": "#86868b", "font-size": "20px"}, 
            "nav-link": {
                "font-family": "SF Pro Display, sans-serif",
                "font-size": "17px", 
                "text-align": "left", 
                "margin": "8px", 
                "padding": "12px",
                "border-radius": "16px",
                "--hover-color": "rgba(255,255,255,0.1)",
                "color": "#ffffff",
                "font-weight": "500"
            },
            "nav-link-selected": {
                "background": "linear-gradient(135deg, #0A84FF 0%, #007aff 100%)", 
                "color": "white",
                "box-shadow": "0 4px 15px rgba(0, 122, 255, 0.4)",
                "font-weight": "600"
            },
        }
    )

# --- Pages ---

if selected_page == "Dashboard":
    st.header("Dashboard")
    
    # Fetch Data
    df_tx = get_transactions()
    df_budgets = get_budgets()
    
    if not df_tx.empty:
        # Metrics
        total_income = df_tx[df_tx['type'] == 'income']['amount'].sum()
        total_expense = df_tx[df_tx['type'] == 'expense']['amount'].sum()
        balance = total_income - total_expense
        
        col1, col2, col3 = st.columns(3)
        col1.metric("Total Balance", f"${balance:,.2f}")
        col2.metric("Total Income", f"${total_income:,.2f}", delta_color="normal")
        col3.metric("Total Expenses", f"${total_expense:,.2f}", delta_color="inverse")
        
        # Alerts
        alerts = check_budget_alerts(df_tx, df_budgets)
        for alert in alerts:
            st.error(alert)
        
        # Charts
        c1, c2 = st.columns((2, 1))
        with c1:
            st.subheader("Income vs Expense")
            monthly_data = df_tx.groupby([pd.to_datetime(df_tx['transaction_date']).dt.to_period('M').astype(str), 'type'])['amount'].sum().reset_index()
            fig = px.bar(monthly_data, x='transaction_date', y='amount', color='type', barmode='group', 
                         color_discrete_map={'income': '#34C759', 'expense': '#FF3B30'},
                         labels={'transaction_date': 'Month', 'amount': 'Amount'})
            fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig, use_container_width=True)
            
        with c2:
            st.subheader("Spending by Category")
            expenses = df_tx[df_tx['type'] == 'expense']
            if not expenses.empty:
                cat_spend = expenses.groupby('category').sum(numeric_only=True).reset_index() # Need category name join ideally, currently using ID or description if manually entered
                # Fetch category names mapping
                cats = get_categories()
                if not cats.empty:
                    cat_map = dict(zip(cats['id'], cats['name']))
                    expenses['category_name'] = expenses['category_id'].map(cat_map)
                    cat_spend = expenses.groupby('category_name')['amount'].sum().reset_index()
                
                fig2 = px.donut(cat_spend, values='amount', names='category_name', hole=0.6)
                fig2.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', showlegend=False)
                st.plotly_chart(fig2, use_container_width=True)
    else:
        st.info("No recent transactions found. Go to 'Transactions' to add one.")

elif selected_page == "Transactions":
    st.header("Transactions")
    
    tab1, tab2 = st.tabs(["Add New", "History"])
    
    categories = get_categories()
    
    with tab1:
        st.subheader("Add Transaction")
        with st.form("add_tx_form", clear_on_submit=True):
            col_a, col_b = st.columns(2)
            with col_a:
                tx_type = st.radio("Type", ["income", "expense"], horizontal=True)
                amount = st.number_input("Amount", min_value=0.0, step=0.01)
            with col_b:
                tx_date = st.date_input("Date", date.today())
                if not categories.empty:
                    cat_options = categories[categories['type'] == tx_type]
                    category = st.selectbox("Category", list(cat_options['name']), index=0 if not cat_options.empty else None)
                    selected_cat_id = cat_options[cat_options['name'] == category]['id'].iloc[0] if not cat_options.empty else None
                else:
                    st.warning("No categories found. Please add them in database.")
                    selected_cat_id = None
            
            desc = st.text_input("Note / Description")
            
            submitted = st.form_submit_button("Save Transaction")
            if submitted:
                if amount > 0 and selected_cat_id:
                    data = {
                        "user_id": supabase.auth.uid, # Might be None if generic anon
                        "amount": amount,
                        "type": tx_type,
                        "category_id": selected_cat_id,
                        "description": desc,
                        "transaction_date": tx_date.strftime("%Y-%m-%d")
                    }
                    try:
                        # Remove user_id if authentication is not set up (using anonymous for this demo)
                        del data['user_id']
                        supabase.table('transactions').insert(data).execute()
                        st.success("Transaction Saved!")
                        st.rerun() # Refresh
                    except Exception as e:
                        st.error(f"Error: {e}")
                else:
                    st.error("Please enter a valid amount and category.")

    with tab2:
        st.subheader("Recent History")
        df_tx = get_transactions()
        if not df_tx.empty:
            # Join with category names
             if not categories.empty:
                cat_map = dict(zip(categories['id'], categories['name']))
                df_tx['category_name'] = df_tx['category_id'].map(cat_map)
                
            # Display
             st.dataframe(
                df_tx[['transaction_date', 'type', 'category_name', 'amount', 'description']],
                use_container_width=True,
                hide_index=True
            )
        else:
            st.info("No history available.")

elif selected_page == "Settings":
    st.header("Settings & Budgets")
    
    st.subheader("Set Monthly Budgets")
    categories = get_categories()
    if not categories.empty:
        expense_cats = categories[categories['type'] == 'expense']
        
        # Current budgets
        budgets = get_budgets()
        
        for idx, row in expense_cats.iterrows():
            current_month = datetime.now().strftime("%Y-%m")
            
            # Find existing budget
            existing_limit = 0.0
            if not budgets.empty:
                match = budgets[(budgets['category_id'] == row['id']) & (budgets['month_year'] == current_month)]
                if not match.empty:
                    existing_limit = match.iloc[0]['amount_limit']
            
            with st.expander(f"Budget for {row['name']}"):
                new_limit = st.number_input(f"Limit for {row['name']}", value=float(existing_limit), key=f"bud_{row['id']}")
                if st.button(f"Save {row['name']}", key=f"btn_{row['id']}"):
                    # Upsert logic
                    data = {
                        "category_id": row['id'],
                        "amount_limit": new_limit,
                        "month_year": current_month
                    }
                    try:
                        # Check exist
                        if not budgets.empty and not budgets[(budgets['category_id'] == row['id']) & (budgets['month_year'] == current_month)].empty:
                            bid = budgets[(budgets['category_id'] == row['id']) & (budgets['month_year'] == current_month)].iloc[0]['id']
                            supabase.table('budgets').update({"amount_limit": new_limit}).eq('id', bid).execute()
                        else:
                            supabase.table('budgets').insert(data).execute()
                        st.balloons()
                    except Exception as e:
                        st.error(f"Failed to save: {e}")
    else:
        st.warning("No categories to set budgets for.")
