// utils/getSalt.ts
// import { pad } from "viem";
// import { appConfig } from "./app-config"

import { adminDb } from "./firerbase";

// const SALT_DB = appConfig.salt_db; // Use the configured salt database

// const tokenId = pad("0x0", { size: 32 }); // hardcoded tokenId as bytes32 since we are managing one token per contract - this will change with entrepresis
/**
 * Fetches the salt for a given token ID and contract address.
 * @param {string} dppAddress - The address of the contract.
 * @returns {Promise<string | null>} - The salt if found, otherwise null.
 */
export async function getSalt(dppAddress: string): Promise<string | null> {
  console.log("getSalt called with dppAddress:", dppAddress);

  try {
    const salt = await adminDb
      .collection("salts")
      .where("contractAddress", "==", dppAddress)
      .get();

    if (salt.empty) {
      console.log("No salt found for contract address:", dppAddress);
      return null;
    }

    const saltData = salt.docs.map((doc) => doc.data());
    console.log("Salt found:", saltData);
    return saltData[0].salt;
  } catch (error) {
    console.error("Error fetching salt:", error);
    return null;
  }
}

export async function getAllData(dppAddress: string): Promise<unknown> {
  console.log("getAllData called with dppAddress:", dppAddress);

  try {
    const data = await adminDb
      .collection("salts")
      .where("contractAddress", "==", dppAddress)
      .get();
    const dataData = data.docs.map((doc) => doc.data());
    console.log("All data result:", dataData);
    return dataData[0];
  } catch (error) {
    console.log("Error in getAllData:", error);
    return null;
  }
}
