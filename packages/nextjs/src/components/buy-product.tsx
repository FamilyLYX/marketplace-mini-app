import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { getAddress } from "viem";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useUpProvider } from "./up-provider";
import { toast } from "sonner";
import { ProductImageCarousel } from "./product";
export type ProductMetadata = {
  title: string;
  description: string;
  category: string;
  brand: string;
  images: string[];
};

// Main component

export function BuyProduct({
  metadata,
  vaultAddress,
  condition,
  location,
  sellerAddress,
  priceInLYX,
  showBuyButton = true,
}: {
  metadata: ProductMetadata;
  vaultAddress: string | `0x${string}`;
  condition: string;
  location: string;
  sellerAddress: string | `0x${string}`;
  priceInLYX: string;
  showBuyButton?: boolean;
}) {
  const { push } = useRouter();
  const { accounts } = useUpProvider();
  const canBuy = useMemo(() => {
    if (!accounts || !accounts[0]) return false;
    if (sellerAddress === getAddress(accounts[0])) return false;
    return true;
  }, [accounts, sellerAddress]);

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
        {showBuyButton && (
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
        )}
      </CardContent>
      {showBuyButton && (
        <CardFooter className="flex justify-end">
          <Button
            onClick={() => {
              if (!accounts || !accounts[0]) {
                toast.error("Please connect your wallet to buy a product");
                return;
              }
              if (!canBuy) {
                toast.error("You cannot buy your own product");
                return;
              }
              const params = new URLSearchParams({});
              params.append("vaultAddress", vaultAddress);
              params.append("metadata", JSON.stringify(metadata));
              params.append("condition", condition);
              params.append("location", location);
              params.append("sellerAddress", sellerAddress);
              params.append("price", priceInLYX); // Replace with actual price
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

// New: BuyProductDetails for Dialog usage
export function BuyProductDetails(props: Parameters<typeof BuyProduct>[0]) {
  return <BuyProduct {...props} showBuyButton={false} />;
}
