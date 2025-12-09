const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tgxwxzqmtrwkcervbadm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRneHd4enFtdHJ3a2NlcnZiYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNjUzNjcsImV4cCI6MjA4MDc0MTM2N30.wr9_pBeUDF6Fx3JteY2E_SZ8xPkJY2jedNdBn0T0lpY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchema() {
    console.log("Applying Database Schema...");

    // 1. Create Contacts Table
    const createContactsSQL = `
    CREATE TABLE IF NOT EXISTS contacts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  `;

    const { error: error1 } = await supabase.rpc('exec_sql', { sql_query: createContactsSQL });
    // Note: exec_sql RPC might not exist. If not, we can't run DDL via JS client easily without a stored procedure.
    // Standard Supabase JS client only supports DML (Data Manipulation) not DDL (Data Definition) directly on tables unless using RPC.

    // WAIT. Regular client cannot run CREATE TABLE unless there's a specific RPC function exposed.
    // Did the user enable an RPC for arbitrary SQL? Unlikely.

    // Verification Strategy:
    // If I can't run DDL, I cannot effectively "apply" the schema via this script if the standard table endpoints don't exist.
    // However, I can TRY.
    // Actually, there is no direct way to run raw SQL via the client unless an RPC is set up.

    // Alternative:
    // I will just try to INSERT into 'contacts'. If it fails with "relation does not exist", I verify that.
    // But wait, the USER gave me keys to Fix it.

    // Maybe I can try to use the REST API 'query' if enabled? No.

    // Let's assume I CANNOT create tables via the JS Client anon key.
    // I will just UPDATE .env.local and then ask the user to run SQL.
    // But I can try to see if the table already exists (maybe they ran it?).

    console.log("Checking connectivity...");
    const { data, error } = await supabase.from('contacts').select('*').limit(1);

    if (error) {
        console.error("Connection successful, but error accessing contacts:", error.message);
        if (error.code === '42P01') {
            console.log("Result: Table 'contacts' does NOT exist.");
        }
    } else {
        console.log("Result: Table 'contacts' EXISTS and is accessible.");
    }
}

applySchema();
