import { supabase } from "@/lib/initSupabase";
import React, { useEffect, useState, useRef } from "react";
import { useUpProvider } from "./up-provider";
import { useFamilyVault } from "@/hooks/useFamilyVault";
import { useMutation } from "@tanstack/react-query";
import { Vault } from "@/types";
import { toast } from "sonner";
import clsx from "clsx";
import { queryClient } from "./marketplace-provider";
import { Label } from "@radix-ui/react-label";
import { Button } from "./ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";

interface ChatMessage {
  from: string;
  content: string;
  timestamp: string;
}

interface ProductChatProps {
  vault: Vault;
  alreadyInDispute?: boolean;
}

const adminAddress =
  process.env.NEXT_PUBLIC_ADMIN_ADDRESS ||
  "0x9dD1084ac41e6234931680Cc1214691C4f098C01";

export default function ProductChat({
  vault,
  alreadyInDispute,
}: ProductChatProps) {
  const { buyer, seller, vault_address: vaultAddress } = vault;
  const { accounts } = useUpProvider();
  const userAddress = accounts[0] || "";
  const { initiateDispute } = useFamilyVault(vaultAddress as `0x${string}`);
  const [selectedWinner, setSelectedWinner] = useState("");
  const [selectedTraceReceiver, setSelectedTraceReceiver] = useState("");
  const isAdmin = userAddress.toLowerCase() === adminAddress.toLowerCase();
  const isBuyer = userAddress.toLowerCase() === buyer?.toLowerCase();
  const isSeller = userAddress.toLowerCase() === seller?.toLowerCase();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getUserRoleLabel = (address: string) => {
    if (address === adminAddress) return "Admin";
    if (address.toLowerCase() === buyer?.toLowerCase()) return "Buyer";
    if (address.toLowerCase() === seller?.toLowerCase()) return "Seller";
    if (address === "system") return "System";
    return "System";
  };

  const getBubbleAlignment = (from: string) => {
    if (from === adminAddress || from === "system") return "center";
    if (from.toLowerCase() === userAddress.toLowerCase()) return "end";
    return "start";
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchChat() {
    const { data, error } = await supabase
      .from("product_chats")
      .select("content")
      .eq("product_id", vaultAddress)
      .single();

    if (error) {
      console.error("Fetch chat error:", error);
      setMessages([]);
    } else {
      setMessages(data?.content || []);
    }
  }

  useEffect(() => {
    fetchChat();
    const intervalId = setInterval(fetchChat, 15000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaultAddress, userAddress]);

  async function sendMessage(
    content: string,
    from: "user" | "admin" | "system" = "user",
    updateUI = true,
  ) {
    const fromAddress =
      from === "user"
        ? userAddress
        : from === "admin"
          ? adminAddress
          : "system";

    const { error } = await supabase.rpc("upsert_product_chat", {
      p_product_id: vaultAddress,
      p_from: fromAddress,
      p_message: content,
    });

    if (!error && updateUI) {
      setMessages((msgs) => [
        ...msgs,
        {
          from: fromAddress,
          content,
          timestamp: new Date().toISOString(),
        },
      ]);
    } else if (error) {
      console.error("Send message error:", error);
    }
  }

  async function sendDisputeMessage() {
    await sendMessage(
      "Thanks for raising a dispute. We will look into it and get back to you shortly. Stay tuned! Raised by :" +
        userAddress,
      "admin",
    );
  }

  async function markDisputeInDB() {
    try {
      const response = await fetch(`/api/vault?vault_address=${vaultAddress}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_status: "disputed",
        } as Vault),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Vault listing update failed: ${errorText}`);
      }
    } catch (error) {
      console.error("Vault listing update failed:", error);
    }
  }
  const handleRaiseDispute = async () => {
    await initiateDisputeMutation.mutateAsync();
  };
  const initiateDisputeMutation = useMutation({
    mutationFn: initiateDispute,
    onSuccess: () => {
      markDisputeMutation.mutate(); // Trigger next step
    },
    onError: (err) => {
      console.error("Failed to initiate dispute onchain:", err);
      toast.error("Dispute onchain transaction failed.");
    },
  });
  const markDisputeMutation = useMutation({
    mutationFn: markDisputeInDB,
    onSuccess: () => {
      sendDisputeMessageMutation.mutate(); // Trigger next step
    },
    onError: (err) => {
      console.error("Failed to mark dispute in DB:", err);
      toast.error(
        "Dispute was initiated, but marking it in the database failed.",
      );
    },
  });

  const sendDisputeMessageMutation = useMutation({
    mutationFn: sendDisputeMessage,
    onSuccess: () => {
      toast.success("Dispute initiated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["marketplaceProducts", "allNfts"],
      });
    },
    onError: (err) => {
      console.error("Failed to send dispute message:", err);
      toast.error("Dispute was initiated, but notification failed.");
    },
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    await sendMessage(newMsg.trim(), isAdmin ? "admin" : "user");
    setNewMsg("");
  };

  if (!userAddress)
    return <div>Please connect your wallet to view the chat.</div>;

  return (
    <div className="max-w-md p-4 flex flex-col h-[600px] ">
      <div className="text-center font-semibold text-lg mb-3 border-b pb-2">
        Family Marketplace Chat
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-2 bg-gray-50 rounded">
        {messages.map((msg, idx) => {
          const role = getUserRoleLabel(msg.from);
          const align = getBubbleAlignment(msg.from);
          return (
            <div
              key={idx}
              className={clsx("flex flex-col", {
                "items-end": align === "end",
                "items-start": align === "start",
                "items-center": align === "center",
              })}
            >
              {role !== "System" && (
                <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full mb-1">
                  {role}
                </span>
              )}
              <div
                className={clsx(
                  "max-w-[80%] px-4 py-2 rounded-lg text-sm shadow-sm whitespace-pre-line",
                  {
                    "bg-yellow-100 text-gray-700": role === "System",
                    "bg-black text-white": align === "end",
                    "bg-gray-200 text-gray-800": align === "start",
                  },
                )}
              >
                {msg.content}
                <div className="text-[10px] text-right text-gray-500 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Dispute actions */}
      <div className="mb-2 text-center">
        {!isAdmin && !alreadyInDispute && (isBuyer || isSeller) && (
          <div className="mb-2 text-center">
            <button
              onClick={handleRaiseDispute}
              className="bg-red-100 text-red-600 px-4 py-1 rounded hover:bg-red-200 text-sm"
            >
              ⚠️ Raise Dispute
            </button>
          </div>
        )}

        {isAdmin && alreadyInDispute && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700">
              Resolve dispute:
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="winner">Who receives funds</Label>
                <Select
                  value={selectedWinner}
                  onValueChange={setSelectedWinner}
                >
                  <SelectTrigger id="winner" className="w-full">
                    <SelectValue placeholder="Select a party" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={buyer as string}>Buyer</SelectItem>
                    <SelectItem value={seller as string}>Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="traceReceiver">
                  Who receives product trace
                </Label>
                <Select
                  value={selectedTraceReceiver}
                  onValueChange={setSelectedTraceReceiver}
                >
                  <SelectTrigger id="traceReceiver" className="w-full">
                    <SelectValue placeholder="Select a party" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={buyer as string}>Buyer</SelectItem>
                    <SelectItem value={seller as string}>Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                disabled={!selectedWinner || !selectedTraceReceiver}
                onClick={async () => {
                  try {
                    toast.success("Dispute resolved successfully!");
                  } catch (err) {
                    console.error("Dispute resolution failed", err);
                    toast.error("Dispute resolution failed.");
                  }
                }}
              >
                ✅ Resolve
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex space-x-2">
        <input
          type="text"
          placeholder="Write your message..."
          className="flex-1 border rounded px-3 py-2 text-sm"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
        />
        <button
          type="submit"
          disabled={!newMsg.trim()}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-40 hover:bg-gray-800"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
