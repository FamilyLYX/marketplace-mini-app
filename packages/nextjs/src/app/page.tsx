"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProductCard } from "@/components/product";
import { useQuery } from "@tanstack/react-query";
import { getAllNFTMetadata } from "@/lib/owner";
import { BuyProduct } from "@/components/buy-product";
import { Vault } from "@/types";
import { ConfirmProduct } from "@/components/confirm-product";
import { PurchasedProductCard } from "@/components/purchased-product";
import { getAddress } from "viem";
import { useUpProvider } from "@/components/up-provider";

const Inventory = () => {
  const { accounts } = useUpProvider();

  const { data } = useQuery({
    queryKey: ["allNfts"],
    queryFn: () => getAllNFTMetadata(),
    refetchOnWindowFocus: false,
  });
  const { data: marketplace } = useQuery({
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
    if (!marketplace) return [];
    return marketplace
      .filter((p: Vault) => p.order_status === "pending")
      .sort((a: Vault, b: Vault) => {
        const aDate = new Date(a.created_at);
        const bDate = new Date(b.created_at);
        return bDate.getTime() - aDate.getTime();
      });
  }, [marketplace]);

  const confirmedProducts = React.useMemo(() => {
    if (!marketplace) return [];
    return marketplace
      .filter((p: Vault) => p.order_status === "confirmed")
      .sort((a: Vault, b: Vault) => {
        const aDate = new Date(a.created_at);
        const bDate = new Date(b.created_at);
        return bDate.getTime() - aDate.getTime();
      });
  }, [marketplace]);

  const marketplaceProducts = React.useMemo(() => {
    if (!marketplace) return [];
    return marketplace
      .filter((p: Vault) => p.order_status === undefined)
      .sort((a: Vault, b: Vault) => {
        const aDate = new Date(a.created_at);
        const bDate = new Date(b.created_at);
        return bDate.getTime() - aDate.getTime();
      });
  }, [marketplace]);

  const products = React.useMemo(() => {
    if (!data || !accounts || accounts.length === 0) return [];
    return data[getAddress(accounts[0])] ?? [];
  }, [data, accounts]);

  const vaultNFTAddresses = React.useMemo(() => {
    if (!marketplace) return new Set<string>();
    const set = new Set<string>();
    marketplace.forEach((p: Vault) => {
      if (p.nft_contract) {
        set.add(p.nft_contract.toLowerCase());
      }
    });
    return set;
  }, [marketplace]);

  const addToMarketplaceProducts = React.useMemo(() => {
    return products.filter((product: { nftAddress: string }) => {
      return !vaultNFTAddresses.has(product.nftAddress.toLowerCase());
    });
  }, [products, vaultNFTAddresses]);

  const alreadyInMarketplaceProducts = React.useMemo(() => {
    return products.filter((product: { nftAddress: string }) => {
      return vaultNFTAddresses.has(product.nftAddress.toLowerCase());
    });
  }, [products, vaultNFTAddresses]);

  const isEmpty =
    addToMarketplaceProducts.length === 0 &&
    alreadyInMarketplaceProducts.length === 0;

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
          {marketplaceProducts && marketplaceProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
              {marketplaceProducts.map(
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
            {/* Shipping Section */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold">Shipping</h2>
              {orderedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        key={`shipping-${index}`}
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
              ) : (
                <p className="text-sm text-muted-foreground">
                  No products currently in shipping.
                </p>
              )}
            </div>

            {/* Delivered Section */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold">Delivered</h2>
              {confirmedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {confirmedProducts.map(
                    (
                      {
                        title = "",
                        description = "",
                        images = [],
                        category = "",
                        brand = "",
                      }: Vault,
                      index: number,
                    ) => (
                      <PurchasedProductCard
                        key={`delivered-${index}`}
                        metadata={{
                          title,
                          description,
                          images,
                          category,
                          brand,
                        }}
                      />
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No products delivered yet.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="flex flex-col gap-10 w-full">
            {/* Add to Marketplace Section */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Add to Marketplace</h2>
              {addToMarketplaceProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
                  {addToMarketplaceProducts.map(
                    (
                      { nftAddress, decodedMetadata, expectedUIDHash },
                      index,
                    ) => (
                      <ProductCard
                        key={index}
                        metadata={decodedMetadata}
                        nftAddress={nftAddress}
                        expectedUIDHash={expectedUIDHash}
                      />
                    ),
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-[300px] border rounded-lg">
                  <p className="text-muted-foreground text-center text-sm">
                    No products available to add to marketplace.
                  </p>
                </div>
              )}
            </div>

            {/* Already in Marketplace Section */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Already in Marketplace</h2>
              <div className="flex items-center justify-center w-full h-[300px] border rounded-lg">
                <p className="text-muted-foreground text-center text-sm">
                  Coming soon... 🚀
                </p>
              </div>
            </div>
          </div>

          {/* Overall Empty State if products and marketplace products are BOTH empty */}
          {products.length === 0 && addToMarketplaceProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center w-full h-[500px] mt-10">
              <p className="text-muted-foreground text-center text-sm">
                You can tokenize products to add to the marketplace.
              </p>
              <a
                href="LINK_TO_TOKENIZE"
                className="mt-4 px-4 py-2 bg-black text-white rounded text-xs"
              >
                Tokenize Products
              </a>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
