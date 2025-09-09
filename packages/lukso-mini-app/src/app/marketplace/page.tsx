/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getAllNFTMetadata } from "@/lib/owner";
import { Vault } from "@/types";
import { getAddress, PublicClient } from "viem";
// import { useUpProvider } from "@/components/up-provider";
import AdminProductChats from "@/components/admin-product-chats";
import ProductMarketplaceCarousel from "@/components/product-marketplace-carousel";
import InventoryCarousel from "@/components/inventory-carousel";
import OrdersCarousel from "@/components/orders-carousel";
import { fetchWithAuth } from "@/lib/api";
import { appConfig, useReadClient } from "@/lib/app-config";
import { useFactoryAddress } from "@/constants/factory";
import { useUpProvider } from "@/components/up-provider";

export default function Marketplace() {
  const { address: account, chainId } = useUpProvider();
  const factoryAddress = useFactoryAddress();
  const readClient = useReadClient();
  const { data, isLoading: isNFTsLoading } = useQuery({
    queryKey: ["allNfts", factoryAddress, account],
    queryFn: () =>
      getAllNFTMetadata(readClient as PublicClient, factoryAddress),
    // refetchOnWindowFocus: false,
  });

  console.log("data:1", data, isNFTsLoading);

  const { data: marketplace, isLoading: isMarketplaceLoading } = useQuery({
    queryKey: ["marketplaceProducts"],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/vaults?chainId=${chainId}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  const orderedProducts = React.useMemo(() => {
    console.log("marketplace", marketplace);
    if (!marketplace || !account) return [];
    console.log({ marketplace });
    return marketplace
      ?.filter(
        (p: Vault) =>
          (p.order_status === "pending" && p.buyer === getAddress(account)) ||
          (p.order_status === "disputed" && p.buyer === getAddress(account))
      )
      .sort(
        (a: Vault, b: Vault) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [marketplace, account]);

  const confirmedProducts = React.useMemo(() => {
    if (!marketplace || !account) return [];
    return marketplace
      ?.filter(
        (p: Vault) =>
          p.order_status === "confirmed" && p.buyer === getAddress(account)
      )
      .sort(
        (a: Vault, b: Vault) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [marketplace, account]);

  const marketplaceProducts = React.useMemo(() => {
    if (!marketplace) return [];
    return marketplace
      ?.filter((p: Vault) => p.order_status === "")
      ?.sort(
        (a: Vault, b: Vault) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [marketplace]);

  const products = React.useMemo(() => {
    console.log("data1", data, account);
    if (!data || !account) return [];
    console.log(
      "data:2",
      data,
      account === getAddress(account),
      data[getAddress(account!)]
    );
    return data[getAddress(account!)] ?? [];
  }, [data, account]);

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
    if (!products || !account) return [];

    console.log("data: products", products);

    const userAddress = getAddress(account);
    return products.filter((product: { nftAddress: string }) => {
      const vault = nftAddressToVaultMap.get(product.nftAddress);
      if (!vault) return true; // Keep products that don't have a vault (e.g., user's own NFTs not yet in marketplace)

      // For products with a vault, include them if the user is either the seller or the buyer
      const isSeller = vault.seller.toLowerCase() === userAddress.toLowerCase();
      const isBuyer = vault.buyer?.toLowerCase() === userAddress.toLowerCase();

      return isSeller || isBuyer;
    });
  }, [products, nftAddressToVaultMap, account]);

  const alreadyInMarketplaceProducts = React.useMemo(() => {
    if (!marketplace || !account) return [];
    return marketplace.filter((p: Vault) => p.seller === getAddress(account));
  }, [marketplace, account]);

  const allInventoryProducts = React.useMemo(() => {
    const addProducts = addToMarketplaceProducts.map((product: any) => ({
      type: "add",
      data: product,
    }));

    console.log("data: addToMarketplaceProducts", addToMarketplaceProducts);
    const inMarketplaceProducts = alreadyInMarketplaceProducts.map(
      (vault: Vault) => ({
        type: "in-marketplace",
        data: vault,
      })
    );
    return [...addProducts, ...inMarketplaceProducts];
  }, [addToMarketplaceProducts, alreadyInMarketplaceProducts]);

  const allOrders = React.useMemo(() => {
    const shippingProducts = orderedProducts.map((vault: Vault) => ({
      type: "shipping",
      data: vault,
    }));
    const deliveredProducts = confirmedProducts.map((vault: Vault) => ({
      type: "delivered",
      data: vault,
    }));
    return [...shippingProducts, ...deliveredProducts].sort(
      (a, b) =>
        new Date(b.data.created_at).getTime() -
        new Date(a.data.created_at).getTime()
    );
  }, [orderedProducts, confirmedProducts]);

  return (
    <div className="w-full flex flex-col items-center px-4 md:px-12 py-8 pb-2">
      <Tabs
        defaultValue="marketplace"
        className="w-full flex items-center justify-center"
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
          {account &&
            getAddress(account).toLowerCase() ===
              appConfig.adminAddress.toLowerCase() && (
              <TabsTrigger
                value="admin"
                className="rounded-full px-4 py-1 text-xs data-[state=active]:bg-black data-[state=active]:text-white"
              >
                Admin
              </TabsTrigger>
            )}
        </TabsList>
        <TabsContent
          value="marketplace"
          style={{
            width: "100%",
          }}
        >
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
        <TabsContent
          value="orders"
          style={{
            width: "100%",
          }}
        >
          <div className="flex flex-col gap-10 max-w-6xl w-full">
            {isMarketplaceLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading your orders...
              </p>
            ) : (
              <>
                <div className="flex flex-col gap-4 w-full">
                  {orderedProducts.length > 0 ||
                  confirmedProducts.length > 0 ? (
                    <OrdersCarousel orders={allOrders} />
                  ) : (
                    <p className="text-sm text-muted-foreground flex items-center justify-center h-[500px]">
                      No orders found.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </TabsContent>
        <TabsContent
          value="products"
          style={{
            width: "100%",
          }}
        >
          <div className="flex flex-col gap-10 w-full">
            {isMarketplaceLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading your products...
              </p>
            ) : allInventoryProducts.length > 0 ? (
              <InventoryCarousel products={allInventoryProducts} />
            ) : (
              <p className="text-sm text-muted-foreground flex items-center justify-center h-[500px]">
                Tokenize products to add to the marketplace.
              </p>
            )}
          </div>
        </TabsContent>
        {/* Admin Section */}
        {account &&
          getAddress(account).toLowerCase() ===
            appConfig.adminAddress.toLowerCase() && (
            <TabsContent
              value="admin"
              style={{
                width: "100%",
              }}
            >
              <div className="flex flex-col gap-10 max-w-6xl w-full">
                <h2 className="text-2xl font-semibold title">Admin Section</h2>
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
}
