/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { ProductCard } from "@/components/product";
import { AlreadyInMarketplace } from "@/components/inmarketplace-product";
import { ProductMetadata } from "@/components/product";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function InventoryCarousel({ products }: { products: any[] }) {
  const renderProduct = (item: any) => {
    if (item.type === "add") {
      return (
        <ProductCard
          metadata={item.data.decodedMetadata}
          nftAddress={item.data.nftAddress}
        />
      );
    } else if (item.type === "in-marketplace") {
      const metadata: ProductMetadata = {
        title: item.data.title,
        description: item.data.description ?? "",
        category: item.data.category ?? "",
        brand: item.data.brand ?? "",
        images: item.data.images ?? [],
      };
      return <AlreadyInMarketplace metadata={metadata} vault={item.data} />;
    }
    return null;
  };

  return (
    <div className="w-full max-w-[700px] mx-auto flex flex-col items-center">
      <Carousel
        className="w-full"
        opts={{
          align: "center",
          loop: true,
          skipSnaps: false,
        }}
      >
        <CarouselContent>
          {products.map((product, index) => (
            <CarouselItem key={index} className="flex">
              {renderProduct(product)}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-200 p-2 hover:bg-gray-300 cursor-pointer" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-200 p-2 hover:bg-gray-300 cursor-pointer" />
      </Carousel>
    </div>
  );
}
