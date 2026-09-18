# স্মার্ট আইডি কার্ড / হাজিরা সিস্টেম

Birganj Govt. Degree College এর জন্য বানানো স্টুডেন্ট আইডি কার্ড জেনারেটর।
Next.js (App Router) + Supabase দিয়ে বানানো।

## 🔒 এই ভার্সনে কী পরিবর্তন হয়েছে (সিকিউরিটি ফিক্স)

আগের ভার্সনে দুইটা বড় সমস্যা ছিল:

1. **Admin login ব্রাউজারেই যাচাই হতো** (`localStorage`), তাই যে কেউ ব্রাউজারের
   Developer Console খুলে এক লাইন কোড চালিয়ে (`localStorage.setItem(...)`)
   কোনো পাসওয়ার্ড ছাড়াই সরাসরি Admin Dashboard-এ ঢুকে যেতে পারতো।
2. **Supabase-এর সাথে সরাসরি ব্রাউজার থেকে কানেকশন হতো** (anon key দিয়ে),
   তাই RLS policy ঠিকভাবে সেট করা না থাকলে যেকেউ পাবলিক anon key ব্যবহার
   করে সরাসরি সব স্টুডেন্টের ডেটা (নাম, মোবাইল নম্বর, ছবি) পড়তে পারতো।

**এখন যা হয়:**
- ব্রাউজার আর কখনো Supabase-এর সাথে সরাসরি কথা বলে না। সব ডেটাবেজ
  অপারেশন (`/src/app/api/...`) Next.js সার্ভারের ভেতর দিয়ে হয়, যেখানে
  গোপন `service_role` key ব্যবহার হয় — এটা ব্রাউজারে কখনো যায় না।
- Admin পাসওয়ার্ড এখন `.env` এ (`ADMIN_PASSWORD`) থাকে, কোনো ডাটাবেজ
  টেবিলে না। লগইন সফল হলে সার্ভার একটা **httpOnly, সাইন করা কুকি** সেট
  করে দেয় — এটা ব্রাউজারের JavaScript দিয়ে পড়া বা এডিট করা সম্ভব না।
- `id_cards` টেবিলে Row Level Security (RLS) চালু আছে, কিন্তু কোনো policy
  নেই — মানে anon key দিয়ে ব্রাউজার থেকে কেউ কিছুই করতে পারবে না।

## 🚀 লোকাল সেটআপ

```bash
npm install
cp .env.example .env
# .env ফাইল খুলে নিজের Supabase URL, service_role key, admin পাসওয়ার্ড
# আর একটা র‍্যান্ডম session secret বসিয়ে দিন
npm run dev
```

`http://localhost:3000` এ গেলে সরাসরি `/id-generator` এ রিডাইরেক্ট হবে।

## 🗄️ Supabase সেটআপ (নতুন প্রজেক্ট)

1. [supabase.com](https://supabase.com) এ নতুন প্রজেক্ট বানান।
2. Dashboard → **SQL Editor** → New query → এই রিপোর `supabase_setup.sql`
   ফাইলের পুরো কনটেন্ট পেস্ট করে **Run** করুন। এটা `id_cards` টেবিল বানিয়ে
   দেবে এবং RLS চালু করে দেবে।
3. Dashboard → **Project Settings → API** থেকে:
   - **Project URL** → `.env` এর `SUPABASE_URL`
   - **service_role secret** (Reveal করে কপি করুন) → `.env` এর
     `SUPABASE_SERVICE_ROLE_KEY`

## ☁️ Vercel-এ ডিপ্লয়

1. GitHub-এ রিপো পুশ করুন, Vercel-এ ইমপোর্ট করুন।
2. Project → **Settings → Environment Variables** এ গিয়ে এই ৪টা যুক্ত করুন
   (Production ও Preview দুটোতেই):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
3. Deploy করুন (বা env variable যুক্ত করার পর একটা নতুন Redeploy করুন)।

## 📁 প্রজেক্ট স্ট্রাকচার (নতুন যা অ্যাড হয়েছে)

```
src/
  app/
    page.js                    ← রুট থেকে /id-generator এ রিডাইরেক্ট
    id-generator/page.js       ← মূল অ্যাপ (এখন fetch() দিয়ে API কল করে)
    api/
      admin/
        login/route.js         ← পাসওয়ার্ড যাচাই + কুকি সেট
        logout/route.js        ← কুকি ক্লিয়ার
        session/route.js       ← আগে থেকে লগইন আছে কিনা চেক
      students/
        route.js                ← GET (এডমিন-অনলি লিস্ট) / POST (পাবলিক রেজিস্ট্রেশন)
        [id]/route.js           ← PUT/DELETE (এডমিন-অনলি)
        print/route.js         ← প্রিন্ট কাউন্ট বাড়ানো (এডমিন-অনলি)
  lib/
    session.js                 ← কুকি সাইন/ভেরিফাই করার লজিক
    supabaseAdmin.js           ← সার্ভার-অনলি Supabase ক্লায়েন্ট (service_role)
    adminAuth.js                ← রিকোয়েস্ট এডমিন কিনা চেক করার হেল্পার
supabase_setup.sql              ← নতুন Supabase প্রজেক্টে রান করার SQL
.env.example                   ← কোন env variable লাগবে তার টেমপ্লেট
```

## ⏰ Supabase অটো-পজ এড়ানো (Keep-Alive Cron)

Supabase Free Tier-এ ৭ দিন কোনো activity না থাকলে প্রজেক্ট অটোমেটিক pause
হয়ে যায়। এটা এড়াতে একটা Vercel Cron Job যুক্ত করা হয়েছে যা রোজ একবার
(`/api/cron/keep-alive`) একটা হালকা কোয়েরি চালিয়ে Supabase-কে "active" রাখে।

- এটা `vercel.json` ফাইলে ডিফাইন করা আছে — কোনো extra সেটআপ লাগবে না,
  Vercel-এ ডিপ্লয় করলেই এটা নিজে থেকে শিডিউল হয়ে যাবে।
- চেক করতে: Vercel Dashboard → আপনার প্রজেক্ট → **Settings → Cron Jobs**
  এ গিয়ে দেখুন `keep-alive` জব লিস্টে আছে কিনা।
- ঐচ্ছিক (অতিরিক্ত সুরক্ষা): `.env` এ একটা `CRON_SECRET` (কোনো র‍্যান্ডম
  স্ট্রিং) যুক্ত করলে শুধু Vercel-এর নিজের cron কলই এই এন্ডপয়েন্ট চালাতে
  পারবে, অন্য কেউ URL জেনে বারবার হিট করতে পারবে না।

## ⚠️ এখনো যা মনে রাখা ভালো

- `ADMIN_PASSWORD` আর `SESSION_SECRET` — এই দুইটা কাউকে শেয়ার করবেন না,
  আর `.env` ফাইল কখনো GitHub-এ পুশ করবেন না (`.gitignore` তে এমনিতেই বন্ধ আছে)।
- স্টুডেন্ট রেজিস্ট্রেশন ফর্ম (POST `/api/students`) এখনো পাবলিক — মানে
  ইন্টারনেটে ঠিকানা জানলে কেউ স্প্যাম এন্ট্রি জমা দিতে পারে। ভবিষ্যতে চাইলে
  এখানে reCAPTCHA বা rate-limiting যুক্ত করা যায়।
- Supabase-এর ফ্রি প্ল্যানে ~৭ দিন প্রজেক্ট অব্যবহৃত থাকলে সেটা pause হয়ে
  যায় — উপরে বর্ণিত keep-alive cron চালু থাকলে এটা হওয়ার কথা না, কিন্তু
  যদি তাও pause হয়ে যায়, Supabase Dashboard এ গিয়ে Restore করে নিতে হবে।
