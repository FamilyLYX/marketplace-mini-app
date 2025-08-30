"use client";
import BlackButton from "@/components/black-button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import tokenise from "../../../public/tokenise.svg";
export default function Individual() {
  const { replace } = useRouter();
  return (
    <div className="min-h-[90vh] w-full flex flex-col items-center justify-between px-6 py-8 bg-white text-center">
      <div className="border border-gray-200 rounded-xl p-12 px-4 w-full max-w-sm text-center shadow-sm gap-6">
        <h1 className="text-5xl font-display font-bold mb-4 long-title">
          Individual
        </h1>

        <div className="flex justify-center mb-6">
          <Image
            src={tokenise}
            alt="Individual"
            width={300}
            height={300}
            className="w-48 h-48"
          />
        </div>

        <p className="text-sm font-mono text-black">
          Easily tokenise your physical <br /> product
        </p>
      </div>
      <BlackButton
        onClick={() => {
          replace("/form");
        }}
        // as="a"
        // href="/form"
        className="w-full max-w-sm mt-8 text-base py-2 rounded-full"
        withArrow
      >
        Next
      </BlackButton>
    </div>
  );
}
