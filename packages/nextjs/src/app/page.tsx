"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProductCard, ProductMetadata } from "@/components/product";
import { useQuery } from "@tanstack/react-query";
import { getAllNFTMetadata } from "@/lib/owner";
import { BuyProduct } from "@/components/buy-product";
import { Vault } from "@/types";
import { ConfirmProduct } from "@/components/confirm-product";
import { PurchasedProductCard } from "@/components/purchased-product";
import { getAddress } from "viem";
import { useUpProvider } from "@/components/up-provider";
import { AlreadyInMarketplace } from "@/components/inmarketplace-product";

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
    if (!marketplace || !accounts || accounts.length === 0) return [];
    return marketplace
      .filter(
        (p: Vault) => p.order_status === "pending" && p.buyer === getAddress(accounts[0]),
      )
      .sort((a: Vault, b: Vault) => {
        const aDate = new Date(a.created_at);
        const bDate = new Date(b.created_at);
        return bDate.getTime() - aDate.getTime();
      });
  }, [marketplace, accounts]);

  const confirmedProducts = React.useMemo(() => {
    if (!marketplace || !accounts || accounts.length === 0) return [];
    return marketplace
      .filter(
        (p: Vault) => p.order_status === "confirmed" && p.buyer === getAddress(accounts[0]),
      )
      .sort((a: Vault, b: Vault) => {
        const aDate = new Date(a.created_at);
        const bDate = new Date(b.created_at);
        return bDate.getTime() - aDate.getTime();
      });
  }, [marketplace, accounts]);

  const marketplaceProducts = React.useMemo(() => {
    if (!marketplace) return [];
    return marketplace
      .filter((p: Vault) => p.order_status === null)
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
        set.add(p.nft_contract);
      }
    });
    return set;
  }, [marketplace]);

  const addToMarketplaceProducts = React.useMemo(() => {
    return products.filter((product: { nftAddress: string }) => {
      return !vaultNFTAddresses.has(product.nftAddress);
    });
  }, [products, vaultNFTAddresses]);

  const alreadyInMarketplaceProducts = React.useMemo(() => {
    if (!marketplace) {
      return [];
    }
    return products
      .filter((product: { nftAddress: string }) => {
        const has = vaultNFTAddresses.has(product.nftAddress);
        return has;
      })
      .map(
        (product: {
          nftAddress: string;
          decodedMetadata: unknown;
          expectedUIDHash: string;
        }) => {
          const matchedVault = marketplace.find(
            (p: Vault) => p.nft_contract === product.nftAddress,
          );
          return {
            ...product,
            vault: matchedVault,
          };
        },
      );
  }, [products, vaultNFTAddresses, marketplace]);
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center px-4 md:px-12 py-8">
      <div className="text-center mb-6">
        <h2 className="text-xl font-[cursive] italic text-black mb-2">
          family
        </h2>
        <h1 className="font-serif text-5xl font-black tracking-tight">
          Marketplace
        </h1>
        <p className="mt-2 text-xs text-gray-500">
          Manage your products, orders, and marketplace listings all in one
          place.
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
            <div className="flex flex-col gap-4 w-full">
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
                        seller = "",
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
                        seller={seller}
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
          <div className="flex flex-col gap-10 max-w-6xl w-full">
            {/* Place in Marketplace Section */}
            <div className="flex flex-col gap-4 w-full">
              <h2 className="text-2xl font-semibold">Place in Marketplace</h2>
              {addToMarketplaceProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {addToMarketplaceProducts.map(
                    (
                      { nftAddress, decodedMetadata, expectedUIDHash },
                      index,
                    ) => (
                      <ProductCard
                        key={`add-${index}`}
                        metadata={decodedMetadata}
                        nftAddress={nftAddress}
                        expectedUIDHash={expectedUIDHash}
                      />
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tokenize products to add to the marketplace.
                </p>
              )}
            </div>

            {/* In Marketplace Section */}
            <div className="flex flex-col gap-4 w-full">
              <h2 className="text-2xl font-semibold">In Marketplace</h2>
              {alreadyInMarketplaceProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {alreadyInMarketplaceProducts.map(
                    ({ decodedMetadata, vault }, index) => (
                      <AlreadyInMarketplace
                        key={`in-marketplace-${index}`}
                        metadata={decodedMetadata as ProductMetadata}
                        vault={vault}
                      />
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No products currently listed in marketplace.
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
