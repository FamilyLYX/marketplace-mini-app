import { NextRequest, NextResponse } from "next/server";
import { getAllVaults } from "@/lib/vaultFunctions";

export async function GET(request: NextRequest) {
  try {
    const chainId = request.nextUrl.searchParams.get("chainId");
    const result = await getAllVaults(Number(chainId));
    console.log("result", result);

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching vaults:", error);
    return NextResponse.json(
      { error: "Failed to fetch vaults" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await body;

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ vault: result.data });
  } catch (error) {
    console.error("Error creating/updating vault:", error);
    return NextResponse.json(
      { error: "Failed to create/update vault" },
      { status: 500 }
    );
  }
}
