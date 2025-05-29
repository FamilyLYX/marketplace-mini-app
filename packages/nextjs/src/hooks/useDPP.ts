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
  const tokenId = pad("0x0", { size: 32 }); // since rn we are using a fixed tokenId of 0x0, as one quantity of product is available for sale

  const getTokenOwner = async (
    dppAddress: `0x${string}`,
  ): Promise<string | null> => {
    if (!client || !walletConnected || !accounts?.[0]) {
      toast.error("Please connect your Universal Profile wallet.");
      return null;
    }

    try {
      const owner = await readClient.readContract({
        abi: NFT_ABI,
        address: dppAddress,
        functionName: "tokenOwnerOf",
        args: [tokenId],
      });
      console.log("Token owner:", owner);
      return owner as string;
    } catch (err) {
      console.error("Error fetching token owner:", err);
      toast.error("Failed to fetch token owner.");
      return null;
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
    if (!client || !walletConnected || !accounts?.[0]) {
      toast.error("Please connect your Universal Profile wallet.");
      return null;
    }

    try {
      const tokenOwner = await readClient.readContract({
        abi: NFT_ABI,
        address: dppAddress,
        functionName: "tokenOwnerOf",
        args: [tokenId],
      });
      console.log("Token owner:", tokenOwner);
      const request = readClient.simulateContract({
        abi: NFT_ABI,
        address: dppAddress,
        functionName: "transferWithUIDRotation",
        account: accounts[0],
        args: [tokenId, to, "0x", salt, plainUidCode, newUidHash],
        chain: client.chain,
      });
      console.log("Simulation request:", request);
      const tx = await client.writeContract({
        abi: NFT_ABI,
        address: dppAddress,
        functionName: "transferWithUIDRotation",
        account: accounts[0],
        args: [tokenId, to, "0x", salt, plainUidCode, newUidHash],
        chain: client.chain,
      });

      const receipt = await readClient.waitForTransactionReceipt({ hash: tx });
      if (receipt.status !== "success") {
        toast.error("Transfer failed.");
        return null;
      }
      const newOwner = await readClient.readContract({
        abi: NFT_ABI,
        address: dppAddress,
        functionName: "tokenOwnerOf",
        args: [tokenId],
      });
      console.log("Transfer successful:", receipt, "New owner:", newOwner);
      toast.success("Ownership transferred successfully!");
      return { tx };
    } catch (err) {
      console.error("Error transferring ownership:", err);
      toast.error("Transfer failed.");
      return null;
    }
  };

  return {
    transferWithUIDRotation,
    connectedWallet: accounts?.[0],
    walletConnected,
    getTokenOwner,
  };
};
