import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./session";

// এডমিন-অনলি API রুটে এটি কল করে চেক করা হয়, রিকোয়েস্টের httpOnly কুকিতে
// ভ্যালিড সেশন টোকেন আছে কিনা। ব্রাউজারের localStorage/console দিয়ে এটি
// বাইপাস করা সম্ভব না, কারণ যাচাইটা সম্পূর্ণ সার্ভারে হয়।
export async function isAdminRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
