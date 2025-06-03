import { getAllData } from "@/lib/getSalt";
import { withAuth } from "@/lib/middleware/auth";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

async function handler(req: NextApiRequest) {
  const { searchParams } = new URL(req.url ?? "");

  const dppAddress = searchParams.get("dppAddress");

  if (!dppAddress) {
    return NextResponse.json({ error: "Missing dppAddress" }, { status: 400 });
  }

  try {
    const data = await getAllData(dppAddress);

    if (!data) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Get data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
