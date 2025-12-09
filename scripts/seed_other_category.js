
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addOtherCategories() {
    const types = ['expense', 'income'];

    for (const type of types) {
        // Check if it exists
        const { data: existing, error: fetchError } = await supabase
            .from('categories')
            .select('*')
            .eq('name', 'Other')
            .eq('type', type)
            .maybeSingle();

        if (fetchError) {
            console.error(`Error fetching ${type} Other category:`, fetchError);
            continue;
        }

        if (!existing) {
            console.log(`Creating "Other" category for ${type}...`);
            const { data, error } = await supabase
                .from('categories')
                .insert([
                    { name: 'Other', type: type, icon: '📦' } // Using a box icon for now
                ]);

            if (error) {
                console.error(`Error creating ${type} Other category:`, error);
            } else {
                console.log(`Created "Other" category for ${type}.`);
            }
        } else {
            console.log(`"Other" category for ${type} already exists.`);
        }
    }
}

addOtherCategories();
