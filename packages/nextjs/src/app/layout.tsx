import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { TemplateAppWithProviders } from "@/components/template-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Forkable Next.js Template",
  description: "A template for Next.js with UP provider and Wagmi and supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <TemplateAppWithProviders>{children}</TemplateAppWithProviders>
      </body>
    </html>
  );
}
