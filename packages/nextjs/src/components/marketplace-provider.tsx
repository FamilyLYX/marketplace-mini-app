"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ThemeProvider } from "next-themes";
import { Toaster } from "./ui/sonner";
import { UpProvider } from "./up-provider";
import { config } from "../lib/wagmi";
import { Suspense } from "react";

const MarketPlaceApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={false}>
      <UpProvider>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </UpProvider>
      <Toaster />
    </ThemeProvider>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const MarketPlaceAppWithProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MarketPlaceApp>{children}</MarketPlaceApp>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
