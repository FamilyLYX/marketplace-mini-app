// utils/storeSalt.ts
import { supabase } from "./initSupabase";

export async function storeSalt(
  tokenId: string,
  contractAddress: string,
  salt: string,
  uidHash: string,
  productCode: string,
) {
  const { error } = await supabase.from("dpp_salts").insert([
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
