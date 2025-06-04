import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { ProductCardShell } from "./inmarketplace-product";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { ProductInfo } from "./product-info";
import React from "react";

export type ProductMetadata = {
  title: string;
  description: string;
  category: string;
  brand: string;
  images: string[];
};

// Subcomponent: ProductImageCarousel
export function ProductImageCarousel({ images }: { images: string[] }) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <Carousel
      className="w-full overflow-hidden rounded-t-2xl"
      opts={{ align: "start", loop: true }}
    >
      <CarouselContent>
        {images.map((img, idx) => (
          <CarouselItem key={idx}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt={`Product image ${idx + 1}`}
              className="block w-full h-90 object-fit transition-all duration-300"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      {images.length > 1 && (
        <>
          <CarouselPrevious
            ref={prevRef}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-1"
          />
          <CarouselNext
            ref={nextRef}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-1"
          />
        </>
      )}
    </Carousel>
  );
}

// Main component

export function ProductCard({
  metadata,
  nftAddress,
  showSellButton = true,
}: {
  metadata: ProductMetadata;
  nftAddress: `0x${string}` | string;
  showSellButton?: boolean;
}) {
  const { push } = useRouter();
  const [infoOpen, setInfoOpen] = React.useState(false);
  return (
    <>
      <ProductCardShell
        image={metadata.images?.[0] || ""}
        title={metadata.title}
        subtitle={metadata.brand}
        status={"Not Listed"}
      >
        {showSellButton && (
          <Button
            onClick={() => {
              const params = new URLSearchParams({
                nftContract: nftAddress,
                metadata: JSON.stringify(metadata),
              });
              push(`/sell?${params.toString()}`);
            }}
            className="w-1/2"
          >
            Sell
          </Button>
        )}
        <Button
          className="w-1/2"
          variant="outline"
          onClick={() => setInfoOpen(true)}
        >
          More Info
        </Button>
      </ProductCardShell>
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="max-w-md">
          <ProductInfo metadata={metadata} />
        </DialogContent>
      </Dialog>
    </>
  );
}
