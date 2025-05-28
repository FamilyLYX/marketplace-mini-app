import { getSalt } from "@/lib/getSalt";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const dppAddress = searchParams.get("dppAddress");

  if (!dppAddress) {
    return NextResponse.json({ error: "Missing dppAddress" }, { status: 400 });
  }

  try {
    const salt = await getSalt(dppAddress);

    if (!salt) {
      return NextResponse.json({ error: "Salt not found" }, { status: 404 });
    }

    return NextResponse.json({ salt });
  } catch (error) {
    console.error("Get salt error:", error);
    return NextResponse.json(
      { error: "Failed to fetch salt" },
      { status: 500 },
    );
  }
}
