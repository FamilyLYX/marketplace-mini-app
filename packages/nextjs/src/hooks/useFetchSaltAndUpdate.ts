import { keccak256, encodePacked } from "viem";
import { v4 as uuidv4 } from "uuid";

export const useFetchSaltAndUpdate = () => {
  const fetchAndUpdateSalt = async (
    dppAddress: `0x${string}`,
    plainUIDCode: string,
  ): Promise<{
    currentSalt: string;
    newSalt: string;
    newUidHash: `0x${string}`;
  }> => {
    const response = await fetch(`/api/get-salt?dppAddress=${dppAddress}`);
    const dppSalt = await response.json();

    if (!dppSalt || !dppSalt.salt) {
      throw new Error("Failed to fetch DPP salt");
    }

    const currentSalt = dppSalt.salt;
    const newSalt = uuidv4();
    const newUidHash = keccak256(
      encodePacked(["string", "string"], [newSalt, plainUIDCode]),
    );

    return {
      currentSalt,
      newSalt,
      newUidHash,
    };
  };

  return { fetchAndUpdateSalt };
};
