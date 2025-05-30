/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Toast import here
import { Vault } from "@/types";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import ProductChat from "./escrow-chat";
import React from "react";

export type ProductMetadata = {
  title: string;
  description: string;
  category: string;
  brand: string;
  images: string[];
};

// Reusable shell component for product card UI
export function ProductCardShell({
  image,
  title,
  subtitle,
  status,
  children,
}: {
  image: string;
  title: string;
  subtitle?: string;
  status?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-[340px] h-[480px] mb-4 rounded-[2.5rem] shadow-lg border bg-white flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image || "/placeholder.png"}
          alt={title}
          className="w-full h-full object-fit"
        />
        {status && (
          <span
            className={`absolute left-1/2 -translate-x-1/2 bottom-4 px-4 py-1 rounded-full text-xs font-semibold shadow-lg ${
              status === "Pending" || status === "Listed"
                ? "bg-yellow-500 text-yellow-900"
                : status === "Confirmed" ||
                    status === "Completed" ||
                    status === "Purchased"
                  ? "bg-green-500 text-white"
                  : status === "Disputed" || status === "Cancelled"
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-700"
            }`}
          >
            {status}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold mb-1 text-center font-[inherit]">
        {title}
      </h3>
      {subtitle && (
        <div className="text-sm mb-4 font-normal text-center text-gray-700">
          {subtitle}
        </div>
      )}
      <div className="flex gap-4 justify-center w-full max-w-xs">
        {children}
      </div>
    </div>
  );
}

export function AlreadyInMarketplace({
  metadata,
  vault,
}: {
  metadata: ProductMetadata;
  vault: Vault;
}) {
  const [openChat, setOpenChat] = useState(false);
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const hasBuyer = Boolean(vault.buyer);

  function handleRemove() {
    toast("Coming soon 🚀");
  }

  return (
    <ProductCardShell
      image={metadata.images?.[0] || ""}
      title={metadata.title}
      subtitle={metadata.brand}
      status={
        vault.order_status
          ? vault.order_status.charAt(0).toUpperCase() +
            vault.order_status.slice(1)
          : "Listed"
      }
    >
      {hasBuyer ? (
        <>
          <Button
            variant="default"
            className="w-1/2"
            onClick={() => setOpenChat(true)}
          >
            Open Chat
          </Button>
          <Dialog open={openChat} onOpenChange={setOpenChat}>
            <DialogContent className="max-w-2xl w-full">
              <ProductChat
                vault={vault}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={isBuyerModalOpen} onOpenChange={setIsBuyerModalOpen}>
            <Button
              variant="outline"
              className="w-1/2"
              onClick={() => setIsBuyerModalOpen(true)}
            >
              More Info
            </Button>
            <DialogContent className="max-w-md w-full">
              <DialogTitle>Buyer Info</DialogTitle>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Name:</strong> {vault.first_name} {vault.last_name}
                </p>
                <p>
                  <strong>Email:</strong> {vault.email}
                </p>
                <p>
                  <strong>Phone:</strong> {vault.phone}
                </p>
                <p>
                  <strong>Country:</strong> {vault.country}
                </p>
                <p>
                  <strong>State:</strong> {vault.state}
                </p>
                <p>
                  <strong>City:</strong> {vault.city}
                </p>
                <p>
                  <strong>ZIP:</strong> {vault.zip}
                </p>
                <p>
                  <strong>Address 1:</strong> {vault.address1}
                </p>
                <p>
                  <strong>Address 2:</strong> {vault.address2}
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <>
          <Button variant="default" className="w-1/2" onClick={handleRemove}>
            Unlist
          </Button>
          <Button variant="outline" className="w-1/2">
            Open Info
          </Button>
        </>
      )}
    </ProductCardShell>
  );
}
