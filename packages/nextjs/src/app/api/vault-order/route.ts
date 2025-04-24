import { NextRequest, NextResponse } from "next/server";
import {
  createVaultOrder,
  updateVaultOrder,
  deleteVaultOrder,
  fetchVaultOrdersByVaultAddress,
} from "../../../lib/vaultFunctions";
import { VaultOrder } from "../../../types/index";

// POST: Create a new VaultOrder
export async function POST(req: NextRequest) {
  try {
    const order: VaultOrder = await req.json();
    const result = await createVaultOrder(order);
    return NextResponse.json(result, { status: 201 }); // Return created order
  } catch (error) {
    console.error("Error creating vault order:", error);
    return NextResponse.json(
      { error: "Error creating vault order" },
      { status: 500 },
    );
  }
}

// GET: Fetch VaultOrders by vault_address
export async function GET(req: NextRequest) {
  try {
    const vault_address = req.nextUrl.searchParams.get("vault_address");

    if (!vault_address) {
      return NextResponse.json(
        { error: "Vault address is required" },
        { status: 400 },
      );
    }
    const result = await fetchVaultOrdersByVaultAddress(vault_address);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching vault orders:", error);
    return NextResponse.json(
      { error: "Error fetching vault orders" },
      { status: 500 },
    );
  }
}

// PATCH: Update an existing VaultOrder by vault_address and order_id
export async function PATCH(req: NextRequest) {
  try {
    const vault_address = req.nextUrl.searchParams.get("vault_address");
    const order_id = req.nextUrl.searchParams.get("order_id");
    if (!vault_address || !order_id) {
      return NextResponse.json(
        { error: "Vault address and order ID are required" },
        { status: 400 },
      );
    }

    const updatedOrder: Partial<VaultOrder> = await req.json();
    const result = await updateVaultOrder(
      vault_address,
      order_id,
      updatedOrder,
    );
    if (result) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error updating vault order:", error);
    return NextResponse.json(
      { error: "Error updating vault order" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a VaultOrder by vault_address and order_id
export async function DELETE(req: NextRequest) {
  try {
    const vault_address = req.nextUrl.searchParams.get("vault_address");
    const order_id = req.nextUrl.searchParams.get("order_id");
    if (!vault_address || !order_id) {
      return NextResponse.json(
        { error: "Vault address and order ID are required" },
        { status: 400 },
      );
    }

    const result = await deleteVaultOrder(vault_address, order_id);
    if (result) {
      return NextResponse.json({ message: "Order deleted successfully" });
    } else {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error deleting vault order:", error);
    return NextResponse.json(
      { error: "Error deleting vault order" },
      { status: 500 },
    );
  }
}
