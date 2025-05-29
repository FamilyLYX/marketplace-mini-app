/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from "react";
import { ConfirmProduct } from "@/components/confirm-product";
import { PurchasedProductCard } from "@/components/purchased-product";
import { Vault } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type OrderItem = {
  type: "shipping" | "delivered";
  data: Vault;
};

export default function OrdersCarousel({ orders }: { orders: OrderItem[] }) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const renderOrder = (item: OrderItem) => {
    const metadata = {
      title: item.data.title ?? "",
      description: item.data.description ?? "",
      images: item.data.images ?? [],
      category: item.data.category ?? "",
      brand: item.data.brand ?? "",
    };

    if (item.type === "shipping") {
      return (
        <ConfirmProduct
          vault={item.data}
          metadata={metadata}
          vaultAddress={item.data.vault_address}
          condition={item.data.notes as string}
          location={item.data.location as string}
          sellerAddress={item.data.seller}
        />
      );
    } else if (item.type === "delivered") {
      return <PurchasedProductCard metadata={metadata} vault={item.data} />;
    }
    return null;
  };

  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex items-center justify-center">
      <Carousel
        setApi={setApi}
        className="w-full max-w-[700px]"
        opts={{
          align: "center",
          loop: orders.length > 1,
        }}
      >
        <CarouselContent className="gap-4">
          {orders.map((order, index) => (
            <CarouselItem 
              key={index} 
              className={cn(
                "pl-4 md:pl-6",
                orders.length === 1 ? "basis-full" : "basis-1/3"
              )}
            >
              <div
                className={cn(
                  "m-6 transition-all duration-300",
                  current === index
                    ? "scale-100"
                    : "scale-90 opacity-30 blur-md"
                )}
              >
                {renderOrder(order)}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {orders.length > 1 && (
          <>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </>
        )}
      </Carousel>
    </div>
  );
} 