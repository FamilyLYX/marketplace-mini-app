import { getSalt } from "@/lib/getSalt";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const dppAddress = searchParams.get("dppAddress");

  if (!dppAddress) {
    return NextResponse.json({ error: "Missing dppAddress" }, { status: 400 });
  }

  try {
    console.log("Fetching salt for dppAddress:", dppAddress);
    const salt = await getSalt(dppAddress);

    if (!salt) {
      console.log("Salt not found for dppAddress:", dppAddress);
      return NextResponse.json({ error: "Salt not found" }, { status: 404 });
    }

    console.log("Salt found for dppAddress:", dppAddress);
    return NextResponse.json({ salt });
  } catch (error) {
    console.error("Get salt error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch salt",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
