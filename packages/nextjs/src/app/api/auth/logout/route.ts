import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function POST() {
  const cookie = serialize("connected", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: new Date(0).getTime(),
  });
  const res = NextResponse.json({ message: "Disconnected" });

  console.log("cookie", cookie, "logout");
  //   res.setHeader("Set-Cookie", cookie);
  res.cookies.set("connected", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: new Date(0).getTime(),
  });
  return res;
}
