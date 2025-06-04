import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Vault } from "@/types";
import { ProductCardShell } from "./inmarketplace-product";
import { ProductInfo } from "./product-info";

export default function ProductMarketplaceCarousel({
  products,
}: {
  products: Vault[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogProduct, setDialogProduct] = useState<Vault | null>(null);

  const handleBuy = (vault: Vault) => {
    const params = new URLSearchParams({});
    params.append("vaultAddress", vault.vault_address);
    params.append(
      "metadata",
      JSON.stringify({
        title: vault.title ?? "",
        description: vault.description ?? "",
        images: vault.images ?? [],
        category: vault.category ?? "",
        brand: vault.brand ?? "",
      }),
    );
    params.append("condition", vault.notes as string);
    params.append("location", vault.location as string);
    params.append("sellerAddress", vault.seller);
    params.append("price", vault.price_in_lyx);
    window.location.href = `/buy?${params.toString()}`;
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
              <ProductCardShell
                image={product.images?.[0] || "/placeholder.png"}
                title={product.title}
                subtitle={`Price: ${product.price_in_lyx} LYX`}
              >
                <Button
                  variant="default"
                  className="w-1/2 mb-2"
                  onClick={() => handleBuy(product)}
                >
                  Buy
                </Button>
                <Dialog
                  open={
                    dialogOpen &&
                    dialogProduct?.vault_address === product.vault_address
                  }
                  onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setDialogProduct(null);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-1/2"
                      onClick={() => {
                        setDialogProduct(product);
                        setDialogOpen(true);
                      }}
                    >
                      More Info
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl w-full items-center justify-center">
                    <DialogHeader>
                      <DialogTitle className="text-lg"></DialogTitle>
                    </DialogHeader>
                    <ProductInfo
                      metadata={{
                        title: product.title ?? "",
                        description: product.description ?? "",
                        images: product.images ?? [],
                        category: product.category ?? "",
                        brand: product.brand ?? "",
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </ProductCardShell>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-200 p-2 hover:bg-gray-300 cursor-pointer z-10" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-200 p-2 hover:bg-gray-300 cursor-pointer z-10" />
      </Carousel>
    </div>
  );
}
