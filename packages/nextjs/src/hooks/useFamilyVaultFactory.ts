import { useUpProvider } from "@/components/up-provider";
import { toast } from "sonner";
import {
  FAMILY_VAULT_FACTORY_ABI,
  FAMILY_VAULT_FACTORY_ADDRESS,
} from "@/constants/vaultFactory";
import { createPublicClient, http } from "viem";
import { luksoTestnet } from "viem/chains";
import { parseEventLogs } from "viem";
const readClient = createPublicClient({
  chain: luksoTestnet,
  transport: http("https://rpc.testnet.lukso.network"),
});

export const useFamilyVaultFactory = () => {
  const { client, accounts, walletConnected } = useUpProvider();

  const createVault = async (
    admin: string,
    nftContract: string,
    tokenId: string,
    priceInLYX: number,
    expectedUIDHash: string,
  ) => {
    if (!client || !walletConnected || !accounts?.[0]) {
      toast.error("Please connect your Universal Profile wallet.");
      return null;
    }

    try {
      const tx = await client.writeContract({
        abi: FAMILY_VAULT_FACTORY_ABI,
        address: FAMILY_VAULT_FACTORY_ADDRESS,
        functionName: "createVault",
        account: accounts[0] as `0x${string}`,
        chain: client.chain,
        args: [admin, nftContract, tokenId, priceInLYX, expectedUIDHash],
      });
      const receipt = await readClient.waitForTransactionReceipt({
        hash: tx,
      });
      if (receipt.status !== "success") {
        toast.error("Transaction failed.");
        return null;
      }
      toast.success("Vault created successfully!");
      const parsedLogs = parseEventLogs({
        logs: receipt.logs,
        abi: FAMILY_VAULT_FACTORY_ABI,
      }) as any;
      const vaultAddress = parsedLogs?.[0]?.args?.vaultAddress;
      console.log("✅ Vault deployed at:", vaultAddress);
      return { tx, vaultAddress };
    } catch (err) {
      console.error("Error creating vault:", err);
      toast.error("Failed to create vault.");
      return null;
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
