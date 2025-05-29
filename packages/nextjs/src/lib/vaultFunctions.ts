import { supabase } from "@/lib/initSupabase";
import { Vault } from "@/types/index";

const TABLE_NAME = "vaults_1";

export async function createVault(vault: Vault) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([vault])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAllVaults() {
  const { data, error } = await supabase.from(TABLE_NAME).select("*");
  if (error) throw error;
  return data;
}

export async function getAllVaultsInOrderStatusPending() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("order_status", "pending");
  if (error) throw error;
  return data;
}

export async function getVaultByAddress(vault_address: string) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("vault_address", vault_address)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateVault(
  vault_address: string,
  updates: Partial<Vault>,
) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq("vault_address", vault_address)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteVault(vault_address: string) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("vault_address", vault_address);
  if (error) throw error;
  return { success: true };
}
