/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Toast import here
import { ProductImageCarousel } from "./product";

export type ProductMetadata = {
  title: string;
  description: string;
  category: string;
  brand: string;
  images: string[];
};

export function AlreadyInMarketplace({
  metadata,
  vault,
}: {
  metadata: ProductMetadata;
  vault: any;
}) {
  console.log("vault", vault);
  function handleRaiseDispute() {
    toast("Coming soon 🚀");
  }

  function handleRemove() {
    toast("Coming soon 🚀");
  }

  return (
    <Card className="w-full max-w-sm rounded-2xl border shadow-lg bg-white transition hover:shadow-xl relative">
      <ProductImageCarousel images={metadata.images} />

      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold truncate">{metadata.title}</h3>
          <Badge variant="default" className="text-xs capitalize">
            {status}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {metadata.description}
        </p>

        <p className="text-sm">
          <span className="text-muted-foreground">Brand:</span>{" "}
          <span className="font-medium">{metadata.brand}</span>
        </p>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            variant="outline"
            className="w-full text-sm"
            onClick={handleRaiseDispute}
          >
            Raise Dispute
          </Button>
          <Button
            variant="destructive"
            className="w-full text-sm"
            onClick={handleRemove}
          >
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
