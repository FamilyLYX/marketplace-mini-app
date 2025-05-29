"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Vault } from "@/types";
import { getAddress, parseEther } from "viem";
import { useFamilyVault } from "@/hooks/useFamilyVault";
import { useUpProvider } from "@/components/up-provider";
import { toast } from "sonner";
import { queryClient } from "@/components/marketplace-provider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { ArrowLeft } from "lucide-react";

// Updated BuyFormData
interface BuyFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  address1: string;
  address2: string;
}

export default function BuyPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<BuyFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "United States",
    state: "California",
    city: "Los Angeles",
    zip: "",
    address1: "",
    address2: "",
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 z-10 p-2"
        onClick={() => router.push("/")}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex-1 flex flex-col justify-center items-center w-full h-full">
        {step === 1 && (
          <PersonalDetailsForm
            data={formData}
            setData={setFormData}
            onNext={next}
          />
        )}
        {step === 2 && (
          <ShippingAddressForm
            data={formData}
            setData={setFormData}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 3 && <PaymentStep data={formData} onBack={back} />}
      </div>
    </div>
  );
}

interface BuyFormProps {
  data: BuyFormData;
  setData: React.Dispatch<React.SetStateAction<BuyFormData>>;
  onNext?: () => void;
  onBack?: () => void;
}

function PersonalDetailsForm({ data, setData, onNext }: BuyFormProps) {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <h1 className="text-4xl font-black leading-tight mb-2 w-full text-left">
        Buy Product
      </h1>
      <p className="text-lg text-[#888] mb-8 w-full text-left">
        Enter your personal details
      </p>
      <div className="space-y-4 w-full">
        <div>
          <Label className="font-bold">First name</Label>
          <Input
            value={data.firstName}
            onChange={(e) =>
              setData((prev) => ({ ...prev, firstName: e.target.value }))
            }
            placeholder="Enter first name"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="font-bold">Last name</Label>
          <Input
            value={data.lastName}
            onChange={(e) =>
              setData((prev) => ({ ...prev, lastName: e.target.value }))
            }
            placeholder="Enter last name"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="font-bold">E-mail</Label>
          <Input
            value={data.email}
            onChange={(e) =>
              setData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="Enter your e-mail"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="font-bold">Phone</Label>
          <Input
            value={data.phone}
            onChange={(e) =>
              setData((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="Enter your phone"
            className="mt-1"
          />
        </div>
      </div>
      <Button
        onClick={onNext}
        className="w-full mt-10 h-12 text-lg font-semibold rounded-full bg-black hover:bg-gray-900 transition"
      >
        Next <span className="ml-2">→</span>
      </Button>
    </div>
  );
}

function ShippingAddressForm({ data, setData, onNext, onBack }: BuyFormProps) {
  const countries = ["United States", "Canada", "India"];
  const states = ["California", "Texas", "New York"];
  const cities = ["Los Angeles", "San Francisco", "New York City"];
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <h1 className="text-4xl font-black leading-tight mb-2 w-full text-left">
        Buy Product
      </h1>
      <p className="text-lg text-[#888] mb-8 w-full text-left">
        Add shipping address
      </p>
      <div className="grid grid-cols-2 gap-4 w-full">
        <div>
          <Label className="font-bold">Country or region</Label>
          <select
            className="mt-1 w-full border rounded-md px-3 py-2 text-gray-900"
            value={data.country}
            onChange={(e) =>
              setData((prev) => ({ ...prev, country: e.target.value }))
            }
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="font-bold">State</Label>
          <select
            className="mt-1 w-full border rounded-md px-3 py-2 text-gray-900"
            value={data.state}
            onChange={(e) =>
              setData((prev) => ({ ...prev, state: e.target.value }))
            }
          >
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="font-bold">City</Label>
          <select
            className="mt-1 w-full border rounded-md px-3 py-2 text-gray-900"
            value={data.city}
            onChange={(e) =>
              setData((prev) => ({ ...prev, city: e.target.value }))
            }
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="font-bold">ZIP</Label>
          <Input
            value={data.zip}
            onChange={(e) =>
              setData((prev) => ({ ...prev, zip: e.target.value }))
            }
            placeholder="ZIP"
            className="mt-1"
          />
        </div>
        <div className="col-span-2">
          <Label className="font-bold">Address line 1</Label>
          <Input
            value={data.address1}
            onChange={(e) =>
              setData((prev) => ({ ...prev, address1: e.target.value }))
            }
            placeholder="Street address"
            className="mt-1"
          />
        </div>
        <div className="col-span-2">
          <Label className="font-bold">Address line 2</Label>
          <Input
            value={data.address2}
            onChange={(e) =>
              setData((prev) => ({ ...prev, address2: e.target.value }))
            }
            placeholder="Apt., suite, unit number, etc. (optional)"
            className="mt-1"
          />
        </div>
      </div>
      <div className="flex justify-between w-full mt-10">
        <Button
          variant="outline"
          onClick={onBack}
          className="rounded-full px-6 h-12 text-lg font-semibold"
        >
          ← Back
        </Button>
        <Button
          onClick={onNext}
          className="rounded-full px-6 h-12 text-lg font-semibold bg-black hover:bg-gray-900 transition"
        >
          Select payment method
        </Button>
      </div>
    </div>
  );
}

function PaymentStep({
  data,
  onBack,
}: {
  data: BuyFormData;
  onBack: () => void;
}) {
  const { accounts } = useUpProvider();
  const router = useRouter();
  const searchParams = useSearchParams();
  const metadataParam = searchParams.get("metadata") || "";
  const parsedMetadata = metadataParam ? JSON.parse(metadataParam) : {};
  const vaultAddress = searchParams.get("vaultAddress") || "";
  const price = searchParams.get("price") || "";
  const { depositFunds } = useFamilyVault(vaultAddress as `0x${string}`);

  const handleBuyMutation = useMutation({
    mutationFn: async () => {
      const res = await depositFunds({
        priceInLYX: parseEther(price.toString()),
      });
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
              buyer: getAddress(accounts[0]),
              first_name: data.firstName,
              last_name: data.lastName,
              email: data.email,
              phone: data.phone,
              country: data.country,
              state: data.state,
              city: data.city,
              zip: data.zip,
              address1: data.address1,
              address2: data.address2,
              order_status: "pending",
            } as Vault),
          },
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Vault listing update failed: ${errorText}`);
          queryClient.invalidateQueries({
            queryKey: ["marketplaceProducts", "allNfts"],
          });
        }
      } catch (error) {
        console.error("Vault listing update failed:", error);
      }
      return { res };
    },
    onSuccess: (data) => {
      console.log("Buy mutation successful", data);
      toast.success("Order played successfully!");
      router.push("/");
    },
    onError: (error) => {
      console.error("Error during buy mutation:", error);
    },
  });

  return (
    <div className="w-full max-w-md flex flex-col justify-center items-center h-full">
      <div className="flex flex-col items-center w-full pt-4 pb-8">
        <div className="w-64 h-64 rounded-2xl overflow-hidden mb-6 bg-gray-100 flex items-center justify-center relative">
          {Array.isArray(parsedMetadata?.images) ? (
            <Carousel className="w-full h-full">
              <CarouselContent className="h-full">
                {parsedMetadata.images.map((img: string, idx: number) => (
                  <CarouselItem
                    key={idx}
                    className="flex items-center justify-center w-full h-64"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={parsedMetadata.name}
                      className="object-fit w-full h-full"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {parsedMetadata.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2 z-10" />
                  <CarouselNext className="right-2 top-1/2 -translate-y-1/2 z-10" />
                </>
              )}
            </Carousel>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Images
            </div>
          )}
        </div>
        <div className="text-3xl font-black mb-2 text-center mt-2">
          {parsedMetadata?.title || "Product"}
        </div>
        <div className="text-base text-[#888] mb-6 text-center">
          Select payment method
        </div>
        <Button
          className="w-full h-12 text-lg font-semibold rounded-full bg-black hover:bg-gray-900 transition mb-4"
          size="lg"
          onClick={() => handleBuyMutation.mutate()}
          disabled={!accounts?.[0] || handleBuyMutation.isPending}
        >
          {handleBuyMutation.isPending ? "Processing..." : "LYX Payment"}
        </Button>
        <Button
          className="w-full h-12 text-lg font-semibold rounded-full border-2 border-black bg-white text-black opacity-50 cursor-not-allowed"
          size="lg"
          disabled
        >
          Fiat Payment
        </Button>
      </div>
      <div className="flex w-full justify-between items-center px-2 mt-auto">
        <Button
          variant="outline"
          onClick={onBack}
          className="rounded-full px-6 h-12 text-lg font-semibold"
        >
          ← Back
        </Button>
        <div className="text-2xl font-extrabold text-gray-900 p-2 bg-white rounded-xl shadow">
          Price: <span className="text-primary">{price} LYX</span>
        </div>
      </div>
    </div>
  );
}
