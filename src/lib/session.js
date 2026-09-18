// এডমিন লগইন সেশন তৈরি ও যাচাই করার ফাংশন।
// কোনো ডাটাবেজ সেশন টেবিল ছাড়াই, শুধু SESSION_SECRET দিয়ে সাইন করা একটি টোকেন
// httpOnly কুকিতে রাখা হয় — এটি ব্রাউজারের JavaScript/localStorage দিয়ে
// পড়া বা এডিট করা সম্ভব না, তাই ডেভটুলস দিয়ে বাইপাস করা যায় না।

import crypto from "crypto";

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // ৭ দিন (সেকেন্ডে)

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET সেট করা নেই। .env ফাইলে (ও Vercel Environment Variables এ) একটি লম্বা র‍্যান্ডম স্ট্রিং সেট করুন।"
    );
  }
  return secret;
}

function sign(payload) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

// লগইন সফল হলে এই টোকেনটি কুকিতে সেট করা হয়
export function createSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_MAX_AGE * 1000 })
  ).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

// প্রতিটা এডমিন রিকোয়েস্টে কুকির টোকেনটি সঠিক ও এখনও মেয়াদ আছে কিনা যাচাই করা হয়
export function verifySessionToken(token) {
  if (!token || typeof token !== "string") return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  let expectedSignature;
  try {
    expectedSignature = sign(payload);
  } catch {
    return false;
  }

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

// পাসওয়ার্ড মেলানোর সময় timing attack এড়াতে এই ফাংশন ব্যবহার করা হয়
export function safeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}
