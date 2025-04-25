"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProductCard } from "@/components/product";
import { useQuery } from "@tanstack/react-query";
import { getAllNFTMetadata } from "@/lib/owner";
import { BuyProduct } from "@/components/buy-product";
import { Vault } from "@/types";
import { ConfirmProduct } from "@/components/confirm-product";
// import { useUpProvider } from "@/components/up-provider";
// import { getAddress } from "viem";
const Inventory = () => {
  // const { accounts } = useUpProvider();

  const { data } = useQuery({
    queryKey: ["allNfts"],
    queryFn: () => getAllNFTMetadata(),
    refetchOnWindowFocus: false,
  });
  const { data: marketplaceProducts } = useQuery({
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

  // TODO: add address to this logic
  const orderedProducts = React.useMemo(() => {
    if (!marketplaceProducts) return [];
    return marketplaceProducts
      .filter((p: Vault) => p.order_status === "pending")
      .sort((a: Vault, b: Vault) => {
        const aDate = new Date(a.created_at);
        const bDate = new Date(b.created_at);
        return bDate.getTime() - aDate.getTime();
      });
  }, [marketplaceProducts]);

  // const products = React.useMemo(() => {
  //   if (!data || !accounts || accounts.length === 0) return [];
  //   return data[getAddress(accounts[0])] ?? [];
  // }, [data, accounts]);

  const products = React.useMemo(() => {
    if (!data) return [];
    return Object.values(data).flat();
  }, [data]);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center px-4 md:px-12 py-8">
      <div className="text-center mb-6">
        <h1 className="font-serif text-5xl font-black tracking-tight">
          Inventory
        </h1>
        <p className="mt-2 text-xs text-gray-500">
          Here you can fully interact with your NFTs, sell them, study them,
          etc.
        </p>
      </div>

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
            Your Products
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="rounded-full px-4 py-1 text-xs data-[state=active]:bg-black data-[state=active]:text-white"
          >
            Orders
          </TabsTrigger>
        </TabsList>
        <TabsContent value="marketplace">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
            {marketplaceProducts?.map(
              (
                {
                  title = "",
                  description = "",
                  images = [],
                  category = "",
                  vault_address = "",
                  notes = "",
                  location = "",
                  seller = "",
                  brand = "",
                  price_in_lyx,
                }: Vault,
                index: number,
              ) => (
                <BuyProduct
                  key={index}
                  metadata={{
                    title,
                    description,
                    images,
                    category,
                    brand,
                  }}
                  vaultAddress={vault_address}
                  condition={notes}
                  location={location}
                  sellerAddress={seller}
                  priceInLYX={price_in_lyx}
                />
              ),
            )}
          </div>
        </TabsContent>
        <TabsContent value="orders">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
            {orderedProducts.map(
              (
                {
                  title = "",
                  description = "",
                  images = [],
                  category = "",
                  vault_address = "",
                  notes = "",
                  location = "",
                  seller = "",
                  brand = "",
                }: Vault,
                index: number,
              ) => (
                <ConfirmProduct
                  key={index}
                  metadata={{
                    title,
                    description,
                    images,
                    category,
                    brand,
                  }}
                  vaultAddress={vault_address}
                  condition={notes}
                  location={location}
                  sellerAddress={seller}
                />
              ),
            )}
          </div>
        </TabsContent>
        <TabsContent value="products">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
            {products.map(
              ({ nftAddress, decodedMetadata, expectedUIDHash }, index) => (
                <ProductCard
                  key={index}
                  metadata={decodedMetadata}
                  nftAddress={nftAddress}
                  expectedUIDHash={expectedUIDHash}
                />
              ),
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
