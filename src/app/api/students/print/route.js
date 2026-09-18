import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminRequest } from "@/lib/adminAuth";

// প্রিন্ট করা প্রতিটা স্টুডেন্টের print_count এক করে বাড়িয়ে দেওয়া (bulk) — এডমিন-অনলি
export async function POST(request) {
  const authorized = await isAdminRequest();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const students = Array.isArray(body?.students) ? body.students : [];

  const updates = students.map((s) =>
    supabaseAdmin
      .from("id_cards")
      .update({ print_count: (s.print_count || 0) + 1 })
      .eq("id", s.id)
  );

  await Promise.all(updates);
  return NextResponse.json({ success: true });
}
