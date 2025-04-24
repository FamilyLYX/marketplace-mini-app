import { NextRequest, NextResponse } from "next/server";
import {
  createVault,
  updateVault,
  deleteVault,
  getVaultByAddress,
} from "../../../lib/vaultFunctions";
import { Vault } from "../../../types/index";

// POST: Create a new Vault
export async function POST(req: NextRequest) {
  try {
    const vault: Vault = await req.json();
    const result = await createVault(vault);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating vault:", error);
    return NextResponse.json(
      { error: "Error creating vault" },
      { status: 500 },
    );
  }
}

// GET: Fetch Vault by vault_address
export async function GET(req: NextRequest) {
  try {
    const vault_address = req.nextUrl.searchParams.get("vault_address");
    if (!vault_address) {
      return NextResponse.json(
        { error: "Vault address is required" },
        { status: 400 },
      );
    }
    const result = await getVaultByAddress(vault_address);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching vault:", error);
    return NextResponse.json(
      { error: "Error fetching vault" },
      { status: 500 },
    );
  }
}

// PATCH: Update a Vault by vault_address
export async function PATCH(req: NextRequest) {
  try {
    const vault_address = req.nextUrl.searchParams.get("vault_address");
    if (!vault_address) {
      return NextResponse.json(
        { error: "Vault address is required" },
        { status: 400 },
      );
    }

    const updatedVault: Partial<Vault> = await req.json();
    const result = await updateVault(vault_address, updatedVault);
    if (result) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error updating vault:", error);
    return NextResponse.json(
      { error: "Error updating vault" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a Vault by vault_address
export async function DELETE(req: NextRequest) {
  try {
    const vault_address = req.nextUrl.searchParams.get("vault_address");
    if (!vault_address) {
      return NextResponse.json(
        { error: "Vault address is required" },
        { status: 400 },
      );
    }

    const result = await deleteVault(vault_address);
    if (result) {
      return NextResponse.json({ message: "Vault deleted successfully" });
    } else {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error deleting vault:", error);
    return NextResponse.json(
      { error: "Error deleting vault" },
      { status: 500 },
    );
  }
}
