/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getAllNFTMetadata } from "@/lib/owner";
import { Vault } from "@/types";
import { getAddress } from "viem";
import { useUpProvider } from "@/components/up-provider";
import AdminProductChats from "@/components/admin-product-chats";
import Image from "next/image";
import ProductMarketplaceCarousel from "@/components/product-marketplace-carousel";
import InventoryCarousel from "@/components/inventory-carousel";
import OrdersCarousel from "@/components/orders-carousel";

const adminAddress =
  (process.env.NEXT_PUBLIC_ADMIN_ADDRESS as `0x${string}`) || "";

const Inventory = () => {
  const { accounts } = useUpProvider();

  const { data, isLoading: isNFTsLoading } = useQuery({
    queryKey: ["allNfts"],
    queryFn: () => getAllNFTMetadata(),
    refetchOnWindowFocus: false,
    refetchInterval: 1000,
  });

  const { data: marketplace, isLoading: isMarketplaceLoading } = useQuery({
    queryKey: ["marketplaceProducts"],
    queryFn: async () => {
      const response = await fetch("/api/vaults");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  const orderedProducts = React.useMemo(() => {
    if (!marketplace || !accounts || accounts.length === 0) return [];
    return marketplace
      .filter(
        (p: Vault) =>
          (p.order_status === "pending" &&
            p.buyer === getAddress(accounts[0])) ||
          (p.order_status === "disputed" &&
            p.buyer === getAddress(accounts[0])),
      )
      .sort(
        (a: Vault, b: Vault) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }, [marketplace, accounts]);

  const confirmedProducts = React.useMemo(() => {
    if (!marketplace || !accounts || accounts.length === 0) return [];
    return marketplace
      .filter(
        (p: Vault) =>
          p.order_status === "confirmed" && p.buyer === getAddress(accounts[0]),
      )
      .sort(
        (a: Vault, b: Vault) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }, [marketplace, accounts]);

  const marketplaceProducts = React.useMemo(() => {
    if (!marketplace) return [];
    return marketplace
      .filter((p: Vault) => p.order_status === null)
      .sort(
        (a: Vault, b: Vault) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }, [marketplace]);

  const products = React.useMemo(() => {
    if (!data || !accounts || accounts.length === 0) return [];
    return data[getAddress(accounts[0])] ?? [];
  }, [data, accounts]);

  const nftAddressToVaultMap = React.useMemo(() => {
    if (!marketplace) return new Map<string, Vault>();
    const map = new Map<string, Vault>();
    marketplace.forEach((p: Vault) => {
      if (p.nft_contract) {
        map.set(p.nft_contract, p);
      }
    });
    return map;
  }, [marketplace]);

  const addToMarketplaceProducts = React.useMemo(() => {
    if (!products || !accounts || accounts.length === 0) return [];

    const userAddress = getAddress(accounts[0]);
    console.log(products);
    return products.filter((product: { nftAddress: string }) => {
      const vault = nftAddressToVaultMap.get(product.nftAddress);
      if (!vault) return true; // Keep products that don't have a vault (e.g., user's own NFTs not yet in marketplace)

      // For products with a vault, include them if the user is either the seller or the buyer
      const isSeller = vault.seller.toLowerCase() === userAddress.toLowerCase();
      const isBuyer = vault.buyer?.toLowerCase() === userAddress.toLowerCase();

      return isSeller || isBuyer;
    });
  }, [products, nftAddressToVaultMap, accounts]);

  const alreadyInMarketplaceProducts = React.useMemo(() => {
    if (!marketplace || !accounts || accounts.length === 0) return [];
    return marketplace.filter(
      (p: Vault) => p.seller === getAddress(accounts[0]),
    );
  }, [marketplace, accounts]);

  const allInventoryProducts = React.useMemo(() => {
    const addProducts = addToMarketplaceProducts.map((product: any) => ({
      type: "add",
      data: product,
    }));
    const inMarketplaceProducts = alreadyInMarketplaceProducts.map(
      (vault: Vault) => ({
        type: "in-marketplace",
        data: vault,
      }),
    );
    return [...addProducts, ...inMarketplaceProducts];
  }, [addToMarketplaceProducts, alreadyInMarketplaceProducts]);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center px-4 md:px-12 py-8">
      <div className=" flex flex-col items-center justify-center text-center mb-6">
        <Image
          src="/family_logo_white_bg.svg"
          alt="Family Logo"
          width={64}
          height={64}
          className="mt-2 w-16 h-16"
        />
        <h1 className="font-serif text-5xl font-black tracking-tight">
          Universal Goods
        </h1>
        <p className="mt-2 text-xs text-gray-500">
          Marketplace for digitally traced products with escrow management
        </p>
      </div>

      <Tabs
        defaultValue="marketplace"
        className="w-full flex items-center justify-center w-full"
      >
        <TabsList className="gap-2 bg-gray-100 rounded-full mb-6">
          <TabsTrigger
            value="marketplace"
            className="rounded-full px-4 py-1 text-xs data-[state=active]:bg-black data-[state=active]:text-white"
          >
            Marketplace
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="rounded-full px-4 py-1 text-xs data-[state=active]:bg-black data-[state=active]:text-white"
          >
            Inventory
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="rounded-full px-4 py-1 text-xs data-[state=active]:bg-black data-[state=active]:text-white"
          >
            Orders
          </TabsTrigger>
          {accounts &&
            accounts.length > 0 &&
            getAddress(accounts[0]).toLowerCase() ===
              adminAddress.toLowerCase() && (
              <TabsTrigger
                value="admin"
                className="rounded-full px-4 py-1 text-xs data-[state=active]:bg-black data-[state=active]:text-white"
              >
                Admin
              </TabsTrigger>
            )}
        </TabsList>
        <TabsContent value="marketplace">
          {isMarketplaceLoading ? (
            <div className="flex flex-col items-center justify-center w-full h-[300px]">
              <p className="text-muted-foreground text-center text-sm">
                Loading marketplace products...
              </p>
            </div>
          ) : marketplaceProducts && marketplaceProducts.length > 0 ? (
            <div className="flex flex-col items-center w-full">
              <ProductMarketplaceCarousel products={marketplaceProducts} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-[500px]">
              <p className="text-muted-foreground text-center text-sm">
                No products available in the marketplace yet.
              </p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="orders">
          <div className="flex flex-col gap-10 max-w-6xl w-full">
            {isMarketplaceLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading your orders...
              </p>
            ) : (
              <>
                <div className="flex flex-col gap-4 w-full">
                  <h2 className="text-2xl font-semibold">Your Orders</h2>
                  {orderedProducts.length > 0 ||
                  confirmedProducts.length > 0 ? (
                    <OrdersCarousel
                      orders={[
                        ...orderedProducts.map((vault: Vault) => ({
                          type: "shipping" as const,
                          data: vault,
                        })),
                        ...confirmedProducts.map((vault: Vault) => ({
                          type: "delivered" as const,
                          data: vault,
                        })),
                      ]}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No orders found.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </TabsContent>
        <TabsContent value="products">
          <div className="flex flex-col gap-10 max-w-6xl w-full">
            <h2 className="text-2xl font-semibold">Your Inventory</h2>
            {isNFTsLoading || isMarketplaceLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading your products...
              </p>
            ) : allInventoryProducts.length > 0 ? (
              <InventoryCarousel products={allInventoryProducts} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Tokenize products to add to the marketplace.
              </p>
            )}
          </div>
        </TabsContent>
        {/* Admin Section */}
        {accounts &&
          accounts.length > 0 &&
          getAddress(accounts[0]).toLowerCase() ===
            adminAddress.toLowerCase() && (
            <TabsContent value="admin">
              <div className="flex flex-col gap-10 max-w-6xl w-full">
                <h2 className="text-2xl font-semibold">Admin Section</h2>
                <p className="text-sm text-muted-foreground">
                  This section is for admin purposes only.
                </p>
                <AdminProductChats />
              </div>
            </TabsContent>
          )}{" "}
      </Tabs>
    </div>
  );
};

export default Inventory;
