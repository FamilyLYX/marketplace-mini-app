"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ThemeProvider } from "next-themes";
import { Toaster } from "./ui/sonner";
import { UpProvider } from "./up-provider";
import { config } from "../lib/wagmi";

// rename this with the name of your app after fork
const TemplateApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <UpProvider>{children}</UpProvider>
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

// This is the main provider for the app. It wraps the app with all the providers needed.
export const TemplateAppWithProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TemplateApp>{children}</TemplateApp>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
