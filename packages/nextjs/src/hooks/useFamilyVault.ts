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

  const getExpectedUIDHash = async (): Promise<string | null> => {
    if (!client) return null;
    try {
      const expectedUIDHash = await readClient.readContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "expectedUIDHash",
      });
      return expectedUIDHash as string;
    } catch (err) {
      console.error("Error fetching expected UID hash:", err);
      return null;
    }
  };

  const getNFTContract = async (): Promise<string | null> => {
    if (!client) return null;
    try {
      const nftContract = await readClient.readContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "nftContract",
      });
      return nftContract as string;
    } catch (err) {
      console.error("Error fetching NFT contract:", err);
      return null;
    }
  };

  const getBuyer = async (): Promise<string | null> => {
    if (!client) return null;
    try {
      const buyer = await readClient.readContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "buyer",
      });
      return buyer as string;
    } catch (err) {
      console.error("Error fetching buyer:", err);
      return null;
    }
  };

  const depositFunds = async ({ priceInLYX }: { priceInLYX: bigint }) => {
    if (!client || !walletConnected || !accounts?.[0]) {
      toast.error("Please connect your Universal Profile wallet.");
      return;
    }

    try {
      const txHash = await client.sendTransaction({
        to: vaultAddress,
        value: priceInLYX,
        account: accounts[0] as `0x${string}`,
        chain: client.chain,
      });

      const receipt = await readClient.waitForTransactionReceipt({
        hash: txHash,
      });
      console.log("Transaction receipt:", receipt);

      toast.success("Funds deposited!");
      return txHash;
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
      const simulation = await readClient.simulateContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "confirmReceipt",
        args: [plainUidCode],
        account: accounts[0] as `0x${string}`,
        chain: luksoTestnet,
      });
      console.log("Simulation result:", simulation);
      const vault = await client.writeContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "confirmReceipt",
        account: accounts[0] as `0x${string}`,
        chain: client.chain,
        args: [plainUidCode],
      });
      console.log("Transaction result:", vault);
      const receipt = await readClient.waitForTransactionReceipt({
        hash: vault,
      });
      toast.success("Receipt confirmed!");
      return receipt;
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
      const vaultState = await getVaultState();
      console.log("Vault state:", vaultState);
      const simulation = await readClient.simulateContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "initiateDispute",
        account: accounts[0] as `0x${string}`,
        chain: luksoTestnet,
      });
      console.log("Simulation result:", simulation);
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
      return err;
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
      return err;
    }
  };

  return {
    getVaultState,
    depositFunds,
    confirmReceipt,
    getNFTContract,
    initiateDispute,
    resolveDispute,
    connectedWallet: accounts?.[0],
    walletConnected,
    getBuyer,
    getExpectedUIDHash,
  };
};
