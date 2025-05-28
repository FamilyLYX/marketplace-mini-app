import { storeSalt, updateSalt } from "@/lib/storeSalt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { tokenId, contractAddress, salt, uidHash, productCode } =
      await req.json();

    if (!tokenId || !contractAddress || !salt) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await storeSalt(tokenId, contractAddress, salt, uidHash, productCode);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save salt error:", error);
    return NextResponse.json(
      { error: "Failed to store salt" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { tokenId, contractAddress, salt, uidHash } = await req.json();

    if (!tokenId || !contractAddress || !salt || !uidHash) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await updateSalt(tokenId, contractAddress, salt, uidHash);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update salt error:", error);
    return NextResponse.json(
      { error: "Failed to update salt" },
      { status: 500 },
    );
  }
}
