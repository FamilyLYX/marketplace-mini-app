import { NextRequest, NextResponse } from "next/server";
import {
  createVaultListing,
  updateVaultListing,
  deleteVaultListing,
  fetchVaultListingsByVaultAddress,
} from "../../../lib/vaultFunctions";
import { VaultListing } from "../../../types/index";

// POST: Create a new VaultListing
export async function POST(req: NextRequest) {
  try {
    const listing: VaultListing = await req.json();
    const result = await createVaultListing(listing);
    return NextResponse.json(result, { status: 201 }); // Return created listing
  } catch (error) {
    console.error("Error creating vault listing:", error);
    return NextResponse.json(
      { error: "Error creating vault listing" },
      { status: 500 },
    );
  }
}

// GET: Fetch VaultListings by vault_address
export async function GET(req: NextRequest) {
  try {
    const vault_address = req.nextUrl.searchParams.get("vault_address");
    if (!vault_address) {
      return NextResponse.json(
        { error: "Vault address is required" },
        { status: 400 },
      );
    }
    const result = await fetchVaultListingsByVaultAddress(vault_address);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching vault listings:", error);
    return NextResponse.json(
      { error: "Error fetching vault listings" },
      { status: 500 },
    );
  }
}

// PATCH: Update an existing VaultListing by vault_address and token_id
export async function PATCH(req: NextRequest) {
  try {
    const vault_address = req.nextUrl.searchParams.get("vault_address");
    const token_id = req.nextUrl.searchParams.get("token_id");
    if (!vault_address || !token_id) {
      return NextResponse.json(
        { error: "Vault address and token ID are required" },
        { status: 400 },
      );
    }

    const updatedListing: Partial<VaultListing> = await req.json();
    const result = await updateVaultListing(
      vault_address,
      token_id,
      updatedListing,
    );
    if (result) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error updating vault listing:", error);
    return NextResponse.json(
      { error: "Error updating vault listing" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a VaultListing by vault_address and token_id
export async function DELETE(req: NextRequest) {
  try {
    const vault_address = req.nextUrl.searchParams.get("vault_address");
    const token_id = req.nextUrl.searchParams.get("token_id");
    if (!vault_address || !token_id) {
      return NextResponse.json(
        { error: "Vault address and token ID are required" },
        { status: 400 },
      );
    }

    const result = await deleteVaultListing(vault_address, token_id);
    if (result) {
      return NextResponse.json({ message: "Listing deleted successfully" });
    } else {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error deleting vault listing:", error);
    return NextResponse.json(
      { error: "Error deleting vault listing" },
      { status: 500 },
    );
  }
}
