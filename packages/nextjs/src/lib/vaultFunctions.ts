import { supabase } from "@/lib/initSupabase";
import { Vault } from "@/types/index";
import { appConfig } from "./app-config";

const VAULT_DB = appConfig.vaults_db;

export async function createVault(vault: Vault) {
  const { data, error } = await supabase
    .from(VAULT_DB)
    .insert([vault])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAllVaults() {
  const { data, error } = await supabase.from(VAULT_DB).select("*");
  if (error) throw error;
  return data;
}

export async function getAllVaultsInOrderStatusPending() {
  const { data, error } = await supabase
    .from(VAULT_DB)
    .select("*")
    .eq("order_status", "pending");
  if (error) throw error;
  return data;
}

export async function getVaultByAddress(vault_address: string) {
  const { data, error } = await supabase
    .from(VAULT_DB)
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
    .from(VAULT_DB)
    .update(updates)
    .eq("vault_address", vault_address)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteVault(vault_address: string) {
  const { error } = await supabase
    .from(VAULT_DB)
    .delete()
    .eq("vault_address", vault_address);
  if (error) throw error;
  return { success: true };
}
