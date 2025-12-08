import os
from supabase import create_client, Client
import streamlit as st

# Initialize connection
# Uses st.secrets or direct input for this task as requested to use provided keys
SUPABASE_URL = "https://tgxwxzqmtrwkcervbadm.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRneHd4enFtdHJ3a2NlcnZiYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNjUzNjcsImV4cCI6MjA4MDc0MTM2N30.wr9_pBeUDF6Fx3JteY2E_SZ8xPkJY2jedNdBn0T0lpY"

@st.cache_resource
def init_supabase() -> Client:
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        st.error(f"Failed to initialize Supabase: {e}")
        return None
