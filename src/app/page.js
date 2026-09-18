import { redirect } from "next/navigation";

// আগে এই ফাইলটি ছিল না, তাই মূল ঠিকানা (id-card-kohl.vercel.app) সব সময়ই
// ৪০৪ দেখাতো। এখন কেউ রুট ঠিকানায় গেলে সরাসরি /id-generator এ পাঠানো হবে।
export default function Home() {
  redirect("/id-generator");
}
