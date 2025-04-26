"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRef, useState } from "react";
import { getAddress } from "viem";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { useFamilyVault } from "@/hooks/useFamilyVault";
import { useMutation } from "@tanstack/react-query";
import { Vault } from "@/types";
import { toast } from "sonner";
export type ProductMetadata = {
  title: string;
  description: string;
  category: string;
  brand: string;
  images: string[];
};

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

export function ConfirmProduct({
  metadata,
  vaultAddress,
  condition,
  location,
  sellerAddress,
}: {
  metadata: ProductMetadata;
  vaultAddress: string | `0x${string}`;
  condition: string;
  location: string;
  sellerAddress: string | `0x${string}`;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [plainUIDCode, setPlainUIDCode] = useState("");
  const { confirmReceipt, getVaultState, getBuyer, getExpectedUIDHash } =
    useFamilyVault(vaultAddress as `0x${string}`);
  //
  console.log(
    "Vault Address:",
    vaultAddress + "vault state",
    getVaultState().then((state) => console.log("Vault State:", state)),
    "getBuyer",
    getBuyer().then((buyer) => console.log("Buyer:", buyer)),
    "expectedUIDCode",
    getExpectedUIDHash().then((expectedUIDCode) =>
      console.log("Expected UID Code:", expectedUIDCode),
    ),
  );
  const handleConfirmMutation = useMutation({
    mutationFn: async () => {
      // const res = await confirmReceiptTest({
      //   vaultAddress: vaultAddress as `0x${string}`,
      //   plainUidCode: plainUIDCode,
      // });
      const res = await confirmReceipt(plainUIDCode);
      if (!res) {
        throw new Error("Failed to create vault");
      }
      try {
        const response = await fetch(
          `/api/vault?vault_address=${vaultAddress}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              buyer: "0x1234567890abcdef1234567890abcdef12345678",
              order_status: "confirmed",
            } as Vault),
          },
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Vault listing update failed: ${errorText}`);
        }
      } catch (error) {
        console.error("Vault listing update failed:", error);
      }
      return { res };
    },
    onSuccess: (data) => {
      console.log("Buy mutation successful", data);
    },
    onError: (error) => {
      console.error("Error during buy mutation:", error);
    },
  });
  return (
    <>
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
        <CardFooter className="flex justify-between gap-2">
          <Button
            variant="outline"
            className="w-1/2"
            onClick={() => toast.info("Feature coming soon!")}
          >
            Raise Dispute
          </Button>
          <Button className="w-1/2" onClick={() => setModalOpen(true)}>
            Confirm
          </Button>
        </CardFooter>
      </Card>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Confirm Delivery</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This confirms that you have received the product. You will now
            receive its digital trace, and the funds will be released to the
            seller.
          </p>
          <div className="flex justify-between mt-4 gap-2">
            <Input
              id="plain-uid-code"
              value={plainUIDCode}
              onChange={(e) => setPlainUIDCode(e.target.value)}
              className="w-full"
              placeholder="Enter UID code"
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleConfirmMutation.mutate();
              }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
