/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Toast import here
import { ProductImageCarousel } from "./product";
import { getAddress } from "viem";
import { BuyerInfo, Vault } from "@/types";
import { useState } from "react";

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
  vault: Vault;
}) {
  const buyerInfo = {
    buyer: vault.buyer,
    first_name: vault.first_name,
    last_name: vault.last_name,
    email: vault.email,
    phone: vault.phone,
    country: vault.country,
    state: vault.state,
    city: vault.city,
    zip: vault.zip,
    address1: vault.address1,
    address2: vault.address2,
  } as BuyerInfo;
  function handleRaiseDispute() {
    toast("Coming soon 🚀");
  }

  function handleRemove() {
    toast("Coming soon 🚀");
  }
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
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
        <button
          onClick={() => setIsBuyerModalOpen(true)}
          className="text-sm font-medium text-blue-600 hover:underline truncate block"
        >
          <Badge variant="outline" className="truncate">
            {vault.buyer}
          </Badge>
        </button>
        {isBuyerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Buyer Info</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Name:</strong> {buyerInfo.first_name}{" "}
                  {buyerInfo.last_name}
                </p>
                <p>
                  <strong>Email:</strong> {buyerInfo.email}
                </p>
                <p>
                  <strong>Phone:</strong> {buyerInfo.phone}
                </p>
                <p>
                  <strong>Country:</strong> {buyerInfo.country}
                </p>
                <p>
                  <strong>State:</strong> {buyerInfo.state}
                </p>
                <p>
                  <strong>City:</strong> {buyerInfo.city}
                </p>
                <p>
                  <strong>ZIP:</strong> {buyerInfo.zip}
                </p>
                <p>
                  <strong>Address 1:</strong> {buyerInfo.address1}
                </p>
                <p>
                  <strong>Address 2:</strong> {buyerInfo.address2}
                </p>
              </div>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setIsBuyerModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
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
