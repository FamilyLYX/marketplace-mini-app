/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useUpProvider } from "@/components/up-provider";
import { toast } from "sonner";
import {
  FAMILY_VAULT_FACTORY_ABI,
  FAMILY_VAULT_FACTORY_ADDRESS,
} from "@/constants/vaultFactory";
import { pad, parseEventLogs } from "viem";
import { readClient } from "@/lib/app-config";

type CreateVaultParams = {
  nftContract: string;
  priceInLYX: bigint;
};

export const useFamilyVaultFactory = () => {
  const { client, accounts, walletConnected } = useUpProvider();

  const createVault = async ({
    nftContract,
    priceInLYX,
  }: CreateVaultParams) => {
    if (!client || !walletConnected || !accounts?.[0]) {
      toast.error("Please connect your Universal Profile wallet.");
      return null;
    }

    const tokenId = pad("0x0", { size: 32 }); // hardcoded tokenId as bytes32

    try {
      const { request } = await readClient.simulateContract({
        abi: FAMILY_VAULT_FACTORY_ABI,
        address: FAMILY_VAULT_FACTORY_ADDRESS,
        functionName: "createVault",
        account: accounts[0] as `0x${string}`,
        chain: client.chain,
        args: [nftContract, tokenId, priceInLYX],
      });
      if (!request) {
        toast.error("Simulation failed. Please check your inputs.");
        return null;
      }
      const tx = await client.writeContract({
        abi: FAMILY_VAULT_FACTORY_ABI,
        address: FAMILY_VAULT_FACTORY_ADDRESS,
        functionName: "createVault",
        account: accounts[0] as `0x${string}`,
        chain: client.chain,
        args: [nftContract, tokenId, priceInLYX],
      });

      const receipt = await readClient.waitForTransactionReceipt({ hash: tx });

      if (receipt.status !== "success") {
        toast.error("Transaction failed.");
        throw new Error("Transaction failed");
      }

      toast.success("Vault created successfully!");

      const parsedLogs: any = parseEventLogs({
        logs: receipt.logs,
        abi: FAMILY_VAULT_FACTORY_ABI,
      });

      const vaultAddress = parsedLogs?.[0]?.args?.vaultAddress as `0x${string}`;
      console.log("✅ Vault deployed at:", vaultAddress);
      return { tx, vaultAddress };
    } catch (err) {
      console.error("Error creating vault:", err);
      toast.error("Failed to create vault.");
      throw err;
    }
  };

  const getVaultsCreatedByUser = async (): Promise<string[]> => {
    if (!client) return [];
    try {
      const vaults = await readClient.readContract({
        abi: FAMILY_VAULT_FACTORY_ABI,
        address: FAMILY_VAULT_FACTORY_ADDRESS,
        functionName: "getVaultsCreatedByUser",
        args: [accounts?.[0] as `0x${string}`],
      });
      return vaults as string[];
    } catch (err) {
      console.error("Error fetching created vaults:", err);
      return [];
    }
  };

  return {
    createVault,
    getVaultsCreatedByUser,
    connectedWallet: accounts?.[0],
    walletConnected,
  };
};
