// utils/getSalt.ts
import { pad } from "viem";
import { supabase } from "./initSupabase";
import { appConfig } from "./app-config";

const SALT_DB = appConfig.salt_db; // Use the configured salt database

const tokenId = pad("0x0", { size: 32 }); // hardcoded tokenId as bytes32 since we are managing one token per contract - this will change with entrepresis
/**
 * Fetches the salt for a given token ID and contract address from the Supabase database.
 * @param {string} dppAddress - The address of the contract.
 * @returns {Promise<string | null>} - The salt if found, otherwise null.
 */
export async function getSalt(dppAddress: string): Promise<string | null> {
  const { data, error } = await supabase
    .from(SALT_DB)
    .select("salt")
    .eq("token_id", tokenId)
    .eq("contract_address", dppAddress)
    .single();

  if (error) {
    console.error("Error fetching salt:", error.message);
    return null;
  }

  return data.salt;
}

export async function getAllData(dppAddress: string): Promise<string | null> {
  const { data, error } = await supabase
    .from(SALT_DB)
    .select("*")
    .eq("token_id", tokenId)
    .eq("contract_address", dppAddress)
    .single();

  if (error) {
    console.error("Error fetching salt:", error.message);
    return null;
  }

  return data;
}
