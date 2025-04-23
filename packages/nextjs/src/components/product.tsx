import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";

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
export function ProductCard({ metadata }: { metadata: ProductMetadata }) {
  return (
    <Card className="w-full max-w-sm rounded-2xl border shadow-lg bg-white transition hover:shadow-xl">
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
        <p className="text-sm">
          <span className="text-muted-foreground">Brand:</span>{" "}
          <span className="font-medium">{metadata.brand}</span>
        </p>
      </CardContent>
    </Card>
  );
}
