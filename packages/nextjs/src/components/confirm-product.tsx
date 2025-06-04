"use client";

import { useState } from "react";
import { pad } from "viem";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { useFamilyVault } from "@/hooks/useFamilyVault";
import { useMutation } from "@tanstack/react-query";
import { Vault } from "@/types";
import { toast } from "sonner";
import { queryClient } from "./marketplace-provider";
import ProductChat from "./escrow-chat";
import { useFetchSaltAndUpdate } from "@/hooks/useFetchSaltAndUpdate";
import { ProductCardShell } from "./inmarketplace-product";
import { ProductInfo } from "./product-info";
import { fetchWithAuth } from "@/lib/api";

export type ProductMetadata = {
  title: string;
  description: string;
  category: string;
  brand: string;
  images: string[];
};

export function ConfirmProduct({
  vault,
  metadata,
  vaultAddress,
}: {
  vault: Vault;
  metadata: ProductMetadata;
  vaultAddress: string | `0x${string}`;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [plainUIDCode, setPlainUIDCode] = useState("");
  const { confirmReceipt } = useFamilyVault(vaultAddress as `0x${string}`);
  const { fetchAndUpdateSalt } = useFetchSaltAndUpdate();

  const handleConfirmMutation = useMutation({
    mutationFn: async () => {
      if (!plainUIDCode || vault.nft_contract === undefined) {
        throw new Error("Please enter a valid UID code");
      }
      const { currentSalt, newSalt, newUidHash } = await fetchAndUpdateSalt(
        vault.nft_contract as `0x${string}`,
        plainUIDCode,
      );
      const res = await confirmReceipt(plainUIDCode, currentSalt, newUidHash);
      if (!res) {
        throw new Error("Failed to create vault");
      }
      await fetchWithAuth("/api/save-salt", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: pad("0x0", { size: 32 }), // using a fixed tokenId of 0x0
          contractAddress: vault.nft_contract,
          salt: newSalt,
          uidHash: newUidHash,
        }),
      });
      try {
        const response = await fetchWithAuth(
          `/api/vault?vault_address=${vaultAddress}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
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
    onSuccess: () => {
      toast.success("Product delivery confirmed!");
      queryClient.invalidateQueries({
        queryKey: ["marketplaceProducts", "allNfts"],
      });
      setModalOpen(false);
    },
    onError: (error) => {
      console.error("Error during buy mutation:", error);
    },
  });
  return (
    <>
      <ProductCardShell
        image={metadata.images?.[0] || ""}
        title={metadata.title}
        subtitle={metadata.brand}
        status={
          vault.order_status
            ? vault.order_status.charAt(0).toUpperCase() +
              vault.order_status.slice(1)
            : ""
        }
      >
        <Button
          variant="outline"
          className="w-1/2"
          onClick={() => setOpenChat(!openChat)}
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
        <DialogContent className="max-w-md">
          <ProductInfo metadata={metadata} />
        </DialogContent>
      </Dialog>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTitle></DialogTitle>
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
              disabled={handleConfirmMutation.isPending}
            >
              {handleConfirmMutation.isPending ? "Processing..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
