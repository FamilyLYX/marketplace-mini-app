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
import AdminProductChats from "@/components/admin-product-chats";
const adminAddress =
  process.env.NEXT_PUBLIC_ADMIN_ADDRESS ||
  "0x9dD1084ac41e6234931680Cc1214691C4f098C01";
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
          (p.order_status === "disputed" && p.buyer === getAddress(accounts[0]))
      )
      .sort(
        (a: Vault, b: Vault) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [marketplace, accounts]);

  const confirmedProducts = React.useMemo(() => {
    if (!marketplace || !accounts || accounts.length === 0) return [];
    return marketplace
      .filter(
        (p: Vault) =>
          p.order_status === "confirmed" && p.buyer === getAddress(accounts[0])
      )
      .sort(
        (a: Vault, b: Vault) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [marketplace, accounts]);

  const marketplaceProducts = React.useMemo(() => {
    if (!marketplace) return [];
    return marketplace
      .filter((p: Vault) => p.order_status === null)
      .sort(
        (a: Vault, b: Vault) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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

    return products.filter((product: { nftAddress: string }) => {
      const vault = nftAddressToVaultMap.get(product.nftAddress);
      if (!vault) return true;
      return vault.seller.toLowerCase() !== userAddress.toLowerCase();
    });
  }, [products, nftAddressToVaultMap, accounts]);

  const alreadyInMarketplaceProducts = React.useMemo(() => {
    if (!marketplace || !accounts || accounts.length === 0) return [];
    return marketplace.filter(
      (p: Vault) => p.seller === getAddress(accounts[0])
    );
  }, [marketplace, accounts]);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center px-4 md:px-12 py-8">
      <div className="text-center mb-6">
        <h2 className="text-xl font-[cursive] italic text-black mb-2">
          family
        </h2>
        <h1 className="font-serif text-5xl font-black tracking-tight title">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
              {marketplaceProducts.map((vault: Vault, index: number) => (
                <BuyProduct
                  key={index}
                  metadata={{
                    title: vault.title ?? "",
                    description: vault.description ?? "",
                    images: vault.images ?? [],
                    category: vault.category ?? "",
                    brand: vault.brand ?? "",
                  }}
                  vaultAddress={vault.vault_address}
                  condition={vault.notes as string}
                  location={vault.location as string}
                  sellerAddress={vault.seller}
                  priceInLYX={vault.price_in_lyx}
                />
              ))}
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
              <h2 className="text-2xl font-semibold title">Shipping</h2>
              {isMarketplaceLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading your orders...
                </p>
              ) : orderedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {orderedProducts.map((vault: Vault, index: number) => (
                    <ConfirmProduct
                      key={`shipping-${index}`}
                      vault={vault}
                      metadata={{
                        title: vault.title ?? "",
                        description: vault.description ?? "",
                        images: vault.images ?? [],
                        category: vault.category ?? "",
                        brand: vault.brand ?? "",
                      }}
                      vaultAddress={vault.vault_address}
                      condition={vault.notes as string}
                      location={vault.location as string}
                      sellerAddress={vault.seller}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No products currently in shipping.
                </p>
              )}
            </div>

            {/* Delivered Section */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold title">Delivered</h2>
              {isMarketplaceLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading delivered products...
                </p>
              ) : confirmedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {confirmedProducts.map((vault: Vault, index: number) => (
                    <PurchasedProductCard
                      key={`delivered-${index}`}
                      metadata={{
                        title: vault.title ?? "",
                        description: vault.description ?? "",
                        images: vault.images ?? [],
                        category: vault.category ?? "",
                        brand: vault.brand ?? "",
                      }}
                      seller={vault.seller}
                    />
                  ))}
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
              <h2 className="text-2xl font-semibold title">
                Place in Marketplace
              </h2>
              {isNFTsLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading your products...
                </p>
              ) : addToMarketplaceProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {addToMarketplaceProducts.map((product, index) => (
                    <ProductCard
                      key={`add-${index}`}
                      metadata={product.decodedMetadata}
                      nftAddress={product.nftAddress}
                      expectedUIDHash={product.expectedUIDHash}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tokenize products to add to the marketplace.
                </p>
              )}
            </div>

            {/* In Marketplace Section */}
            <div className="flex flex-col gap-4 w-full">
              <h2 className="text-2xl font-semibold title">In Marketplace</h2>
              {isMarketplaceLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading your marketplace listings...
                </p>
              ) : alreadyInMarketplaceProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {alreadyInMarketplaceProducts.map(
                    (vault: Vault, index: number) => {
                      const metadata: ProductMetadata = {
                        title: vault.title,
                        description: vault.description ?? "",
                        category: vault.category ?? "",
                        brand: vault.brand ?? "",
                        images: vault.images ?? [],
                      };

                      return (
                        <AlreadyInMarketplace
                          key={`in-marketplace-${index}`}
                          metadata={metadata}
                          vault={vault}
                        />
                      );
                    }
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
        {/* Admin Section */}
        {accounts &&
          accounts.length > 0 &&
          getAddress(accounts[0]).toLowerCase() ===
            adminAddress.toLowerCase() && (
            <TabsContent value="admin">
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
};

export default Inventory;
