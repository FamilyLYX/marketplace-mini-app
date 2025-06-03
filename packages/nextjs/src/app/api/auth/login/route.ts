import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function POST() {
  const cookie = serialize("connected", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  const res = NextResponse.json({ message: "Connected" });
  console.log("cookie", cookie, "login");
  res.cookies.set("connected", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
