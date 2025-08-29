import { getSalt } from "@/lib/getSalt";
import { storeSalt } from "@/lib/storeSalt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get("tokenId");
    const contractAddress = searchParams.get("contractAddress");

    if (!tokenId || !contractAddress) {
      return NextResponse.json(
        { error: "Token ID and contract address are required" },
        { status: 400 }
      );
    }

    const result = await getSalt(contractAddress as string);

    return NextResponse.json({ salt: result });
  } catch (error) {
    console.error("Error fetching salt:", error);
    return NextResponse.json(
      { error: "Failed to fetch salt" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenId, contractAddress, salt } = body;

    if (!tokenId || !contractAddress || !salt) {
      return NextResponse.json(
        { error: "Token ID, contract address, and salt are required" },
        { status: 400 }
      );
    }

    const result = await storeSalt(tokenId, contractAddress, salt, "", "");

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error storing salt:", error);
    return NextResponse.json(
      { error: "Failed to store salt" },
      { status: 500 }
    );
  }
}
