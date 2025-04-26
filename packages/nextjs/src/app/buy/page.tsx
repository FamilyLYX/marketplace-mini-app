"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BuyProduct } from "@/components/buy-product";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Vault } from "@/types";
import { parseEther } from "viem";
import { useFamilyVault } from "@/hooks/useFamilyVault";
import { useUpProvider } from "@/components/up-provider";
import { toast } from "sonner";

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
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<BuyFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    zip: "",
    address1: "",
    address2: "",
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  return (
    <div className="p-4 min-h-screen">
      {step === 1 && (
        <CombinedForm data={formData} setData={setFormData} onNext={next} />
      )}
      {step === 2 && <PaymentStep data={formData} onBack={back} />}
    </div>
  );
}

interface BuyFormProps {
  data: BuyFormData;
  setData: React.Dispatch<React.SetStateAction<BuyFormData>>;
  onNext?: () => void;
  onBack?: () => void;
}

function CombinedForm({ data, setData, onNext }: BuyFormProps) {
  const { push } = useRouter();
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 z-10 p-2"
        onClick={() => push("/")}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-3xl font-bold text-center">Buy Product</h1>
      <p className="text-muted-foreground text-center">
        Enter your personal and shipping details
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>First name</Label>
          <Input
            value={data.firstName}
            onChange={(e) =>
              setData((prev) => ({ ...prev, firstName: e.target.value }))
            }
            placeholder="Enter first name"
          />
        </div>
        <div>
          <Label>Last name</Label>
          <Input
            value={data.lastName}
            onChange={(e) =>
              setData((prev) => ({ ...prev, lastName: e.target.value }))
            }
            placeholder="Enter last name"
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            value={data.email}
            onChange={(e) =>
              setData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="Enter email"
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={data.phone}
            onChange={(e) =>
              setData((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="Enter phone"
          />
        </div>
        <div>
          <Label>Country</Label>
          <Input
            value={data.country}
            onChange={(e) =>
              setData((prev) => ({ ...prev, country: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>State</Label>
          <Input
            value={data.state}
            onChange={(e) =>
              setData((prev) => ({ ...prev, state: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>City</Label>
          <Input
            value={data.city}
            onChange={(e) =>
              setData((prev) => ({ ...prev, city: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>ZIP</Label>
          <Input
            value={data.zip}
            onChange={(e) =>
              setData((prev) => ({ ...prev, zip: e.target.value }))
            }
          />
        </div>
        <div className="md:col-span-2">
          <Label>Address line 1</Label>
          <Input
            value={data.address1}
            onChange={(e) =>
              setData((prev) => ({ ...prev, address1: e.target.value }))
            }
          />
        </div>
        <div className="md:col-span-2">
          <Label>Address line 2</Label>
          <Input
            value={data.address2}
            onChange={(e) =>
              setData((prev) => ({ ...prev, address2: e.target.value }))
            }
            placeholder="Apt, suite, etc. (optional)"
          />
        </div>
      </div>

      <Button onClick={onNext} className="w-full mt-6">
        Proceed to Pay →
      </Button>
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
  const parsedMetadata = JSON.parse(metadataParam);
  const vaultAddress = searchParams.get("vaultAddress") || "";
  const condition = searchParams.get("condition") || "";
  const location = searchParams.get("location") || "";
  const sellerAddress = searchParams.get("sellerAddress") || "";
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
              buyer: accounts[0],
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
    <div>
      <Label className="text-2xl font-bold mb-4">Your Order Summary</Label>
      <div className="flex flex-col items-center mb-4">
        <BuyProduct
          metadata={parsedMetadata}
          vaultAddress={vaultAddress}
          condition={condition}
          location={location}
          sellerAddress={sellerAddress}
          priceInLYX={price}
          showBuyButton={false}
        />
      </div>

      <div className="flex items-center justify-between border-t pt-6">
        <Button variant="outline" onClick={onBack} className="rounded-full">
          ← Back
        </Button>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-gray-900">
            Price: <span className="text-primary">{price} LYX</span>
          </p>
        </div>
      </div>

      <Button
        className="w-full mt-6 py-4 text-lg font-semibold rounded-full bg-black hover:bg-gray-900 transition"
        size="lg"
        onClick={() => handleBuyMutation.mutate()}
        disabled={!accounts?.[0] || handleBuyMutation.isPending}
      >
        {handleBuyMutation.isPending ? "Processing..." : "Buy Now"}
      </Button>
    </div>
  );
}
