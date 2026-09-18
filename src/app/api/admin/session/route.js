import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";

// পেজ লোড হওয়ার সময় ক্লায়েন্ট এই এন্ডপয়েন্ট কল করে চেক করে, আগে থেকে
// ভ্যালিড এডমিন সেশন আছে কিনা (আগে localStorage চেক করা হতো, যা অসুরক্ষিত ছিল)।
export async function GET() {
  const isAdmin = await isAdminRequest();
  return NextResponse.json({ isAdmin });
}
