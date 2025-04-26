"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductImageCarousel } from "./product";
import { ProductMetadata } from "./buy-product";

export function PurchasedProductCard({
  metadata,
}: {
  metadata: ProductMetadata;
}) {
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
        <div className="mt-4">
          <Badge variant="outline" className="text-xs">Purchased Successfully</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
