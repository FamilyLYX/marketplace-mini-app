// utils/storeSalt.ts
import { appConfig } from "./app-config";
import { supabase } from "./initSupabase";

const SALT_DB = appConfig.salt_db; // Use the configured salt database

export async function storeSalt(
  tokenId: string,
  contractAddress: string,
  salt: string,
  uidHash: string,
  productCode: string,
) {
  const { error } = await supabase.from(SALT_DB).insert([
    {
      token_id: tokenId,
      salt,
      contract_address: contractAddress,
      uid_code: productCode,
      hash: uidHash,
    },
  ]);

  if (error) {
    console.error("Error storing salt:", error.message);
    throw error;
  }
}

export async function updateSalt(
  tokenId: string,
  contractAddress: string,
  newSalt: string,
  newUidHash: string,
) {
  const { error } = await supabase
    .from(SALT_DB)
    .update({
      salt: newSalt,
      hash: newUidHash,
    })
    .match({
      token_id: tokenId,
      contract_address: contractAddress,
    });

  if (error) {
    console.error("Error updating salt:", error.message);
    throw error;
  }
}
