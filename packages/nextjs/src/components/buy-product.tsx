import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";
import { getAddress } from "viem";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export type ProductMetadata = {
  title: string;
  description: string;
  category: string;
  brand: string;
  images: string[];
};

// Subcomponent: ProductImageCarousel
function ProductImageCarousel({ images }: { images: string[] }) {
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
              className="block w-full h-64 object-fit transition-all duration-300"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious
        ref={prevRef}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-1"
      />
      <CarouselNext
        ref={nextRef}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-1"
      />
    </Carousel>
  );
}

// Main component

export function BuyProduct({
  metadata,
  vaultAddress,
  condition,
  location,
  sellerAddress,
  showBuyButton = true,
}: {
  metadata: ProductMetadata;
  vaultAddress: string | `0x${string}`;
  condition: string;
  location: string;
  sellerAddress: string | `0x${string}`;
  showBuyButton?: boolean;
}) {
  const { push } = useRouter();

  return (
    <Card className="w-full max-w-sm rounded-2xl border shadow-lg bg-white transition hover:shadow-xl relative">
      <ProductImageCarousel images={metadata.images} />
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold truncate">{metadata.title}</h3>
          <Badge variant="outline" className="text-xs">
            {metadata.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {metadata.description}
        </p>
        <p className="text-xs">
          <span className="font-medium">Brand: {metadata.brand}</span>
        </p>
        <div className="col-span-2">
          <p className="text-xs text-muted-foreground">Condition</p>
          <Badge className="whitespace-pre-wrap">{condition}</Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Location</p>
          <Badge>{location}</Badge>
        </div>
        <div className="col-span-2 gap-2">
          <p className="text-xs text-muted-foreground">Product By</p>
          <a
            href={`https://universaleverything.io/${getAddress(sellerAddress)}?network=testnet&assetGroup=tokens`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-blue-600 hover:underline truncate block"
          >
            <Badge variant="outline" className="truncate">
              {sellerAddress}
            </Badge>
          </a>
        </div>
      </CardContent>
      {showBuyButton && (
        <CardFooter className="flex justify-end">
          <Button
            onClick={() => {
              const params = new URLSearchParams({});
              params.append("vaultAddress", vaultAddress);
              params.append("metadata", JSON.stringify(metadata));
              params.append("condition", condition);
              params.append("location", location);
              params.append("sellerAddress", sellerAddress);
              push(`/buy?${params.toString()}`);
            }}
          >
            Buy
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
