import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// এই এন্ডপয়েন্টটা Vercel Cron Job (vercel.json এ শিডিউল করা) নিয়মিত কল করবে,
// যাতে Supabase প্রজেক্টে সব সময় কিছু না কিছু "activity" থাকে — এতে Free
// Tier এর ৭ দিন-অনিয়ন্ত্রিত-থাকলে-অটো-পজ হওয়ার নিয়মে প্রজেক্ট আর pause হবে না।
//
// অপশনাল সুরক্ষা: Vercel নিজে থেকে এই রিকোয়েস্টে
// "Authorization: Bearer <CRON_SECRET>" হেডার পাঠায় (যদি CRON_SECRET env
// variable সেট করা থাকে)। সেট করলে অন্য কেউ এই এন্ডপয়েন্ট বারবার কল করে
// অকারণে ডাটাবেজে লোড দিতে পারবে না।
export async function GET(request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // শুধু একটা হালকা কোয়েরি — কোনো ডেটা পরিবর্তন হয় না, শুধু Supabase-কে
    // জানানো হয় প্রজেক্টটা এখনো ব্যবহার হচ্ছে
    const { error } = await supabaseAdmin.from("id_cards").select("id").limit(1);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, pinged_at: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
