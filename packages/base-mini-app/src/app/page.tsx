/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { sdk } from "@farcaster/miniapp-sdk";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Home = () => {
  const { isConnected } = useAccount();

  const { connect, connectors } = useConnect();

  const { disconnect } = useDisconnect();

  useEffect(() => {
    sdk.actions.ready().then(() => {
      console.log("ready");
    });
  }, []);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center px-4 md:px-12 py-8">
      {isConnected ? (
        <div>
          <div className="flex flex-col items-center justify-center">
            <Link href="/tokenise">Tokenise</Link>
            <Link href="/marketplace">Marketplace</Link>
            <Button onClick={() => disconnect()}>Disconnect</Button>
          </div>
        </div>
      ) : (
        <div>
          <Button onClick={() => connect({ connector: connectors[0] })}>
            Enter
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
