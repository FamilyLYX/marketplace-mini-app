"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// import BlackButton from "@/components/black-button";
import { Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import Image from "next/image";
import BlackButton from "@/components/black-button";
export default function FormPage() {
  const { replace } = useRouter();

  const [formData, setFormData] = useState<Product>({
    title: "",
    description: "",
    category: "",
    brand: "",
    images: [],
  });

  useEffect(() => {
    const savedData = localStorage.getItem("product");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const saveToLocalStorage = (data: Product) => {
    localStorage.setItem("product", JSON.stringify(data));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    saveToLocalStorage(updatedData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataFile = new FormData();
    formDataFile.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formDataFile,
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY!,
      },
    });

    const data = await res.json();
    if (data.url) {
      const updatedData = {
        ...formData,
        images: [...formData.images, data.url],
      };
      setFormData(updatedData);
      saveToLocalStorage(updatedData);
    } else {
      alert("Upload failed.");
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const updatedData = { ...formData, images: newImages };
    setFormData(updatedData);
    saveToLocalStorage(updatedData);
  };

  return (
    <div className="min-h-[75vh] w-full px-6 py-2 flex flex-col justify-between items-center text-white">
      <div className="space-y-4 w-full">
        <div>
          <Label className="text-sm font-mono">Product Name</Label>
          <Input
            name="title"
            placeholder="Name"
            className="mt-1"
            value={formData.title}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label className="text-sm font-mono">Description</Label>
          <Textarea
            name="description"
            placeholder="Description"
            className="mt-1"
            rows={5}
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label className="text-sm font-mono">Category</Label>
          <Input
            name="category"
            placeholder="Fashion/Consumer"
            className="mt-1"
            value={formData.category}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label className="text-sm font-mono">Brand/Manufacturer</Label>
          <Input
            name="brand"
            placeholder="Adidas"
            className="mt-1"
            value={formData.brand}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label className="text-sm font-mono mb-2 block">Insert Photos</Label>

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
            {formData.images.map((imgUrl, index) => (
              <div key={index} className="relative w-14 h-14 aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={`Uploaded ${index}`}
                  className="w-full h-full object-cover rounded-md border" // changed from 'rounded-full'
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
      </div>

      <div className="mt-8 w-full">
        <BlackButton
          withArrow
          className="w-full rounded-full py-2 text-base"
          onClick={() => {
            replace("/notice");
          }}
        >
          Next
        </BlackButton>
      </div>
    </div>
  );
}
