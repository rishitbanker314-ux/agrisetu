require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('fields').select('id, name, boundary').limit(1);
  if (error) {
    console.error("ERROR:", error.message);
  } else {
    console.log("SUCCESS. Data:", data);
  }
}
check();
