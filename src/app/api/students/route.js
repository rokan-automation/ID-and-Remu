import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminRequest } from "@/lib/adminAuth";

// এডমিন ড্যাশবোর্ডের জন্য — সব স্টুডেন্টের লিস্ট আনা।
// এই কলটা এখন সার্ভারে service_role key দিয়ে হয়, তাই ব্রাউজার থেকে
// কেউ anon key দিয়ে সরাসরি পুরো লিস্ট টানতে পারবে না।
export async function GET() {
  const authorized = await isAdminRequest();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("id_cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// স্টুডেন্ট রেজিস্ট্রেশন ফর্ম থেকে নতুন এন্ট্রি অ্যাড করা — এটি পাবলিক
// (লগইন ছাড়াই কাজ করে), ঠিক আগের সিস্টেমের মতোই।
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.from("id_cards").insert([body]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
