-- ============================================================
--  ID Card System — Supabase Schema
--  নতুন Supabase প্রজেক্ট খোলার পর SQL Editor এ গিয়ে এই পুরো
--  ফাইলটা এক সাথে Run করুন (Supabase Dashboard → SQL Editor → New query)
-- ============================================================

-- মূল টেবিল: স্টুডেন্টদের সব তথ্য এখানে থাকে
create table if not exists public.id_cards (
  id                    bigint generated always as identity primary key,
  student_name          text,
  class_roll             text,
  class_name             text,
  department            text,
  session               text,
  mobile                text,
  blood_group            text,
  photo                 text,   -- base64 ছবি ডেটা
  photo_x               numeric default 0,
  photo_y               numeric default 0,
  principal_signature    text,   -- base64 সিগনেচার ডেটা
  print_count            integer default 0,
  created_at            timestamptz default now()
);

-- Row Level Security চালু করা হলো — কিন্তু ইচ্ছাকৃতভাবে কোনো policy
-- দেওয়া হচ্ছে না। মানে anon/authenticated কোনো কী দিয়ে ব্রাউজার থেকে
-- সরাসরি এই টেবিলে অ্যাক্সেস করা যাবে না — সব কাজ Next.js API route
-- এর ভেতর দিয়ে হয়, যেখানে service_role key ব্যবহার করা হয়
-- (service_role RLS সম্পূর্ণ বাইপাস করে, তাই সেখান থেকে কাজ করবে)।
alter table public.id_cards enable row level security;


-- ঐচ্ছিক: পুরনো প্রজেক্টে sms_logs নামে একটা টেবিল ছিল, তবে বর্তমান
-- অ্যাপের কোডে এটা কোথাও ব্যবহার হয় না। ভবিষ্যতে SMS নোটিফিকেশন
-- ফিচার লাগলে এটা রাখতে পারেন, নাহলে এই অংশটা স্কিপ করে দিতে পারেন।
create table if not exists public.sms_logs (
  id          bigint generated always as identity primary key,
  student_id   bigint references public.id_cards (id) on delete cascade,
  phone       text,
  message     text,
  status      text,
  created_at  timestamptz default now()
);
alter table public.sms_logs enable row level security;


-- নোট: পুরনো admin_settings টেবিলটা নতুন প্রজেক্টে বানানোর দরকার নেই।
-- এখন এডমিন পাসওয়ার্ড ডাটাবেজে না রেখে, .env ফাইলের ADMIN_PASSWORD
-- ভ্যারিয়েবলে (সার্ভার-সাইডে) রাখা হয় — README.md এ বিস্তারিত আছে।
