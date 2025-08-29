import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
// import { Inter } from "next/font/google";
import { MarketPlaceAppWithProviders } from "@/components/marketplace-provider";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FamilyLYX: Marketplace",
  description: "Buy, Sell your products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={""}>
        <MarketPlaceAppWithProviders>{children}</MarketPlaceAppWithProviders>
      </body>
    </html>
  );
}
