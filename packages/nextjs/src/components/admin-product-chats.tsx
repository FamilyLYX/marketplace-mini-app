"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/initSupabase";
import ProductChat from "./escrow-chat";
import { Vault } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminProductChats() {
  const [chats, setChats] = useState<{ product_id: string }[]>([]);
  const [vault, setVault] = useState<Vault | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } = await supabase
        .from("product_chats")
        .select("product_id");

      if (error) {
        console.error("Error fetching chats:", error);
      } else {
        setChats(data || []);
      }
    };

    fetchChats();
  }, []);

  const openChat = async (vaultAddress: string) => {
    try {
      const response = await fetch(`/api/vault?vault_address=${vaultAddress}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

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
              <tr key={chat.product_id} className="border-b">
                <td className="py-2 px-4 font-mono text-sm">
                  {chat.product_id}
                </td>
                <td className="py-2 px-4">
                  <Button onClick={() => openChat(chat.product_id)}>
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
            <ProductChat
              vault={vault}
              alreadyInDispute={vault.order_status === "disputed"}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Loading chat...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
