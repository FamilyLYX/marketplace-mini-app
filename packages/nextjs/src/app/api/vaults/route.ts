import { withAuth } from "@/lib/middleware/auth";
import { getAllVaults } from "@/lib/vaultFunctions";
import { NextResponse } from "next/server";

export async function handler() {
  try {
    const result = await getAllVaults();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching vault:", error);
    return NextResponse.json(
      { error: "Error fetching vault" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
