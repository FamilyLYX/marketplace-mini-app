import { useUpProvider } from "@/components/up-provider";
import { toast } from "sonner";
import { FAMILY_VAULT_ABI } from "@/constants/vault";
import { createPublicClient, http } from "viem";
import { luksoTestnet } from "viem/chains";

const readClient = createPublicClient({
  chain: luksoTestnet,
  transport: http("https://rpc.testnet.lukso.network"),
});

export enum FamilyVaultState {
  Initialized = 0,
  Listed = 1,
  FundsDeposited = 2,
  DeliveryConfirmed = 3,
  Completed = 4,
  Disputed = 5,
  Cancelled = 6,
}

export const useFamilyVault = (vaultAddress: `0x${string}`) => {
  const { client, accounts, walletConnected } = useUpProvider();

  const getVaultState = async (): Promise<FamilyVaultState | null> => {
    if (!client) return null;
    try {
      const state = await readClient.readContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "state",
      });
      return state as FamilyVaultState;
    } catch (err) {
      console.error("Error fetching vault state:", err);
      return null;
    }
  };

  const depositFunds = async (priceInLYX: bigint) => {
    if (!client || !walletConnected || !accounts?.[0]) {
      toast.error("Please connect your Universal Profile wallet.");
      return;
    }

    try {
      const vault = await client.writeContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "receive",
        account: accounts[0] as `0x${string}`,
        chain: client.chain,
        value: priceInLYX,
      });

      toast.success("Funds deposited!");
      return vault;
    } catch (err) {
      console.error("Error depositing funds:", err);
      toast.error("Failed to deposit funds.");
    }
  };

  const confirmReceipt = async (plainUidCode: string) => {
    if (!client || !walletConnected || !accounts?.[0]) {
      toast.error("Please connect your Universal Profile wallet.");
      return;
    }

    try {
      const vault = await client.writeContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "confirmReceipt",
        account: accounts[0] as `0x${string}`,
        chain: client.chain,
        args: [plainUidCode],
      });

      toast.success("Receipt confirmed!");
      return vault;
    } catch (err) {
      console.error("Error confirming receipt:", err);
      toast.error("Failed to confirm receipt.");
    }
  };

  const initiateDispute = async () => {
    if (!client || !walletConnected || !accounts?.[0]) {
      toast.error("Please connect your Universal Profile wallet.");
      return;
    }

    try {
      const vault = await client.writeContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "initiateDispute",
        account: accounts[0] as `0x${string}`,
        chain: client.chain,
      });

      toast.success("Dispute initiated!");
      return vault;
    } catch (err) {
      console.error("Error initiating dispute:", err);
      toast.error("Failed to initiate dispute.");
    }
  };

  const resolveDispute = async (
    nftRecipient: string,
    paymentRecipient: string,
  ) => {
    if (!client || !walletConnected || !accounts?.[0]) {
      toast.error("Please connect your Universal Profile wallet.");
      return;
    }

    try {
      const vault = await client.writeContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "resolveDispute",
        account: accounts[0] as `0x${string}`,
        chain: client.chain,
        args: [nftRecipient, paymentRecipient],
      });

      toast.success("Dispute resolved!");
      return vault;
    } catch (err) {
      console.error("Error resolving dispute:", err);
      toast.error("Failed to resolve dispute.");
    }
  };

  return {
    getVaultState,
    depositFunds,
    confirmReceipt,
    initiateDispute,
    resolveDispute,
    connectedWallet: accounts?.[0],
    walletConnected,
  };
};
