/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BuyProductDetails } from "@/components/buy-product";
import { Vault } from "@/types";
import { ProductCardShell } from "@/components/inmarketplace-product";

export default function ProductMarketplaceCarousel({
  products,
}: {
  products: Vault[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogProduct, setDialogProduct] = useState<Vault | null>(null);

  const prevIndex = activeIndex > 0 ? activeIndex - 1 : null;
  const nextIndex = activeIndex < products.length - 1 ? activeIndex + 1 : null;

  const goLeft = () => setActiveIndex((i) => (i > 0 ? i - 1 : i));
  const goRight = () =>
    setActiveIndex((i) => (i < products.length - 1 ? i + 1 : i));

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
    <div className="flex items-center justify-center w-full">
      {products.length > 1 && (
        <Button
          onClick={goLeft}
          disabled={activeIndex === 0}
          aria-label="Previous slide"
          className="rounded-full mr-4"
        >
          <span className="sr-only">Previous</span>
          &#8592;
        </Button>
      )}
      <div className="flex items-center justify-center w-[700px] h-[400px] relative">
        {/* Left Teaser */}
        <div className="w-1/4 h-full flex items-center justify-center opacity-60">
          {prevIndex !== null ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={products[prevIndex].images?.[0] || "/placeholder.png"}
                alt="teaser"
                className="w-40 h-60 object-fit rounded-xl"
              />
            </>
          ) : null}
        </div>
        {/* Center Product */}
        <div className="w-1/2 h-full flex flex-col items-center justify-center">
          <ProductCardShell
            image={products[activeIndex].images?.[0] || "/placeholder.png"}
            title={products[activeIndex].title}
            subtitle={`Price: ${products[activeIndex].price_in_lyx} LYX`}
          >
            <Button
              className="rounded-full px-8 py-2 text-lg font-semibold"
              onClick={() => handleBuy(products[activeIndex])}
            >
              Buy
            </Button>
            <Dialog
              open={
                dialogOpen &&
                dialogProduct?.vault_address ===
                  products[activeIndex].vault_address
              }
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) setDialogProduct(null);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full px-8 py-2 text-lg font-semibold"
                  onClick={() => {
                    setDialogProduct(products[activeIndex]);
                    setDialogOpen(true);
                  }}
                >
                  More Info
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl w-full items-center justify-center">
                <DialogHeader>
                  <DialogTitle>Product Details</DialogTitle>
                </DialogHeader>
                <BuyProductDetails
                  metadata={{
                    title: products[activeIndex].title ?? "",
                    description: products[activeIndex].description ?? "",
                    images: products[activeIndex].images ?? [],
                    category: products[activeIndex].category ?? "",
                    brand: products[activeIndex].brand ?? "",
                  }}
                  vaultAddress={products[activeIndex].vault_address}
                  condition={products[activeIndex].notes as string}
                  location={products[activeIndex].location as string}
                  sellerAddress={products[activeIndex].seller}
                  priceInLYX={products[activeIndex].price_in_lyx}
                />
              </DialogContent>
            </Dialog>
          </ProductCardShell>
        </div>
        {/* Right Teaser */}
        <div className="w-1/4 h-full flex items-center justify-center opacity-60">
          {nextIndex !== null ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={products[nextIndex].images?.[0] || "/placeholder.png"}
                alt="teaser"
                className="w-40 h-60 object-fit rounded-xl"
              />
            </>
          ) : null}
        </div>
      </div>
      {products.length > 1 && (
        <Button
          onClick={goRight}
          disabled={activeIndex === products.length - 1}
          aria-label="Next slide"
          className="rounded-full ml-4"
        >
          <span className="sr-only">Next</span>
          &#8594;
        </Button>
      )}
    </div>
  );
}
