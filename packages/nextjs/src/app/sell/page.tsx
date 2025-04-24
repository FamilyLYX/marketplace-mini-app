"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

import { useSearchParams } from "next/navigation";
import { ProductCard, ProductMetadata } from "@/components/product";
import { Label } from "@/components/ui/label";
import { useFamilyVaultFactory } from "@/hooks/useFamilyVaultFactory";
import { useMutation } from "@tanstack/react-query";
import { parseEther } from "viem";

export default function SellProductPage() {
  const { createVault } = useFamilyVaultFactory();
  const searchParams = useSearchParams();
  const nftContract = searchParams.get("nftContract") || "";
  const expectedUIDHash = searchParams.get("expectedUIDHash") || "";
  const metadataParam = searchParams.get("metadata") || "";
  let parsedMetadata: ProductMetadata | null = null;
  try {
    parsedMetadata = JSON.parse(decodeURIComponent(metadataParam));
  } catch (error) {
    console.error("Invalid metadata JSON", error);
  }

  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState(parsedMetadata?.description || "");
  const [price, setPrice] = useState("1245");

  const handleSellMutation = useMutation({
    mutationFn: async () => {
      if (!nftContract || !expectedUIDHash) {
        throw new Error("Missing required parameters");
      }
      const res = await createVault({
        nftContract: nftContract as `0x${string}`,
        priceInLYX: parseEther(price.toString()),
        expectedUIDHash: expectedUIDHash as `0x${string}`,
      });
      if (!res) {
        throw new Error("Failed to create vault");
      }
      const { tx, vaultAddress } = res;
      const response = await fetch("/api/vault-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vaultAddress,
          nftContract,
          expectedUIDHash,
          price,
          location,
          notes,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vault listing failed: ${errorText}`);
      }
      return tx;
    },
    onSuccess: (data) => {
      console.log("Transaction successful:", data);
    },
    onError: (error) => {
      console.error("Transaction failed:", error);
    },
  });

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black mb-2">Sell Product</h1>
        <p className="text-sm font-mono text-muted-foreground mb-8">
          To sell the product shown below, please fill in all the fields below,
          these fields will store additional information about the product and
          the sale. This additional data will be displayed to users who are
          interested in buying your product.
        </p>
        <div className="w-full flex items-center justify-center mb-6">
          <ProductCard
            metadata={parsedMetadata as ProductMetadata}
            nftAddress={nftContract}
            expectedUIDHash={expectedUIDHash as `0x${string}`}
            showSellButton={false}
          />
        </div>
        <div className="space-y-6">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Location*"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <Label htmlFor="Condition notes">Condition Notes</Label>
          <Textarea
            id="notes"
            placeholder="Condition Notes*"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />

          <div className="flex items-center border rounded-lg overflow-hidden">
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <div className="px-3 py-2 bg-muted text-sm font-semibold">LYX</div>
          </div>

          <Button
            className="w-full mt-4 text-white rounded-full text-md py-6 text-lg"
            onClick={() => {
              handleSellMutation.mutate();
            }}
          >
            Sell
          </Button>
        </div>
      </div>
    </div>
  );
}
