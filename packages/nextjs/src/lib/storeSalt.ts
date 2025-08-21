// utils/storeSalt.ts

import { adminDb } from "./firerbase";

export async function storeSalt(
  tokenId: string,
  contractAddress: string,
  salt: string,
  uidHash: string,
  productCode: string
) {
  try {
    const saltRecord = await adminDb
      .collection("salts")
      .doc(contractAddress)
      .set({
        tokenId: tokenId,
        contractAddress: contractAddress,
        salt: salt,
        uidHash: uidHash,
        uidCode: productCode,
      });
    return saltRecord;
  } catch (error) {
    console.error("Error storing salt:", error);
    throw error;
  }
}

export async function updateSalt(
  tokenId: string,
  contractAddress: string,
  newSalt: string,
  newUidHash: string
) {
  try {
    // Return mock updated salt record
    const _saltRecord = await adminDb
      .collection("salts")
      .where("contractAddress", "==", contractAddress)
      .where("tokenId", "==", tokenId)
      .get();

    if (_saltRecord.empty) {
      console.error("No salt record found");
      return null;
    }

    const saltRecord = await _saltRecord.docs[0].ref.update({
      salt: newSalt,
      uidHash: newUidHash,
    });
    return saltRecord;
  } catch (error) {
    console.error("Error updating salt:", error);
    throw error;
  }
}
