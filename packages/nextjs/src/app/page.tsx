"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProductCard } from "@/components/product";
import { useQuery } from "@tanstack/react-query";
import { getAllNFTMetadata } from "@/lib/owner";

const Inventory = () => {
  // do a call to getAllNFTMetadata
  const { data } = useQuery({
    queryKey: ["allNfts"],
    queryFn: () => getAllNFTMetadata(),
    refetchOnWindowFocus: false,
  });
  console.log("data", data);
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
        defaultValue="products"
        className="w-full flex items-center justify-center"
      >
        <TabsList className="gap-2 bg-gray-100 rounded-full mb-6">
          <TabsTrigger
            value="products"
            className="rounded-full px-4 py-1 text-xs data-[state=active]:bg-black data-[state=active]:text-white"
          >
            Your Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full"></div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;

// {products.map((product, index) => (
//               <ProductCard key={index} metadata={product} />
//             ))}
