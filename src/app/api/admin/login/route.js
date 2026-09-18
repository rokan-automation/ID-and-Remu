import { NextResponse } from "next/server";
import { createSessionToken, safeCompare, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

// পাসওয়ার্ড যাচাই সম্পূর্ণ সার্ভারে হয় — ব্রাউজারে কখনো আসল পাসওয়ার্ড পাঠানো হয় না।
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { password } = body || {};
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "সার্ভারে ADMIN_PASSWORD সেট করা নেই। Vercel Environment Variables চেক করুন।" },
      { status: 500 }
    );
  }

  if (!password || !safeCompare(String(password), ADMIN_PASSWORD)) {
    return NextResponse.json({ error: "Invalid Admin Password!" }, { status: 401 });
  }

  const token = createSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
