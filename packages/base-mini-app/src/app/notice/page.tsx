"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Image from "next/image";
export default function ImportantNotice() {
  const { replace } = useRouter();
  const [code, setCode] = useState("");
  const [open, setOpen] = useState(false);

  const generateCode = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCode(newCode);
    localStorage.setItem("product-code", newCode);
    setOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    replace("/product-preview");
  };

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col justify-between">
      <div className="flex flex-col gap-4 items-center">
        <Image
          src="/family_logo_white_bg.svg"
          alt="Family Logo"
          width={64}
          height={64}
          className="mt-2 w-16 h-16"
        />
        <h1 className="text-5xl text-[#FF0000] text-center font-bold long-title">
          Important Notice
        </h1>

        <div className="bg-white rounded-xl border px-4 py-4 text-sm font-mono leading-relaxed text-gray-700">
          <p>
            To tokenise your physical product, it must have a{" "}
            <strong>Unique Identifier (UID)</strong> embedded on it
          </p>
          <br />
          <ul className="list-disc pl-4">
            <li>
              Embed the 6-digit code we generate on your physical product.
            </li>
            <li>
              Ensure the code is legible and permanently affixed to the product.
            </li>
            <li>
              <strong>
                Note it down exactly as shown—it is case-sensitive.
              </strong>
            </li>
            <li>You will need this code when listing your product for sale.</li>
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={generateCode}
              variant="outline"
              className="w-full rounded-full border-black text-black text-base py-6 font-mono"
            >
              <Plus className="w-4 h-4 mr-2" /> Generate
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xs bg-white rounded-2xl p-6 text-center">
            <DialogHeader>
              <h2 className="text-2xl font-bold mb-4 text-center long-title">
                6-Digit Code
              </h2>
            </DialogHeader>
            <div className="flex justify-center gap-3 text-2xl font-mono mb-6">
              {code.split("").map((digit, index) => (
                <span
                  key={index}
                  className="border border-gray-300 p-2 rounded"
                >
                  {digit}
                </span>
              ))}
            </div>
            <Button
              onClick={copyToClipboard}
              className="w-full bg-black text-white rounded-full"
            >
              Proceed
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
