"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function NavigationHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const router = useRouter();

  const handleBack = () => {
    if (isHomePage) {
      router.push("/");
    } else {
      router.back();
    }
  };

  return (
    <div className="flex items-center justify-center">
      {!isHomePage && (
        <button onClick={handleBack} className="absolute top-5 left-4">
          <ArrowLeft />
        </button>
      )}
      <Image
        src="/family_logo_white_bg.svg"
        alt="Family Logo"
        width={64}
        height={64}
        className="mt-2 w-16 h-16"
      />
    </div>
  );
}
