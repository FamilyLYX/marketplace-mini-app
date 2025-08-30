/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";

import { useAccount, useConnect } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { sdk } from "@farcaster/miniapp-sdk";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const Home = () => {
  const { isConnected } = useAccount();

  const { connect, connectors } = useConnect();

  // const { disconnect } = useDisconnect();

  useEffect(() => {
    sdk.actions.ready().then(() => {
      console.log("ready");
    });
  }, []);

  return (
    <div className="min-h-[90vh] w-full flex flex-col items-center px-4 md:px-12 py-8">
      {isConnected ? (
        // <div>
        <div className="flex flex-col items-center w-full max-w-[300px] justify-center gap-5 h-[70vh] font-helvetica">
          <Link
            className="bg-black text-center text-white px-4 py-4 rounded-full w-full"
            href="/form"
          >
            Tokenise
          </Link>
          <Link
            className="bg-black text-center text-white px-4 py-4 rounded-full w-full"
            href="/marketplace"
          >
            Marketplace
          </Link>
          {/* <Button onClick={() => disconnect()}>Disconnect</Button> */}
        </div>
      ) : (
        // </div>
        <div>
          <Button onClick={() => connect({ connector: connectors[0] })}>
            Enter
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2 mt-auto">
        <div>POWERED BY</div>
        <div>
          <Image
            src="/universal.svg"
            alt="universal goods"
            width={100}
            height={100}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
