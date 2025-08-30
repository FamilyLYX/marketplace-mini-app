"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Product } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
// import { useDPPNFTFactory } from "@/hooks/useDPPFactory";
import { useMutation } from "@tanstack/react-query";
import { useDPP } from "@/hooks/useDPP";
import { v4 as uuidv4 } from "uuid";
import { encodePacked, keccak256, pad } from "viem";
import { useDPPNFTFactory } from "@/hooks/useDPPFactory";

export default function ProductPreview() {
  const { push } = useRouter();
  const { createNFT } = useDPPNFTFactory();
  const { mintDPP } = useDPP();
  const [product, setProduct] = useState<Product | null>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const storedProduct = localStorage.getItem("product");
    if (storedProduct) {
      setProduct(JSON.parse(storedProduct));
    } else {
      toast.error("Please fill the form first, redirecting to form...");
      push("/form");
    }
  }, [push]);

  const { mutateAsync: mintDPPToken, isPending: isMinting } = useMutation({
    mutationFn: async ({ dppAddress }: { dppAddress: `0x${string}` }) => {
      const productCode = localStorage.getItem("product-code");
      if (!productCode) {
        throw new Error("Product code not found");
      }
      if (!product) {
        throw new Error("Product data missing");
      }
      const salt = uuidv4();
      const uidHash = keccak256(
        encodePacked(["string", "string"], [salt, productCode])
      );

      console.log("product", product);
      try {
        await mintDPP({
          dppAddress,
          publicJsonMetadata: JSON.stringify(product),
          uidHash,
        });
      } catch (error) {
        console.error("Error minting DPP token:", error);
        throw new Error("Failed to mint DPP token");
      }
      try {
        await fetch("/api/save-salt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY!,
          },
          body: JSON.stringify({
            tokenId: pad("0x0", { size: 32 }),
            contractAddress: dppAddress,
            salt,
            uidHash,
            productCode,
          }),
        });
      } catch (error) {
        console.error("Error saving salt to server:", error);
        throw new Error("Failed to save salt to server");
      }

      return { dppAddress };
    },
    onSuccess: async (data) => {
      console.log("Minting successful:", data);
      // localStorage.removeItem("product"); UNCOMMENT THIS IF YOU WANT TO CLEAR PRODUCT DATA
      localStorage.removeItem("product-code");
      toast.success("DPP token minted successfully!");
      push("/");
    },
    onError: (error) => {
      toast.error(error.message ?? "Error minting DPP token");
    },
  });

  const { mutate: tokenise, isPending } = useMutation({
    mutationFn: async () => {
      const productCode = localStorage.getItem("product-code");
      if (!productCode) {
        throw new Error("Product code not found");
      }
      if (!product) {
        throw new Error("Product data missing");
      }
      try {
        return await createNFT(product, productCode);
      } catch (error) {
        console.error("Error creating NFT:", error);
        throw new Error("Failed to create NFT");
      }
    },
    onSuccess: async (data) => {
      console.log("mintdata", data);
      const dppAddress = data?.dppAddress;
      console.log("DPP Address:", dppAddress);
      if (!dppAddress) {
        toast.error("No DPP address returned from tokenisation");
        return;
      }
      await mintDPPToken({ dppAddress });
    },
    onError: (error) => {
      toast.error(error.message ?? "Error tokenising NFT");
    },
  });

  if (!product) return <div className="text-center p-10">Loading...</div>;
  return (
    <div className="min-h-[90vh] flex flex-col gap-10 px-6 py-6 items-center">
      <div className="max-w-[400px] md:p-5 w-full flex-1 flex flex-col">
        <Carousel
          className="mx-auto mb-5"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="">
            {product.images.map((product, index) => (
              <CarouselItem key={index} className="lg:basis-1/1">
                {/* eslint-disable @next/next/no-img-element */}
                <img
                  src={product}
                  alt={`Product image ${index + 1}`}
                  className="w-[330px] mx-auto object-fit min-h-[380px] max-h-[400px] rounded-lg shadow-lg"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0" ref={prevRef} />
          <CarouselNext className="right-0" ref={nextRef} />
        </Carousel>

        <div className="mt-5 text-center">
          {/* <p className="text-sm mt-2 px-2 text-gray-500 font-mono leading-relaxed">
            {product.category} Product
          </p> */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2 long-title">
            {product.title}
          </h1>
          <p className="text-sm mt-2 px-2 text-gray-600 font-mono leading-relaxed">
            {product.description?.length > 54
              ? `${product.description?.slice(0, 50)} ...`
              : product?.description}
          </p>
          {/* <p className="text-sm mt-2 px-2 text-gray-600 font-mono leading-relaxed">
            <span className="font-semibold">Brand:</span> {product.brand}
          </p> */}
        </div>

        <div className="mt-auto w-full">
          <Button
            className="w-full rounded-full py-6 font-mono"
            onClick={() => tokenise()}
            disabled={isPending || isMinting}
          >
            {isPending ? "Tokenising..." : "Tokenise"}
          </Button>
        </div>
      </div>
    </div>
  );
}
