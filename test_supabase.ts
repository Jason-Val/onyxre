import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('leads').select('*').limit(1);
  if (error) {
    console.error('Error fetching leads:', error);
  } else {
    console.log('Leads schema (first row):', Object.keys(data[0] || {}));
    console.log('Lead row:', data[0]);
  }
}
main();
