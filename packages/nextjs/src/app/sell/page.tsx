"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useState } from "react";
import { X, Plus } from "lucide-react";

export default function SellProductPage() {
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState("1245");
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImages((prev) => [...prev, data.url]);
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
  };

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black mb-2">Sell Product</h1>
        <p className="text-sm font-mono text-muted-foreground mb-8">
          To sell the product, please fill in all the fields below
        </p>

        <div className="space-y-6">
          <Input
            placeholder="Location*"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <Textarea
            placeholder="Condition Notes*"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />

          <div>
            <p className="text-sm font-semibold mb-2">Pictures:</p>
            <div className="flex items-center gap-3 flex-wrap">
              <label
                htmlFor="file-upload"
                className="w-14 h-14 rounded-full border border-dashed flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-6 h-6" />
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>

              {images.map((src, i) => (
                <div key={i} className="relative w-14 h-14">
                  <Image
                    src={src}
                    alt={`Uploaded ${i}`}
                    fill
                    className="object-cover rounded-full"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(src)}
                    className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-100"
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center border rounded-lg overflow-hidden">
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <div className="px-3 py-2 bg-muted text-sm font-semibold">USD</div>
          </div>

          <Button className="w-full mt-4 text-white rounded-full text-md py-6 text-lg">
            Sell
          </Button>
        </div>
      </div>
    </div>
  );
}
