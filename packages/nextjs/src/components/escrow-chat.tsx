import { supabase } from "@/lib/initSupabase";
import React, { useEffect, useState, useRef } from "react";

interface ChatMessage {
  from: "user" | "admin";
  content: string;
  timestamp: string;
}

interface ProductChatProps {
  userAddress: string;
  productId: string;
}

export default function ProductChat({
  userAddress,
  productId,
}: ProductChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch chat for product + user
  async function fetchChat() {
    const { data, error } = await supabase
      .from("product_chats")
      .select("content")
      .eq("product_id", productId)
      .eq("user_address", userAddress)
      .single();

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data?.content || []);
    }
  }

  useEffect(() => {
    fetchChat();
  }, [productId, userAddress]);

  // Send a new message (from user)
  async function sendMessage() {
    if (!newMsg.trim()) return;

    const { error } = await supabase.rpc("upsert_product_chat", {
      p_product_id: productId,
      p_user_address: userAddress,
      p_admin_address: "REPLACE_WITH_ADMIN_ADDRESS", // Replace with actual admin address
      p_from: userAddress,
      p_message: newMsg.trim(),
    });

    if (error) {
      console.error("Error sending message:", error);
    } else {
      setNewMsg("");
      // append locally for instant UI feedback
      setMessages((msgs) => [
        ...msgs,
        {
          from: "user",
          content: newMsg.trim(),
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }

  return (
    <div className="max-w-md mx-auto border rounded p-4 flex flex-col h-[600px]">
      {/* Header */}
      <div className="mb-4 flex items-center space-x-4">
        <button
          className="p-2 rounded-full border"
          onClick={() => alert("Back pressed (implement routing)")}
        >
          ←
        </button>
        <div className="flex space-x-2 text-sm">
          <span className="flex items-center space-x-1 border px-3 py-1 rounded-full bg-gray-100">
            <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-xs">
              F
            </span>
            <span>Family</span>
          </span>
          <span>and</span>
          <span className="flex items-center space-x-1 border px-3 py-1 rounded-full bg-black text-white">
            <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-xs">
              D
            </span>
            <span>Dave (You)</span>
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mb-4 border rounded p-2 flex justify-around text-xs font-mono">
        <button className="text-red-600">❌ Dispute</button>
        <button className="text-green-600">✅ Confirm</button>
        <button className="text-blue-600">❗ Lost</button>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 p-2 bg-white border rounded">
        {messages.map((msg, idx) => {
          const isUser = msg.from.toLowerCase() === userAddress.toLowerCase();
          return (
            <div
              key={idx}
              className={`max-w-[70%] px-3 py-2 rounded-lg whitespace-pre-line ${
                isUser
                  ? "bg-black text-white self-end"
                  : "bg-gray-200 self-start"
              }`}
            >
              {msg.content}
              <div className="text-xs text-gray-400 text-right mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex space-x-2"
      >
        <input
          type="text"
          placeholder="Write your message"
          className="flex-1 border rounded px-3 py-2"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
        />
        <button
          type="submit"
          disabled={!newMsg.trim()}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-800"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
