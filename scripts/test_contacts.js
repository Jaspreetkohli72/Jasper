const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');

// Manual parser
try {
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        const lines = envFile.split('\n');
        lines.forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                let key = match[1].trim();
                let val = match[2].trim();
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.slice(1, -1);
                }
                process.env[key] = val;
            }
        });
    } else {
        console.warn("Warning: .env.local not found at", envPath);
    }
} catch (e) {
    console.error("Manual env parsing failed:", e.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. Checked .env.local");
    process.exit(1);
}

console.log("Supabase URL:", supabaseUrl);
// console.log("Supabase Key found:", !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testContactsFeature() {
    console.log("Starting Contacts Feature Test...");

    // 1. Test Creating a Contact
    const contactName = `Test Contact ${Date.now()}`;
    console.log(`Attempting to create contact: ${contactName}`);

    const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .insert([{ name: contactName, phone: '1234567890' }])
        .select()
        .single();

    if (contactError) {
        if (contactError.code === '42P01') { // undefined_table
            console.error("❌ FAILURE: 'contacts' table does not exist.");
            console.error("ACTION REQUIRED: Run the SQL in 'db_schema_update.sql' in your Supabase SQL Editor.");
        } else {
            console.error("❌ FAILURE: Error creating contact:", contactError);
        }
        return;
    }

    console.log("✅ SUCCESS: Contact created:", contact);

    // 2. Test Creating a Linked Transaction
    console.log("Attempting to create linked transaction...");
    const { data: tx, error: txError } = await supabase
        .from('transactions')
        .insert([{
            amount: 100,
            type: 'expense',
            description: 'Test Expense with Contact',
            contact_id: contact.id,
            transaction_date: new Date().toISOString()
        }])
        .select()
        .single();

    if (txError) {
        console.error("❌ FAILURE: Error creating transaction:", txError);
        return;
    }

    console.log("✅ SUCCESS: Linked transaction created:", tx);
    console.log("🎉 All Tests Passed!");
}

testContactsFeature();
