import { useUpProvider } from "@/components/up-provider";
import { toast } from "sonner";
import { createPublicClient, http, pad } from "viem";
import { luksoTestnet } from "viem/chains";
import { NFT_ABI } from "@/constants/dpp";
const readClient = createPublicClient({
  chain: luksoTestnet,
  transport: http("https://rpc.testnet.lukso.network"),
});

export const useDPP = () => {
  const { client, accounts, walletConnected } = useUpProvider();
  const tokenId = pad("0x1", { size: 32 });

  const transferOwnershipWithUID = async ({
    dppAddress,
    to,
    plainUidCode,
  }: {
    dppAddress: `0x${string}`;
    to: `0x${string}`;
    plainUidCode: string;
  }) => {
    if (!client || !walletConnected || !accounts?.[0]) {
      toast.error("Please connect your Universal Profile wallet.");
      return null;
    }

    try {
      const tx = await client.writeContract({
        abi: NFT_ABI,
        address: dppAddress,
        functionName: "transferOwnershipWithUID",
        account: accounts[0],
        args: [tokenId, to, plainUidCode],
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
      return null;
    }
  };

  const getPublicMetadata = async (dppAddress: `0x${string}`) => {
    try {
      const data = await readClient.readContract({
        abi: NFT_ABI,
        address: dppAddress,
        functionName: "getPublicMetadata",
        args: [tokenId],
      });
      return data as string;
    } catch (err) {
      console.error("Error fetching metadata:", err);
      return null;
    }
  };

  const getEncryptedMetadata = async (dppAddress: `0x${string}`) => {
    try {
      const data = await readClient.readContract({
        abi: NFT_ABI,
        address: dppAddress,
        functionName: "getEncryptedMetadata",
        args: [tokenId],
      });
      return data as string;
    } catch (err) {
      console.error("Error fetching encrypted metadata:", err);
      return null;
    }
  };

  return {
    transferOwnershipWithUID,
    getPublicMetadata,
    getEncryptedMetadata,
    connectedWallet: accounts?.[0],
    walletConnected,
  };
};
