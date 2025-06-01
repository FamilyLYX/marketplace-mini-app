/* eslint-disable  @typescript-eslint/no-explicit-any */
import { http, createPublicClient, createWalletClient } from "viem";
import { FACTORY_ABI, FACTORY_ADDRESS } from "@/constants/factory";
import { luksoTestnet } from "viem/chains";
import { fromHex, pad } from "viem/utils";
import { ProductMetadata } from "@/components/product";
import { privateKeyToAccount } from "viem/accounts";
import {
  FAMILY_VAULT_FACTORY_ADDRESS,
  FAMILY_VAULT_FACTORY_ABI,
} from "@/constants/vaultFactory";
import { FAMILY_VAULT_ABI } from "@/constants/vault";
import { NFT_ABI } from "@/constants/dpp";
import { parseEventLogs } from "viem";

const tokenId = pad("0x0", { size: 32 }); // hardcoded tokenId as bytes32

// const LSP4_METADATA_KEY =
//   "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";

const DPP_METADATA_KEY =
  "0x83e0c8c4fe3b78192b174a9db34a2591dd4efc5a07cf4f62432e244374361e14";

if (!process.env.NEXT_PUBLIC_PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY environment variable is not set.");
}

export const account = privateKeyToAccount(
  process.env.NEXT_PUBLIC_PRIVATE_KEY as `0x${string}`,
);

// Create the public client for reading from contracts
const readClient = createPublicClient({
  chain: luksoTestnet,
  transport: http(), // Using the same transport for reading
});

export async function getAllNFTMetadata(): Promise<
  Record<
    string,
    {
      nftAddress: string;
      decodedMetadata: ProductMetadata;
    }[]
  >
> {
  try {
    // 1. Fetch deployed NFTs from the factory contract
    const deployedNFTs = (await readClient.readContract({
      abi: FACTORY_ABI,
      address: FACTORY_ADDRESS,
      functionName: "getDeployedDPPs",
    })) as string[];
    const ownerMap: Record<
      string,
      {
        nftAddress: string;
        decodedMetadata: ProductMetadata;
      }[]
    > = {};
    for (const nftAddress of deployedNFTs) {
      // 2. Fetch metadata for each NFT
      const metadata = await readClient.readContract({
        abi: NFT_ABI,
        address: nftAddress as `0x${string}`,
        functionName: "getDataForTokenId",
        args: [tokenId, DPP_METADATA_KEY],
      });
      if (!metadata) {
        continue;
      }
      // 3. Decode the metadata since its hex
      const decodedMetadata = JSON.parse(
        fromHex(metadata as `0x${string}`, "string"),
      ) as ProductMetadata;

      // const decodedMetadata = JSON.parse(metadata as string);
      const owner = (await readClient.readContract({
        abi: NFT_ABI,
        address: nftAddress as `0x${string}`,
        functionName: "tokenOwnerOf",
        args: [tokenId],
      })) as `0x${string}`;
      if (!ownerMap[owner]) {
        ownerMap[owner] = [];
      }
      ownerMap[owner].push({
        nftAddress,
        decodedMetadata,
      });
    }
    return ownerMap;
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    throw error;
  }
}

const walletClient = createWalletClient({
  account,
  chain: luksoTestnet,
  transport: http(), // Make sure the transport is properly configured for the testnet
});

interface CreateVaultParams {
  nftContract: `0x${string}`;
  priceInLYX: number | bigint;
  expectedUIDHash: `0x${string}`;
}

export const createVaultTest = async (params: CreateVaultParams) => {
  const { nftContract, priceInLYX, expectedUIDHash } = params;
  try {
    const tx = await walletClient.writeContract({
      abi: FAMILY_VAULT_FACTORY_ABI,
      address: FAMILY_VAULT_FACTORY_ADDRESS,
      functionName: "createVault",
      args: [account.address, nftContract, priceInLYX, expectedUIDHash],
      chain: luksoTestnet,
    });
    const receipt = await readClient.waitForTransactionReceipt({
      hash: tx,
    });
    if (receipt.status !== "success") {
      return null;
    }
    console.log("Transaction receipt:", receipt);
    console.log("Transaction hash:", tx);
    const parsedLogs = parseEventLogs({
      abi: FAMILY_VAULT_FACTORY_ABI,
      logs: receipt.logs,
      eventName: "VaultCreated",
    }) as any;

    const vaultAddress = parsedLogs?.[0]?.args?.vaultAddress;

    console.log("✅ Vault deployed at:", vaultAddress);
    return { tx, vaultAddress };
  } catch (err) {
    console.error("Error creating vault:", err);
    return null;
  }
};

interface TransferOwnershipParams {
  dppAddress: `0x${string}`;
  to: `0x${string}`;
  plainUidCode: string;
}

export const transferOwnershipWithUIDTest = async (
  params: TransferOwnershipParams,
) => {
  const { dppAddress, to, plainUidCode } = params;

  try {
    const tx = await walletClient.writeContract({
      abi: NFT_ABI,
      address: dppAddress,
      functionName: "transferOwnershipWithUID",
      args: [to, plainUidCode],
      chain: luksoTestnet,
    });

    // Wait for the transaction receipt to confirm its success
    const receipt = await readClient.waitForTransactionReceipt({
      hash: tx,
    });

    // Check if the transaction was successful
    if (receipt.status !== "success") {
      console.error("Transaction failed:", receipt);
      return null;
    }

    console.log("Ownership transferred successfully!");
    console.log("Transaction receipt:", receipt);
    console.log("Transaction hash:", tx);

    // Return the transaction hash and any additional relevant data
    return { tx };
  } catch (err) {
    console.error("Error transferring ownership:", err);
    return null;
  }
};

interface DepositFundsParams {
  vaultAddress: `0x${string}`;
  priceInLYX: bigint;
}

export const depositFundsTest = async (params: DepositFundsParams) => {
  const { vaultAddress, priceInLYX } = params;

  try {
    const tx = await walletClient.sendTransaction({
      to: vaultAddress,
      value: priceInLYX,
      account: account.address,
      chain: luksoTestnet,
    });

    const receipt = await readClient.waitForTransactionReceipt({
      hash: tx,
    });

    if (receipt.status !== "success") {
      console.error("Transaction failed:", receipt);
      return null;
    }

    console.log("Funds deposited successfully!");
    console.log("Transaction receipt:", receipt);
    console.log("Transaction hash:", tx);

    return { tx };
  } catch (err) {
    console.error("Error depositing funds:", err);
    return null;
  }
};

interface ConfirmReceiptParams {
  vaultAddress: `0x${string}`;
  plainUidCode: string;
}

export const confirmReceiptTest = async (params: ConfirmReceiptParams) => {
  const { vaultAddress, plainUidCode } = params;

  try {
    // Simulate the call to catch any revert or issues before sending transaction
    const simulation = await readClient.simulateContract({
      abi: FAMILY_VAULT_ABI,
      address: vaultAddress,
      functionName: "confirmReceipt",
      args: [plainUidCode],
      account: account.address,
      chain: luksoTestnet,
    });
    console.log("Simulation result:", simulation);

    // const tx = await walletClient.writeContract({
    //   abi: FAMILY_VAULT_ABI,
    //   address: vaultAddress,
    //   functionName: "confirmReceipt",
    //   args: [plainUidCode],
    //   chain: luksoTestnet,
    //   account: account.address,
    // });
    //
    // const receipt = await readClient.waitForTransactionReceipt({
    //   hash: tx,
    // });
    //
    // if (receipt.status !== "success") {
    //   console.error("Receipt confirmation failed:", receipt);
    //   return null;
    // }
    //
    // console.log("✅ Receipt confirmed successfully!");
    // console.log("Transaction receipt:", receipt);
    // console.log("Transaction hash:", tx);

    return { tx: ":" };
  } catch (err) {
    console.error("❌ Error confirming receipt:", err);
    return null;
  }
};

export function getOwnerOfNFT(nftAddress: string): Promise<string> {
  return readClient.readContract({
    abi: NFT_ABI,
    address: nftAddress as `0x${string}`,
    functionName: "owner",
  }) as Promise<string>;
}
