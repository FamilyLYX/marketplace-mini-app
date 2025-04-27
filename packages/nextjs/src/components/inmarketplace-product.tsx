/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Toast import here
import { ProductImageCarousel } from "./product";
import { getAddress } from "viem";

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
  function handleRaiseDispute() {
    toast("Coming soon 🚀");
  }

  function handleRemove() {
    toast("Coming soon 🚀");
  }

  const status = vault?.order_status || "Listed";

  const renderAction = () => {
    if (!vault?.order_status) {
      // No order yet
      return (
        <Button
          variant="destructive"
          className="w-full text-xs"
          onClick={handleRemove}
        >
          Remove from Marketplace
        </Button>
      );
    }

    if (vault.order_status !== "confirmed") {
      // Order exists but not confirmed
      return (
        <Button
          variant="outline"
          className="w-full text-xs"
          onClick={handleRaiseDispute}
        >
          Raise Dispute
        </Button>
      );
    }

    // Order is confirmed
    return (
      <p className="text-sm font-medium">
        Purchased by
        <a
          href={`https://universaleverything.io/${getAddress(vault.buyer)}?network=testnet&assetGroup=tokens`}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-blue-600 hover:underline truncate block"
        >
          <Badge variant="outline" className="truncate">
            {vault.buyer}
          </Badge>
        </a>
      </p>
    );
  };

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

        <div className="flex flex-col gap-2 pt-2">{renderAction()}</div>
      </CardContent>
    </Card>
  );
}
