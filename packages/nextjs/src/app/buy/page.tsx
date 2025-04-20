"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";

// Central buy form state
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
  paymentMethod: "LYX" | "Fiat" | null;
}

export default function BuyPage() {
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
    paymentMethod: null,
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  return (
    <div className="p-4 min-h-screen">
      {step === 1 && (
        <PersonalInfoForm data={formData} setData={setFormData} onNext={next} />
      )}
      {step === 2 && (
        <ShippingForm
          data={formData}
          setData={setFormData}
          onBack={back}
          onNext={next}
        />
      )}
      {step === 3 && (
        <PaymentForm data={formData} setData={setFormData} onBack={back} />
      )}
    </div>
  );
}

interface BuyFormProps {
  data: BuyFormData;
  setData: React.Dispatch<React.SetStateAction<BuyFormData>>;
  onNext?: () => void;
  onBack?: () => void;
}

function PersonalInfoForm({ data, setData, onNext }: BuyFormProps) {
  return (
    <div className="flex flex-col items-center justify-between h-[90%]">
      <div className="w-full space-y-4">
        <h1 className="text-3xl font-bold">Buy Product</h1>
        <p className="text-muted-foreground mb-6">
          Enter your personal details
        </p>

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
          <Label>E-mail</Label>
          <Input
            value={data.email}
            onChange={(e) =>
              setData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="Enter your email"
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={data.phone}
            onChange={(e) =>
              setData((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="Enter your phone"
          />
        </div>
      </div>

      <div className="w-full">
        <Button onClick={onNext} className="w-full mt-6">
          Next →
        </Button>
      </div>
    </div>
  );
}

function ShippingForm({ data, setData, onBack, onNext }: BuyFormProps) {
  return (
    <div className="flex flex-col items-center justify-between h-[90%]">
      <h1 className="text-3xl font-bold">Buy Product</h1>
      <p className="text-muted-foreground mb-6">Add shipping address</p>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <Label>Address line 1</Label>
          <Input
            value={data.address1}
            onChange={(e) =>
              setData((prev) => ({ ...prev, address1: e.target.value }))
            }
          />
        </div>
        <div>
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

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={onNext}>Select payment method</Button>
      </div>
    </div>
  );
}

function PaymentForm({ data, setData, onBack }: BuyFormProps) {
  return (
    <div>
      <div className="w-full h-80 rounded-xl overflow-hidden mb-4">
        <img
          src="/img1.jpg"
          alt="Product"
          className="w-full h-full object-cover"
        />
      </div>
      <h2 className="text-2xl font-bold">Honft 001</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Select payment method
      </p>

      <div className="space-y-3">
        <Button
          className="w-full"
          variant={data.paymentMethod === "LYX" ? "default" : "outline"}
          onClick={() => setData((prev) => ({ ...prev, paymentMethod: "LYX" }))}
        >
          LYX Payment
        </Button>
        <Button
          className="w-full"
          variant={data.paymentMethod === "Fiat" ? "default" : "outline"}
          onClick={() =>
            setData((prev) => ({ ...prev, paymentMethod: "Fiat" }))
          }
        >
          Fiat Payment
        </Button>
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <p className="text-xl font-bold">Price: $1245</p>
      </div>
    </div>
  );
}
