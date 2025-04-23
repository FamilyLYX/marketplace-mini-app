import { http, createPublicClient } from "viem";
import { FACTORY_ABI, FACTORY_ADDRESS } from "@/constants/factory";
import { luksoTestnet } from "viem/chains";
import { NFT_ABI } from "@/constants/dpp";
import { fromHex } from "viem/utils";
import { ProductMetadata } from "@/components/product";

if (!process.env.NEXT_PUBLIC_PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY environment variable is not set.");
}

// Create the public client for reading from contracts
const readClient = createPublicClient({
  chain: luksoTestnet,
  transport: http(), // Using the same transport for reading
});

export async function getAllNFTMetadata(): Promise<
  Record<string, { nftAddress: string; decodedMetadata: ProductMetadata }[]>
> {
  try {
    // 1. Fetch deployed NFTs from the factory contract
    const deployedNFTs = (await readClient.readContract({
      abi: FACTORY_ABI,
      address: FACTORY_ADDRESS,
      functionName: "getDeployedNFTs",
    })) as string[];
    console.log("Deployed NFTs:", deployedNFTs);
    const ownerMap: Record<
      string,
      { nftAddress: string; decodedMetadata: ProductMetadata }[]
    > = {};
    for (const nftAddress of deployedNFTs) {
      console.log("NFT Address:", nftAddress);
      // 2. Fetch metadata for each NFT
      const metadata = await readClient.readContract({
        abi: NFT_ABI,
        address: nftAddress as `0x${string}`,
        functionName: "getPublicMetadata",
      });
      const decodedMetadata = JSON.parse(
        fromHex(metadata as `0x${string}`, "string"),
      );
      const owner = (await readClient.readContract({
        abi: NFT_ABI,
        address: nftAddress as `0x${string}`,
        functionName: "owner",
      })) as string;
      console.log("👤 Owner:", owner, " of metadata: ", decodedMetadata);
      if (!ownerMap[owner]) {
        ownerMap[owner] = [];
      }
      ownerMap[owner].push({ nftAddress, decodedMetadata });
    }
    return ownerMap;
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    throw error;
  }
}
