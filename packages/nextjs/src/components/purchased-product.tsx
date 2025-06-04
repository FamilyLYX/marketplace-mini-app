"use client";

import { ProductMetadata } from "./buy-product";
import { Vault } from "@/types";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import ProductChat from "./escrow-chat";
import { ProductCardShell } from "./inmarketplace-product";
import { ProductInfo } from "./product-info";
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
          <ProductChat vault={vault} />
        </DialogContent>
      </Dialog>
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogTitle className="text-lg"></DialogTitle>
        <DialogContent className="max-w-md">
          <ProductInfo metadata={metadata} />
        </DialogContent>
      </Dialog>
    </>
  );
}
