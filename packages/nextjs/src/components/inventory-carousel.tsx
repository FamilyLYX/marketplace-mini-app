/* eslint-disable  @typescript-eslint/no-explicit-any */
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
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export default function InventoryCarousel({ products }: { products: any[] }) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

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
    <div className="w-full flex items-center justify-center">
      <Carousel
        setApi={setApi}
        className="w-full max-w-[700px]"
        opts={{
          align: "center",
          loop: true,
        }}
      >
        <CarouselContent className="gap-4">
          {products.map((product, index) => (
            <CarouselItem key={index} 
            className="pl-4 md:pl-6 basis-1/3">
              <div
                className={cn(
                  "m-6 transition-all duration-300",
                  current === index
                    ? "scale-100"
                    : "scale-90 opacity-30 blur-md",
                )}
              >
                {renderProduct(product)}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
}
