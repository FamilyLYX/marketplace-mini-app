"use client";
// import BlackButton from "@/components/black-button";
import { getAllNFTMetadataLength } from "@/lib/owner";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useFactoryAddress } from "@/constants/factory";
import { useReadClient } from "@/lib/app-config";
import { useAccount } from "wagmi";
import { PublicClient } from "viem";
import { Button } from "@/components/ui/button";
// import { useEffect } from "react";
// import { sdk } from "@farcaster/miniapp-sdk";
// import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  const factoryAddress = useFactoryAddress();
  const readClient = useReadClient();
  const { chain } = useAccount();

  const { push } = useRouter();
  const { data: countOfContracts, isPending } = useQuery({
    queryKey: ["nftMetadata", chain?.id, factoryAddress],
    queryFn: () =>
      getAllNFTMetadataLength(readClient as PublicClient, factoryAddress),
    enabled: !!chain?.id && !!factoryAddress,
  });

  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center px-4 text-center">
      {/* <ConnectButton showBalance={false} /> */}

      <span className="mb-4 inline-block bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
        {isPending ? (
          <span className="animate-pulse">Loading...</span>
        ) : (
          `Tokenised Products: ${countOfContracts ?? 0}`
        )}
      </span>
      <div className="mb-4 text-[64px]  leading-[-2%]">
        <h1 className="font-extrabold">
          <span className="text-[#FF0000]">Tokenise</span>{" "}
          <span className="text-[#D2D2D2]">Your</span>
        </h1>
        <h1 className="font-extrabold font-display">Products</h1>
      </div>

      <Button
        onClick={() => {
          push("/individual");
        }}
        className="mt-6 w-60 text-base py-2 rounded-full"
      >
        Enter
      </Button>
    </div>
  );
}
