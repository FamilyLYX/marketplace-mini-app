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
}

export const useFamilyVault = (vaultAddress: `0x${string}`) => {
  const { client, accounts, walletConnected } = useUpProvider();

  const getVaultState = async (): Promise<FamilyVaultState | null> => {
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

  const getNFTContract = async (): Promise<string | null> => {
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

  const getTokenId = async (): Promise<`0x${string}` | null> => {
    try {
      const tokenId = await readClient.readContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "tokenId",
      });
      return tokenId as `0x${string}`;
    } catch (err) {
      console.error("Error fetching token ID:", err);
      return null;
    }
  };

  const depositFunds = async ({ priceInLYX }: { priceInLYX: bigint }) => {
    if (!client || !walletConnected || !accounts?.[0]) {
      toast.error("Connect your Universal Profile wallet first.");
      throw new Error("Wallet not connected.");
    }

    try {
      const vaultState = await getVaultState();
      if (vaultState !== FamilyVaultState.Listed) {
        toast.error("Vault is not in a listed state.");
        throw new Error("Vault is not in a listed state.");
      }

      const txHash = await client.sendTransaction({
        to: vaultAddress,
        value: priceInLYX,
        account: accounts[0],
        chain: client.chain,
      });

      await readClient.waitForTransactionReceipt({ hash: txHash });
      toast.success("Funds deposited successfully!");
      return txHash;
    } catch (err) {
      console.error("Error depositing funds:", err);
      toast.error("Deposit failed.");
      throw err;
    }
  };

  const confirmReceipt = async (
    plainUidCode: string,
    salt: string,
    newUidHash: `0x${string}`,
  ) => {
    if (!client || !walletConnected || !accounts?.[0]) {
      toast.error("Connect your Universal Profile wallet first.");
      throw new Error("Wallet not connected.");
    }

    try {
      const response = await readClient.simulateContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "confirmReceipt",
        args: [plainUidCode, salt, newUidHash],
        account: accounts[0],
        chain: luksoTestnet,
      });
      if (!response) {
        throw new Error(`Simulation failed: ${response}`);
      }

      const txHash = await client.writeContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "confirmReceipt",
        args: [plainUidCode, salt, newUidHash],
        account: accounts[0],
        chain: client.chain,
      });

      await readClient.waitForTransactionReceipt({ hash: txHash });
      toast.success("Receipt confirmed.");
      return txHash;
    } catch (err) {
      console.error("Error confirming receipt:", err);
      toast.error("Could not confirm receipt.");
      throw err;
    }
  };

  const initiateDispute = async () => {
    if (!client || !walletConnected || !accounts?.[0]) {
      toast.error("Connect your Universal Profile wallet first.");
      throw new Error("Wallet not connected.");
    }

    try {
      const vaultState = await getVaultState();
      if (
        vaultState !== FamilyVaultState.FundsDeposited &&
        vaultState !== FamilyVaultState.DeliveryConfirmed
      ) {
        toast.error("Dispute can only be initiated in appropriate states.");
        throw new Error(
          "Dispute can only be initiated in appropriate states. Funds must be deposited or delivery confirmed.",
        );
      }

      await readClient.simulateContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "initiateDispute",
        account: accounts[0],
        chain: luksoTestnet,
      });

      const txHash = await client.writeContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "initiateDispute",
        account: accounts[0],
        chain: client.chain,
      });

      await readClient.waitForTransactionReceipt({ hash: txHash });
      toast.success("Dispute initiated.");
      return txHash;
    } catch (err) {
      console.error("Error initiating dispute:", err);
      toast.error("Failed to initiate dispute.");
      throw err;
    }
  };

  const resolveDispute = async (
    nftRecipient: string,
    paymentRecipient: string,
    plainUidCode: string,
    salt: string,
    newUidHash: `0x${string}`, // Valid bytes32 string
  ) => {
    if (!client || !walletConnected || !accounts?.[0]) {
      toast.error("Connect your Universal Profile wallet first.");
      throw new Error("Wallet not connected.");
    }

    try {
      const vaultState = await getVaultState();
      if (vaultState !== FamilyVaultState.Disputed) {
        toast.error("Vault is not in a disputed state.");
        throw new Error("Vault is not in a disputed state.");
      }

      const txHash = await client.writeContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "resolveDispute",
        args: [nftRecipient, paymentRecipient, plainUidCode, salt, newUidHash],
        account: accounts[0],
        chain: client.chain,
      });

      await readClient.waitForTransactionReceipt({ hash: txHash });
      toast.success("Dispute resolved.");
      return txHash;
    } catch (err) {
      console.error("Error resolving dispute:", err);
      toast.error("Failed to resolve dispute.");
      throw err;
    }
  };

  const cancelTrade = async (
    plainUidCode: string,
    salt: string,
    newUidHash: `0x${string}`,
  ) => {
    if (!client || !walletConnected || !accounts?.[0]) {
      toast.error("Connect your Universal Profile wallet first.");
      throw new Error("Wallet not connected.");
    }

    try {
      const vaultState = await getVaultState();
      if (
        vaultState === FamilyVaultState.Completed ||
        FamilyVaultState.Disputed
      ) {
        toast.error("Trade cannot be cancelled in this state.");
        throw new Error(
          "Trade cannot be cancelled in this state." + vaultState,
        );
      }
      const txHash = await client.writeContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "cancelTrade",
        args: [plainUidCode, salt, newUidHash],
        account: accounts[0],
        chain: client.chain,
      });

      await readClient.waitForTransactionReceipt({ hash: txHash });
      toast.success("Trade cancelled.");
      return txHash;
    } catch (err) {
      console.error("Error cancelling trade:", err);
      toast.error("Failed to cancel trade.");
      throw err;
    }
  };

  const unlist = async (
    plainUidCode: string,
    salt: string,
    newUidHash: `0x${string}`,
  ) => {
    if (!client || !walletConnected || !accounts?.[0]) {
      toast.error("Connect your Universal Profile wallet first.");
      throw new Error("Wallet not connected.");
    }

    try {
      const txHash = await client.writeContract({
        abi: FAMILY_VAULT_ABI,
        address: vaultAddress,
        functionName: "unlist",
        args: [plainUidCode, salt, newUidHash],
        account: accounts[0],
        chain: client.chain,
      });

      await readClient.waitForTransactionReceipt({ hash: txHash });
      toast.success("Unlisted.");
      return txHash;
    } catch (err) {
      console.error("Error unlisting", err);
      toast.error("Failed to unlist");
      throw err;
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
    cancelTrade,
    unlist,
    getTokenId,
  };
};
