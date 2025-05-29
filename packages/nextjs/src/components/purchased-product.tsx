"use client";

import { Badge } from "@/components/ui/badge";
import { ProductImageCarousel } from "./product";
import { ProductMetadata } from "./buy-product";
import { getAddress } from "viem";
import { Vault } from "@/types";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import ProductChat from "./escrow-chat";
import { ProductCardShell } from "./inmarketplace-product";
import React from "react";

export function PurchasedProductCard({
  metadata,
  vault,
}: {
  metadata: ProductMetadata;
  vault: Vault;
}) {
  const [openChat, setOpenChat] = React.useState(false);
  const [infoOpen, setInfoOpen] = React.useState(false);

  return (
    <>
      <ProductCardShell
        image={metadata.images?.[0] || ""}
        title={metadata.title}
        subtitle={metadata.brand}
        status={"Purchased"}
      >
        <Button
          variant="outline"
          className="w-1/2"
          onClick={() => setOpenChat(true)}
        >
          Open Chat
        </Button>
        <Button className="w-1/2" onClick={() => setInfoOpen(true)}>
          More Info
        </Button>
      </ProductCardShell>
      <Dialog open={openChat} onOpenChange={setOpenChat}>
        <DialogTitle></DialogTitle>
        <DialogContent className="max-w-2xl w-full">
          <ProductChat
            vault={vault}
            alreadyInDispute={vault.order_status === "disputed"}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogTitle className="text-lg"></DialogTitle>
        <DialogContent className="max-w-md">
          <ProductImageCarousel images={metadata.images} />
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-xs">
                {metadata.category}
              </Badge>
              <span className="text-xs font-medium">Brand: {metadata.brand}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Condition: </span>
              <Badge className="whitespace-pre-wrap">{vault.notes}</Badge>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Location: </span>
              <Badge>{vault.location}</Badge>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Product By</span>
              <a
                href={`https://universaleverything.io/${getAddress(vault.seller)}?network=testnet&assetGroup=tokens`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline truncate block"
              >
                <Badge variant="outline" className="truncate">
                  {vault.seller}
                </Badge>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
