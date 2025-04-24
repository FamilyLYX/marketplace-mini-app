import { supabase } from "@/lib/initSupabase";
import { VaultListing, VaultOrder } from "@/types/index";

// Create a new VaultListing
export const createVaultListing = async (
  listing: VaultListing,
): Promise<VaultListing> => {
  const { data, error } = await supabase
    .from("vault_listings")
    .insert([listing])
    .single(); // Using .single() to ensure only one result is returned

  if (error) {
    console.error("Error creating VaultListing:", error);
    throw new Error("Failed to create listing");
  }

  return data;
};

// Update an existing VaultListing by vault_address and token_id
export const updateVaultListing = async (
  vault_address: string,
  token_id: string,
  updatedListing: Partial<VaultListing>,
): Promise<VaultListing | null> => {
  const { data, error } = await supabase
    .from("vault_listings")
    .update(updatedListing)
    .match({ vault_address, token_id })
    .single(); // Ensure only one item is updated and returned

  if (error) {
    console.error("Error updating VaultListing:", error);
    throw new Error("Failed to update listing");
  }

  return data;
};

// Delete a VaultListing by vault_address and token_id
export const deleteVaultListing = async (
  vault_address: string,
  token_id: string,
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("vault_listings")
    .delete()
    .match({ vault_address, token_id });

  if (error) {
    console.error("Error deleting VaultListing:", error);
    throw new Error("Failed to delete listing");
  }

  return data.length > 0; // Returns true if the deletion was successful
};

// Fetch VaultListings by vault_address
export const fetchVaultListingsByVaultAddress = async (
  vault_address: string,
): Promise<VaultListing[]> => {
  const { data, error } = await supabase
    .from("vault_listings")
    .select("*")
    .eq("vault_address", vault_address);

  if (error) {
    console.error("Error fetching VaultListings:", error);
    throw new Error("Failed to fetch listings");
  }

  return data || [];
};

/** VaultOrder CRUD operations **/

// Create a new VaultOrder
export const createVaultOrder = async (
  order: VaultOrder,
): Promise<VaultOrder> => {
  const { data, error } = await supabase
    .from("vault_orders")
    .insert([order])
    .single(); // Using .single() to ensure only one result is returned

  if (error) {
    console.error("Error creating VaultOrder:", error);
    throw new Error("Failed to create order");
  }

  return data;
};

// Update an existing VaultOrder by vault_address
export const updateVaultOrder = async (
  vault_address: string,
  orderId: string,
  updatedOrder: Partial<VaultOrder>,
): Promise<VaultOrder | null> => {
  const { data, error } = await supabase
    .from("vault_orders")
    .update(updatedOrder)
    .match({ vault_address, id: orderId })
    .single(); // Ensure only one item is updated and returned

  if (error) {
    console.error("Error updating VaultOrder:", error);
    throw new Error("Failed to update order");
  }

  return data;
};

// Delete a VaultOrder by vault_address
export const deleteVaultOrder = async (
  vault_address: string,
  orderId: string,
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("vault_orders")
    .delete()
    .match({ vault_address, id: orderId });

  if (error) {
    console.error("Error deleting VaultOrder:", error);
    throw new Error("Failed to delete order");
  }

  return data.length > 0; // Returns true if the deletion was successful
};

// Fetch VaultOrders by vault_address
export const fetchVaultOrdersByVaultAddress = async (
  vault_address: string,
): Promise<VaultOrder[]> => {
  const { data, error } = await supabase
    .from("vault_orders")
    .select("*")
    .eq("vault_address", vault_address);

  if (error) {
    console.error("Error fetching VaultOrders:", error);
    throw new Error("Failed to fetch orders");
  }

  return data || [];
};
