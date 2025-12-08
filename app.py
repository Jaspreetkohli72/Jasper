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

def get_global_budget():
    current_month = datetime.now().strftime("%Y-%m")
    try:
        response = supabase.table('global_budgets').select("*").eq('month_year', current_month).execute()
        return response.data[0] if response.data else None
    except:
        return None

def check_budget_alerts(transactions_df, global_budget_data):
    alerts = []
    if transactions_df.empty or not global_budget_data:
        return alerts
    
    current_month = datetime.now().strftime("%Y-%m")
    total_spent = transactions_df[
        (pd.to_datetime(transactions_df['transaction_date']).dt.strftime('%Y-%m') == current_month) &
        (transactions_df['type'] == 'expense')
    ]['amount'].sum()
    
    limit = global_budget_data['amount_limit']
    
    if total_spent > limit:
        alerts.append(f"🚨 Over Total Budget: You've spent ${total_spent:,.2f} / ${limit:,.2f}")
    elif total_spent > (limit * 0.9):
         alerts.append(f"⚠️ Near Budget Limit: ${total_spent:,.2f} / ${limit:,.2f}")
         
    return alerts

# --- Navigation ---
# Sidebar for Desktop
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
    global_budget = get_global_budget()
    
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
        alerts = check_budget_alerts(df_tx, global_budget)
        for alert in alerts:
            st.error(alert)
        
        if global_budget:
            # Budget Progress Bar
            budget_val = global_budget['amount_limit']
            pct = min(total_expense / budget_val, 1.0)
            st.caption(f"Monthly Budget Progress: ${total_expense:,.0f} / ${budget_val:,.0f}")
            st.progress(pct)

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
                cat_spend = expenses.groupby('category').sum(numeric_only=True).reset_index() 
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
                        "amount": amount,
                        "type": tx_type,
                        "category_id": selected_cat_id,
                        "description": desc,
                        "transaction_date": tx_date.strftime("%Y-%m-%d")
                    }
                    try:
                        # user_id handling: Assuming single user or anon for now as per setup
                        supabase.table('transactions').insert(data).execute()
                        st.success("Transaction Saved!")
                        st.rerun()
                    except Exception as e:
                        st.error(f"Error: {e}")
                else:
                    st.error("Please enter a valid amount and category.")

    with tab2:
        st.subheader("Recent History")
        df_tx = get_transactions()
        if not df_tx.empty:
             if not categories.empty:
                cat_map = dict(zip(categories['id'], categories['name']))
                df_tx['category_name'] = df_tx['category_id'].map(cat_map)
                
             st.dataframe(
                df_tx[['transaction_date', 'type', 'category_name', 'amount', 'description']],
                use_container_width=True,
                hide_index=True
            )
        else:
            st.info("No history available.")

elif selected_page == "Settings":
    st.header("Settings")
    
    st.subheader("Monthly Budget Goal")
    st.info("Set a single total budget for all expenses this month.")
    
    current_month = datetime.now().strftime("%Y-%m")
    existing_budget = get_global_budget()
    default_val = float(existing_budget['amount_limit']) if existing_budget else 1000.0
    
    new_budget = st.number_input(f"Total Budget for {current_month}", value=default_val, step=100.0)
    
    if st.button("Save Monthly Budget"):
        data = {
            "amount_limit": new_budget,
            "month_year": current_month
        }
        try:
            if existing_budget:
                supabase.table('global_budgets').update(data).eq('id', existing_budget['id']).execute()
            else:
                 supabase.table('global_budgets').insert(data).execute()
            st.success(f"Budget updated to ${new_budget:,.2f}")
        except Exception as e:
            st.error(f"Failed to save budget: {e}")
            st.caption("Did you run the migration SQL?")
