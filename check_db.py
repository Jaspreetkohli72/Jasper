from utils.supabase_client import init_supabase
import sys

try:
    client = init_supabase()
    print("Client initialized.")
    
    # Test Select
    print("Testing 'transactions' select...")
    res = client.table('transactions').select("*").limit(1).execute()
    print("Transactions Table Accessible.")
    print(res)
    
    print("Testing 'categories' select...")
    res = client.table('categories').select("*").limit(1).execute()
    print("Categories Table Accessible.")
    
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
