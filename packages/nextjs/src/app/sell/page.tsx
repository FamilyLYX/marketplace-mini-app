"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

import { ArrowLeft, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { ProductMetadata } from "@/components/product";
import { Label } from "@/components/ui/label";
import { useFamilyVaultFactory } from "@/hooks/useFamilyVaultFactory";
import { useMutation } from "@tanstack/react-query";
import { getAddress, pad, parseEther } from "viem";
import { Vault } from "@/types";
import { useDPP } from "@/hooks/useDPP";
import { toast } from "sonner";
import { useUpProvider } from "@/components/up-provider";
import { queryClient } from "@/components/marketplace-provider";
import { useFetchSaltAndUpdate } from "@/hooks/useFetchSaltAndUpdate";
import { fetchWithAuth } from "@/lib/api";

export default function SellProductPage() {
  const { accounts } = useUpProvider();
  const router = useRouter();
  const { createVault } = useFamilyVaultFactory();
  const { transferWithUIDRotation } = useDPP();
  const { fetchAndUpdateSalt } = useFetchSaltAndUpdate();
  const searchParams = useSearchParams();
  const nftContract = searchParams.get("nftContract") || "";
  const metadataParam = searchParams.get("metadata") || "";
  let parsedMetadata: ProductMetadata | null = null;
  try {
    parsedMetadata = JSON.parse(decodeURIComponent(metadataParam));
  } catch (error) {
    console.error("Invalid metadata JSON", error);
  }

  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState("");
  const [plainUIDCode, setPlainUIDCode] = useState("");
  const [images, setImages] = useState<string[]>(parsedMetadata?.images || []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataFile = new FormData();
    formDataFile.append("file", file);

    const res = await fetchWithAuth("/api/upload", {
      method: "POST",
      body: formDataFile,
    });

    const data = await res.json();
    if (data.url) {
      const existingImages = images || [];
      const updatedImages = [...existingImages, data.url];
      setImages(updatedImages);
    } else {
      toast.error("Image upload failed");
    }
  };

  const handleSellMutation = useMutation({
    mutationFn: async () => {
      if (!nftContract || !accounts.length) {
        throw new Error("Missing required parameters");
      }
      if (!price || !plainUIDCode || !location || !notes) {
        toast.info("Please fill in all required fields");
        throw new Error("Missing required parameters");
      }
      const { currentSalt, newSalt, newUidHash } = await fetchAndUpdateSalt(
        nftContract as `0x${string}`,
        plainUIDCode,
      );
      const res = await createVault({
        nftContract: nftContract as `0x${string}`,
        priceInLYX: parseEther(price.toString()),
      });
      if (!res) {
        throw new Error("Failed to create vault");
      }
      const { tx, vaultAddress } = res;
      const transferDPP = await transferWithUIDRotation({
        dppAddress: nftContract as `0x${string}`,
        to: vaultAddress,
        plainUidCode: plainUIDCode,
        salt: currentSalt,
        newUidHash: newUidHash as `0x${string}`,
      });
      if (!transferDPP) {
        throw new Error("Failed to transfer ownership");
      }
      await fetchWithAuth("/api/save-salt", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: pad("0x0", { size: 32 }), // using a fixed tokenId of 0x0
          contractAddress: nftContract,
          salt: newSalt,
          uidHash: newUidHash,
        }),
      });
      try {
        const response = await fetchWithAuth("/api/vault", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vault_address: vaultAddress,
            nft_contract: nftContract,
            seller: getAddress(accounts[0]),
            notes,
            price_in_lyx: price.toString(),
            title: parsedMetadata?.title,
            description: parsedMetadata?.description,
            location,
            images,
            category: parsedMetadata?.category,
            brand: parsedMetadata?.brand,
            listing_status: "listed",
          } as Vault),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Vault listing failed: ${errorText}`);
        }
      } catch (error) {
        console.error("Vault listing failed:", error);
      }
      return { tx, vaultAddress };
    },
    onSuccess: (data) => {
      console.log("Transaction successful:", data);
      toast.success("Product listed successfully!");
      queryClient.invalidateQueries({
        queryKey: ["marketplaceProducts", "allNfts"],
      });
      router.push("/");
    },
    onError: (error) => {
      console.error("Transaction failed:", error);
    },
  });

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  return (
    <div className="min-h-screen bg-white px-6 py-12 relative">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 z-10 p-2"
        onClick={() => router.push("/")}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="max-w-3xl">
        <h1 className="text-4xl font-black text-start mb-2">Sell Product</h1>
        <div className="mb-8">
          <p className="text-lg text-muted-foreground">
            To sell the product, please fill in all the fields below
          </p>
        </div>
        <div className="space-y-6 pb-32">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Location*"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="UID Code">Code</Label>
            <Input
              id="plainUIDCode"
              placeholder="Code*"
              value={plainUIDCode}
              onChange={(e) => setPlainUIDCode(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="Condition notes">Condition Notes</Label>
            <Textarea
              id="notes"
              placeholder="Condition Notes*"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[200px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-mono">Pictures</Label>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Upload Button */}
              <label
                htmlFor="upload"
                className="w-12 h-12 border rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100"
              >
                <Plus className="w-5 h-5" />
                <input
                  id="upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {/* Image Thumbnails */}
              {images.map((imgUrl: string, index) => (
                <div key={index} className="relative w-14 h-14 aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`Uploaded ${index}`}
                    className="w-14 h-14 object-cover rounded-md border"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="px-3 py-2 bg-black text-white text-sm font-semibold">
                LYX
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <Button
            className="w-full text-white rounded-full text-md py-6 text-lg"
            onClick={() => {
              handleSellMutation.mutate();
            }}
            disabled={handleSellMutation.isPending}
          >
            {handleSellMutation.isPending ? "Processing..." : "Sell"}
          </Button>
        </div>
      </div>
    </div>
  );
}
