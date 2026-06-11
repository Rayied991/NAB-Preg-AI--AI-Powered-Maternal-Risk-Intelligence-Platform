// import { createClient } from '@supabase/supabase-js';
// import * as dotenv from 'dotenv';

// dotenv.config({ path: 'd:/Coding/chp/NAB-Preg-AI--AI-Powered-Maternal-Risk-Intelligence-Platform/backend/.env' });

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// if (!supabaseUrl || !supabaseKey) {
//   console.error("Missing supabase credentials");
//   process.exit(1);
// }

// const supabase = createClient(supabaseUrl, supabaseKey);

// async function testInsert() {
//   const { data, error } = await supabase
//     .from('ocr_reports')
//     .insert([
//       {
//         patient_id: null,
//         extracted_text: "test",
//         parsed_json: { test: "test" },
//       }
//     ])
//     .select();

//   if (error) {
//     console.error("Error inserting:", error);
//   } else {
//     console.log("Success:", data);
//   }
// }

// testInsert();
