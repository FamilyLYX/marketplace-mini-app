import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
// import { Inter } from "next/font/google";
import { MarketPlaceAppWithProviders } from "@/components/marketplace-provider";
import NavigationHeader from "@/components/navigation-header";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FamilyLYX: Marketplace",
  description: "Buy, Sell your products",
};

const URL = process.env.NEXT_PUBLIC_URL;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* head content */}
        <meta
          name="fc:miniapp"
          content={`{"version":"1","imageUrl":"${
            URL ?? "https://marketplace-mini-app.vercel.app"
          }/family_logo_white_bg.svg","button":{"title":"🚩 Start","action":{"type":"launch_miniapp","name":"Yoink!","url":"${
            URL ?? "https://marketplace-mini-app.vercel.app"
          }","splashImageUrl":"${
            URL ?? "https://marketplace-mini-app.vercel.app"
          }/family_logo_white_bg.svg","splashBackgroundColor":"#f5f0ec"}}}'`}
        />
        {/* For backward compatibility */}
        <meta
          name="fc:frame"
          content={`{"version":"1","imageUrl":"${
            URL ?? "https://marketplace-mini-app.vercel.app"
          }/family_logo_white_bg.svg","button":{"title":"🚩 Start","action":{"type":"launch_frame","name":"Yoink!","url":"${
            URL ?? "https://marketplace-mini-app.vercel.app"
          }","splashImageUrl":"${
            URL ?? "https://marketplace-mini-app.vercel.app"
          }/family_logo_white_bg.svg","splashBackgroundColor":"#f5f0ec"}}}'`}
        />
      </head>
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
