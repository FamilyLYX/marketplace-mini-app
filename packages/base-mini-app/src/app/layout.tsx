import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
// import { Inter } from "next/font/google";
import { MarketPlaceAppWithProviders } from "@/components/marketplace-provider";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";

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
      <body
        className={
          "bg-[length:100%_120vh] h-screen overflow-y-hidden home-background"
        }
      >
        <MarketPlaceAppWithProviders>
          <div className="flex flex-col h-screen overflow-y-auto">
            <NavigationHeader />
            {children}
          </div>
        </MarketPlaceAppWithProviders>
      </body>
    </html>
  );
}
