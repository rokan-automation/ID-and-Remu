// এই ফাইলটি শুধুমাত্র সার্ভারে (API route) চলে — কখনো ব্রাউজারে যায় না।
// SUPABASE_SERVICE_ROLE_KEY এ NEXT_PUBLIC_ প্রিফিক্স নেই, তাই Next.js এটি
// ক্লায়েন্ট-সাইড জাভাস্ক্রিপ্ট বান্ডেলে কখনো পাঠাবে না — এটি সম্পূর্ণ গোপন থাকে।
//
// service_role key ডাটাবেজের Row Level Security (RLS) সম্পূর্ণ বাইপাস করে,
// তাই id_cards টেবিলে RLS চালু থাকলেও এই ক্লায়েন্ট দিয়ে সব কাজ করা সম্ভব হবে,
// কিন্তু ব্রাউজার থেকে সরাসরি (anon key দিয়ে) কেউ কিছু করতে পারবে না।

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "⚠️  SUPABASE_URL বা SUPABASE_SERVICE_ROLE_KEY সেট করা নেই। .env ফাইল চেক করুন।"
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
