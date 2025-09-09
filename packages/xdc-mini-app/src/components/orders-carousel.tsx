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
} from "@/components/ui/carousel";
type OrderItem = {
  type: "shipping" | "delivered";
  data: Vault;
};

export default function OrdersCarousel({ orders }: { orders: OrderItem[] }) {
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
        />
      );
    } else if (item.type === "delivered") {
      return <PurchasedProductCard metadata={metadata} vault={item.data} />;
    }
    return null;
  };
  if (orders.length === 0) {
    return (
      <div className="w-full max-w-[700px] mx-auto text-center p-4">
        <p className="text-gray-500">No orders found.</p>
      </div>
    );
  }
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
          {orders.map((order, index) => (
            <CarouselItem key={index} className="flex ">
              {renderOrder(order)}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-200 p-2 hover:bg-gray-300 cursor-pointer" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-200 p-2 hover:bg-gray-300 cursor-pointer" />
      </Carousel>
    </div>
  );
}
