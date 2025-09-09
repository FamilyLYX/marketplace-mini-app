// import { useUpProvider } from "@/components/up-provider";
import { toast } from "sonner";
import { pad } from "viem";
import { NFT_ABI } from "@/constants/dpp";
import { useReadClient } from "@/lib/app-config";
import { useUpProvider } from "@/components/up-provider";

export const useDPP = () => {
  const { address: account, client } = useUpProvider();
  const readClient = useReadClient();

  const tokenId = pad("0x0", { size: 32 }); // since rn we are using a fixed tokenId of 0x0, as one quantity of product is available for sale

  console.log(tokenId);

  const mintDPP = async ({
    dppAddress,
    publicJsonMetadata,
    uidHash,
  }: {
    dppAddress: `0x${string}`;
    publicJsonMetadata: string;
    uidHash: `0x${string}`; // must be 32 bytes (0x-prefixed)
  }) => {
    console.log("minting...", dppAddress, publicJsonMetadata);
    if (!client || !account) {
      console.error("Wallet not connected or account not available.");
      throw new Error("Wallet not connected or account not available.");
    }
    try {
      // Simulate the call and get a prepared request
      const { request } = await readClient.simulateContract({
        abi: NFT_ABI,
        address: dppAddress,
        functionName: "mintDPP",
        account: account,
        args: [account, publicJsonMetadata, uidHash],
        chain: client.chain,
      });

      // Send the actual transaction using the simulated request
      const txHash = await client.writeContract(request);

      // Wait for transaction to be mined
      const resultTx = await readClient.waitForTransactionReceipt({
        hash: txHash,
      });

      if (!resultTx || resultTx.status !== "success") {
        console.error("Transaction failed or not mined:", txHash);
        return null;
      }

      return { resultTx };
    } catch (err) {
      console.error("Error minting DPP:", err);
      throw new Error("Error minting DPP: " + err);
    }
  };

  const getTokenOwner = async (
    dppAddress: `0x${string}`
  ): Promise<string | null> => {
    if (!client || !account) {
      toast.error("Please connect your Universal Profile wallet.");
      throw new Error("Wallet not connected");
    }

    try {
      const owner = await readClient.readContract({
        abi: NFT_ABI,
        address: dppAddress,
        functionName: "tokenOwnerOf",
        args: [tokenId],
      });
      return owner as string;
    } catch (err) {
      console.error("Error fetching token owner:", err);
      toast.error("Failed to fetch token owner.");
      throw new Error("Failed to fetch token owner");
    }
  };

  const transferWithUIDRotation = async ({
    dppAddress,
    to,
    plainUidCode,
    salt,
    newUidHash,
  }: {
    dppAddress: `0x${string}`;
    to: `0x${string}`;
    plainUidCode: string;
    salt: string;
    newUidHash: `0x${string}`;
  }) => {
    if (!client || !account) {
      toast.error("Please connect your Universal Profile wallet.");
      throw new Error("Wallet not connected");
    }

    try {
      const tx = await client.writeContract({
        abi: NFT_ABI,
        address: dppAddress,
        functionName: "transferWithUIDRotation",
        account: account,
        args: [tokenId, to, "0x", salt, plainUidCode, newUidHash],
        chain: client.chain,
      });

      const receipt = await readClient.waitForTransactionReceipt({ hash: tx });
      if (receipt.status !== "success") {
        toast.error("Transfer failed.");
        return null;
      }
      toast.success("Ownership transferred successfully!");
      return { tx };
    } catch (err) {
      console.error("Error transferring ownership:", err);
      toast.error("Transfer failed.");
      throw new Error("Transfer failed");
    }
  };

  return {
    transferWithUIDRotation,
    connectedWallet: account,
    getTokenOwner,
    mintDPP,
  };
};
