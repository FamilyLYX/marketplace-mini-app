"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ProductChat from "./escrow-chat";
import { Vault } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchWithAuth } from "@/lib/api";

export default function AdminProductChats() {
  const [chats, setChats] = useState<{ productId: string }[]>([]);
  const [vault, setVault] = useState<Vault | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const chatData = await fetchWithAuth("/api/chat");
        const chatDataJson = (await chatData.json()) as { productId: string }[];
        // Extract unique product IDs from chats
        const uniqueProductIds = Array.from(
          new Set(
            chatDataJson.map((chat: { productId: string }) => chat.productId)
          )
        ).map((productId) => ({ productId }));

        setChats(uniqueProductIds);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, []);

  const openChat = async (vaultAddress: string) => {
    try {
      const response = await fetchWithAuth(
        `/api/vault?vault_address=${vaultAddress}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Vault fetch failed: ${errorText}`);
        return;
      }

      const vaultData = await response.json();
      setVault(vaultData);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Vault fetch failed:", error);
    }
  };

  return (
    <div className="border rounded-lg p-6 space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-1">Product Chats</h3>
        <p className="text-sm text-muted-foreground">
          View and manage product-specific conversations.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4">Product ID</th>
              <th className="py-2 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {chats.map((chat) => (
              <tr key={chat.productId} className="border-b">
                <td className="py-2 px-4 font-mono text-sm">
                  {chat.productId}
                </td>
                <td className="py-2 px-4">
                  <Button onClick={() => openChat(chat.productId)}>
                    Open Chat
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>

          {vault ? (
            <ProductChat vault={vault} />
          ) : (
            <p className="text-sm text-muted-foreground">Loading chat...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
