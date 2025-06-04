import { supabase } from "@/lib/initSupabase";
import React, { useEffect, useState, useRef } from "react";
import { useUpProvider } from "./up-provider";
import { useFamilyVault } from "@/hooks/useFamilyVault";
import { useMutation } from "@tanstack/react-query";
import { Vault } from "@/types";
import { toast } from "sonner";
import clsx from "clsx";
import { queryClient } from "./marketplace-provider";
import { Button } from "./ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertTriangle,
  X,
  CheckCircle,
  Send,
  MessageCircle,
} from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useFetchSaltAndUpdate } from "@/hooks/useFetchSaltAndUpdate";
import { pad } from "viem";
import { fetchWithAuth } from "@/lib/api";
import { appConfig } from "@/lib/app-config";

interface ChatMessage {
  from: string;
  content: string;
  timestamp: string;
}

interface ProductChatProps {
  vault: Vault;
}

const adminAddress = appConfig.adminAddress as `0x${string}`;

// Header Components
const UserPills = ({
  isAdmin,
  firstName,
}: {
  isAdmin: boolean;
  firstName?: string;
}) => (
  <div className="flex items-center justify-center px-4 py-3">
    <div className="flex items-center gap-2">
      <MessageCircle className="h-5 w-5 text-gray-600" />
      <Badge
        variant={isAdmin ? "default" : "secondary"}
        className="rounded-full"
      >
        Family
      </Badge>
      <Badge variant="outline" className="rounded-full">
        Seller
      </Badge>
      <span className="text-gray-400 text-sm">and</span>
      <Badge
        variant={!isAdmin ? "default" : "secondary"}
        className="rounded-full"
      >
        {firstName || "User"}
      </Badge>
    </div>
  </div>
);

const ConfirmTradeDialog = ({
  isOpen,
  onOpenChange,
  vault,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vault: Vault;
}) => {
  const vaultAddress = vault.vault_address;
  const [plainUIDCode, setPlainUIDCode] = useState("");
  const { confirmReceipt } = useFamilyVault(vaultAddress as `0x${string}`);
  const { fetchAndUpdateSalt } = useFetchSaltAndUpdate();

  const handleConfirmMutation = useMutation({
    mutationFn: async () => {
      if (!plainUIDCode || vault.nft_contract === undefined) {
        throw new Error("Please enter a valid UID code");
      }
      const { currentSalt, newSalt, newUidHash } = await fetchAndUpdateSalt(
        vault.nft_contract as `0x${string}`,
        plainUIDCode,
      );
      const res = await confirmReceipt(plainUIDCode, currentSalt, newUidHash);
      if (!res) {
        throw new Error("Failed to create vault");
      }
      await fetchWithAuth("/api/save-salt", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: pad("0x0", { size: 32 }), // using a fixed tokenId of 0x0
          contractAddress: vault.nft_contract,
          salt: newSalt,
          uidHash: newUidHash,
        }),
      });
      try {
        const response = await fetchWithAuth(
          `/api/vault?vault_address=${vaultAddress}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_status: "confirmed",
            } as Vault),
          },
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Vault listing update failed: ${errorText}`);
        }
      } catch (error) {
        console.error("Vault listing update failed:", error);
      }
      return { res };
    },
    onSuccess: (data) => {
      console.log("Confirm Product", data);
      toast.success("Product delivery confirmed!");
      queryClient.invalidateQueries({
        queryKey: ["marketplaceProducts", "allNfts"],
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error during buy mutation:", error);
    },
  });
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Confirm Delivery</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This confirms that you have received the product. You will now receive
          its digital trace, and the funds will be released to the seller.
        </p>
        <div className="flex justify-between mt-4 gap-2">
          <Input
            id="plain-uid-code"
            value={plainUIDCode}
            onChange={(e) => setPlainUIDCode(e.target.value)}
            className="w-full"
            placeholder="Enter UID code"
          />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleConfirmMutation.mutate();
            }}
            disabled={handleConfirmMutation.isPending}
          >
            {handleConfirmMutation.isPending ? "Processing..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CancelTradeDialog = ({
  isOpen,
  onOpenChange,
  onCancel,
  reason,
  onReasonChange,
  vault,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  vault: Vault;
}) => {
  const [plainUIDCode, setPlainUIDCode] = useState("");
  const { cancelTrade } = useFamilyVault(vault.vault_address as `0x${string}`);
  const { fetchAndUpdateSalt } = useFetchSaltAndUpdate();

  const handleCancelMutation = useMutation({
    mutationFn: async () => {
      if (!plainUIDCode || vault.nft_contract === undefined) {
        throw new Error("Please enter a valid UID code");
      }
      const { currentSalt, newSalt, newUidHash } = await fetchAndUpdateSalt(
        vault.nft_contract as `0x${string}`,
        plainUIDCode,
      );
      const res = await cancelTrade(plainUIDCode, currentSalt, newUidHash);
      if (!res) {
        throw new Error("Failed to create vault");
      }
      try {
        await fetchWithAuth("/api/save-salt", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenId: pad("0x0", { size: 32 }),
            contractAddress: vault.nft_contract,
            salt: newSalt,
            uidHash: newUidHash,
          }),
        });
        const response = await fetchWithAuth(
          `/api/vault?vault_address=${vault.vault_address}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_status: "cancelled",
            } as Vault),
          },
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Vault listing update failed: ${errorText}`);
        }
      } catch (error) {
        console.error("Vault listing update failed:", error);
      }
      return { res };
    },
    onSuccess: (data) => {
      console.log("Cancel Product", data);
      toast.success("Product delivery confirmed!");
      queryClient.invalidateQueries({
        queryKey: ["marketplaceProducts", "allNfts"],
      });
      onCancel();
    },
    onError: (error) => {
      console.error("Error during buy mutation:", error);
    },
  });
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Trade</DialogTitle>
          <DialogDescription>
            Please provide a reason for cancelling this trade. This will be
            shared in the chat.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col py-4 gap-4">
          <Input
            value={plainUIDCode}
            onChange={(e) => setPlainUIDCode(e.target.value)}
            className="w-full"
            placeholder="Enter UID code"
          />
          <Textarea
            placeholder="Enter your reason for cancellation..."
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleCancelMutation.mutate()}
            disabled={
              handleCancelMutation.isPending ||
              !reason.trim() ||
              !plainUIDCode.trim()
            }
          >
            <X className="h-4 w-4 mr-2" />
            Cancel Trade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ResolveDisputeDialog = ({
  isOpen,
  onOpenChange,
  onResolve,
  buyer,
  seller,
  vault,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: ({
    traceReceiver,
    fundsReceiver,
  }: {
    traceReceiver: string;
    fundsReceiver: string;
  }) => void;
  buyer: string;
  seller: string;
  vault: Vault;
}) => {
  const vaultAddress = vault.vault_address;
  const { resolveDispute } = useFamilyVault(vaultAddress as `0x${string}`);
  const { fetchDataAndUpdateSalt } = useFetchSaltAndUpdate();
  const [selectedWinner, setSelectedWinner] = useState("");
  const [selectedTraceReceiver, setSelectedTraceReceiver] = useState("");

  const handleResolveDispute = useMutation({
    mutationFn: async () => {
      if (vault.nft_contract === undefined) {
        throw new Error("Please enter a valid UID code");
      }
      const { plainUIDCode, currentSalt, newSalt, newUidHash } =
        await fetchDataAndUpdateSalt(vault.nft_contract as `0x${string}`);
      const res = await resolveDispute(
        selectedTraceReceiver,
        selectedWinner,
        plainUIDCode,
        currentSalt,
        newUidHash,
      );

      if (!res) {
        throw new Error("Failed to create vault");
      }
      await fetchWithAuth("/api/save-salt", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: pad("0x0", { size: 32 }), // using a fixed tokenId of 0x0
          contractAddress: vault.nft_contract,
          salt: newSalt,
          uidHash: newUidHash,
        }),
      });
      try {
        const response = await fetchWithAuth(
          `/api/vault?vault_address=${vaultAddress}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_status: "resolved",
            } as Vault),
          },
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Vault listing update failed: ${errorText}`);
        }
      } catch (error) {
        console.error("Vault listing update failed:", error);
      }
      return { res };
    },
    onSuccess: (data) => {
      console.log("Resolve by admin ", data);
      queryClient.invalidateQueries({
        queryKey: ["marketplaceProducts", "allNfts"],
      });
      onResolve({
        traceReceiver: selectedTraceReceiver === buyer ? "buyer" : "seller",
        fundsReceiver: selectedWinner === buyer ? "buyer" : "seller",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error during buy mutation:", error);
    },
  });
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Dispute</DialogTitle>
          <DialogDescription>
            Select where to send the funds and trace information to resolve this
            dispute.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Send Funds To:</label>
            <Select value={selectedWinner} onValueChange={setSelectedWinner}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipient for funds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={buyer}>Buyer</SelectItem>
                <SelectItem value={seller}>Seller</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Send Trace To:</label>
            <Select
              value={selectedTraceReceiver}
              onValueChange={setSelectedTraceReceiver}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipient for trace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={buyer}>Buyer</SelectItem>
                <SelectItem value={seller}>Seller</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => handleResolveDispute.mutate()}
            disabled={
              !selectedWinner ||
              !selectedTraceReceiver ||
              handleResolveDispute.isPending
            }
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {handleResolveDispute.isPending ? "Resolving" : "Resolve Dispute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ActionButtons = ({
  isBuyer,
  isSeller,
  isAdmin,
  showConfirmButton,
  showCancelButton,
  showDisputeButton,
  showResolveButton,
  onConfirmOpen,
  onCancelOpen,
  onDispute,
  onResolveOpen,
  disputePending,
}: {
  isBuyer: boolean;
  isSeller: boolean;
  isAdmin: boolean;
  showConfirmButton: boolean;
  showCancelButton: boolean;
  showDisputeButton: boolean;
  showResolveButton: boolean;
  onConfirmOpen: () => void;
  onCancelOpen: () => void;
  onDispute: () => void;
  onResolveOpen: () => void;
  disputePending?: boolean;
}) => (
  <div className="flex items-center gap-2">
    {/* Buyer Confirm Button */}
    {isBuyer && showConfirmButton && (
      <Button
        size="sm"
        variant="default"
        className="rounded-full bg-green-500 text-white hover:bg-green-600"
        onClick={onConfirmOpen}
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Confirm
      </Button>
    )}

    {/* Seller Cancel Button */}
    {isSeller && showCancelButton && (
      <Button
        size="sm"
        variant="outline"
        className="rounded-full"
        onClick={onCancelOpen}
      >
        <X className="h-4 w-4 mr-1" />
        Cancel
      </Button>
    )}

    {/* Dispute Button */}
    {!isAdmin && showDisputeButton && (isBuyer || isSeller) && (
      <Button
        size="sm"
        variant="destructive"
        className="rounded-full"
        onClick={onDispute}
        disabled={disputePending}
      >
        <AlertTriangle className="h-4 w-4 mr-1" />
        Dispute
      </Button>
    )}

    {/* Admin Resolve Button */}
    {isAdmin && showResolveButton && (
      <Button
        size="sm"
        variant="default"
        className="rounded-full"
        onClick={onResolveOpen}
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Resolve
      </Button>
    )}
  </div>
);

const ChatHeader = ({
  isAdmin,
  firstName,
  isBuyer,
  isSeller,
  showConfirmButton,
  showCancelButton,
  showDisputeButton,
  showResolveButton,
  onConfirmOpen,
  onCancelOpen,
  onDispute,
  onResolveOpen,
  disputePending,
}: {
  isAdmin: boolean;
  firstName?: string;
  isBuyer: boolean;
  isSeller: boolean;
  showConfirmButton: boolean;
  showCancelButton: boolean;
  showDisputeButton: boolean;
  showResolveButton: boolean;
  onConfirmOpen: () => void;
  onCancelOpen: () => void;
  onDispute: () => void;
  onResolveOpen: () => void;
  disputePending?: boolean;
}) => (
  <div className="border-b bg-gray-50/50 rounded-t-lg">
    {/* First Row - User Pills */}
    <UserPills isAdmin={isAdmin} firstName={firstName} />

    {/* Second Row - Action Buttons */}
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <span className="text-sm font-medium text-gray-700">ACTIONS</span>
      <ActionButtons
        isBuyer={isBuyer}
        isSeller={isSeller}
        isAdmin={isAdmin}
        showConfirmButton={showConfirmButton}
        showCancelButton={showCancelButton}
        showDisputeButton={showDisputeButton}
        showResolveButton={showResolveButton}
        onConfirmOpen={onConfirmOpen}
        onCancelOpen={onCancelOpen}
        onDispute={onDispute}
        onResolveOpen={onResolveOpen}
        disputePending={disputePending}
      />
    </div>
  </div>
);

// Message Components
const DateSeparator = ({ date }: { date: string }) => (
  <div className="flex justify-center my-4">
    <Badge variant="secondary" className="text-xs px-3 py-1">
      {date}
    </Badge>
  </div>
);

const MessageBubble = ({
  message,
  isFromCurrentUser,
  pillLabel,
  pillVariant,
}: {
  message: ChatMessage;
  isFromCurrentUser: boolean;
  pillLabel: string;
  pillVariant: "default" | "secondary" | "outline";
}) => {
  const align = isFromCurrentUser ? "end" : "start";
  const bubbleBg = isFromCurrentUser
    ? "bg-black text-white"
    : message.from === "system"
      ? "bg-blue-50 text-blue-800 border border-blue-200"
      : "bg-gray-100 text-gray-800";

  return (
    <div
      className={clsx(
        "flex flex-col mb-3",
        align === "end" ? "items-end" : "items-start",
      )}
    >
      <div className={clsx("mb-2", align === "end" ? "mr-2" : "ml-2")}>
        <Badge variant={pillVariant} className="rounded-full">
          {pillLabel}
        </Badge>
      </div>
      <div
        className={clsx(
          "max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm whitespace-pre-line",
          bubbleBg,
          align === "end" ? "rounded-br-md" : "rounded-bl-md",
        )}
      >
        {message.content}
        <div
          className={clsx(
            "text-[10px] text-right mt-2",
            isFromCurrentUser ? "text-gray-300" : "text-gray-400",
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

const ChatMessages = ({
  messages,
  userAddress,
  adminAddress,
  seller,
  buyer,
  firstName,
}: {
  messages: ChatMessage[];
  userAddress: string;
  adminAddress: string;
  seller?: string;
  buyer?: string;
  firstName?: string;
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  let lastDate = "";

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 bg-white">
      {messages.map((msg, idx) => {
        const isFromCurrentUser =
          msg.from.toLowerCase() === userAddress.toLowerCase();

        // Determine sender label
        let pillLabel = "";
        if (msg.from.toLowerCase() === adminAddress.toLowerCase()) {
          pillLabel = "Family";
        } else if (msg.from.toLowerCase() === seller?.toLowerCase()) {
          pillLabel = "Seller";
        } else if (msg.from.toLowerCase() === buyer?.toLowerCase()) {
          pillLabel = firstName || "User";
        } else if (msg.from === "system") {
          pillLabel = "System";
        } else {
          pillLabel = "User";
        }

        const pillVariant =
          isFromCurrentUser ||
          msg.from.toLowerCase() === adminAddress.toLowerCase()
            ? "default"
            : msg.from === "system"
              ? "secondary"
              : "outline";

        const dateStr = msg.timestamp.slice(0, 10);
        const showDate = dateStr !== lastDate;
        lastDate = dateStr;

        return (
          <React.Fragment key={idx}>
            {showDate && <DateSeparator date={dateStr} />}
            <MessageBubble
              message={msg}
              isFromCurrentUser={isFromCurrentUser}
              pillLabel={pillLabel}
              pillVariant={pillVariant}
            />
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

const ChatInput = ({
  newMsg,
  onMsgChange,
  onSend,
}: {
  newMsg: string;
  onMsgChange: (msg: string) => void;
  onSend: (e: React.FormEvent) => void;
}) => (
  <form
    onSubmit={onSend}
    className="flex items-center gap-3 border-t px-4 py-4 bg-gray-50/50 rounded-b-lg"
  >
    <input
      type="text"
      placeholder="Type your message..."
      className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
      value={newMsg}
      onChange={(e) => onMsgChange(e.target.value)}
    />
    <Button
      type="submit"
      disabled={!newMsg.trim()}
      size="sm"
      className="rounded-full px-4"
    >
      <Send className="h-4 w-4" />
    </Button>
  </form>
);

// Main Component
export default function ProductChat({ vault }: ProductChatProps) {
  const order_status = vault.order_status || "pending";
  const { buyer, seller, vault_address: vaultAddress, first_name } = vault;
  const { accounts } = useUpProvider();
  const userAddress = accounts[0] || "";
  const { initiateDispute } = useFamilyVault(vaultAddress as `0x${string}`);

  // User role checks
  const isAdmin = userAddress.toLowerCase() === adminAddress.toLowerCase();
  const isBuyer = userAddress.toLowerCase() === buyer?.toLowerCase();
  const isSeller = userAddress.toLowerCase() === seller?.toLowerCase();

  // Button visibility flags
  const showConfirmButton =
    isBuyer && order_status === "pending" && !isSeller && !isAdmin;
  const showCancelButton =
    isSeller && order_status === "pending" && !isBuyer && !isAdmin;
  const showDisputeButton = !isAdmin && order_status === "pending";
  const showResolveButton =
    isAdmin && order_status === "disputed" && !isBuyer && !isSeller;

  // State
  const [cancelReason, setCancelReason] = useState("");
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState("");

  // Data fetching
  async function fetchChat() {
    const { data, error } = await supabase
      .from("product_chats")
      .select("content")
      .eq("product_id", vaultAddress)
      .single();

    if (error) {
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

  // Message sending
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

  // Action handlers
  async function sendDisputeMessage() {
    let raisedBy = "";
    if (userAddress.toLowerCase() === buyer?.toLowerCase()) {
      raisedBy = vault.first_name || "Buyer";
    } else if (userAddress.toLowerCase() === seller?.toLowerCase()) {
      raisedBy = "Seller";
    } else {
      raisedBy = "";
    }
    await sendMessage(
      `Thanks for raising a dispute. We will look into it and get back to you shortly. Stay tuned! Raised by: ${raisedBy}`,
      "admin",
    );
  }

  async function sendCancelMessage(reason: string) {
    const canceledBy = isSeller ? "Seller" : "Buyer";
    await sendMessage(
      `Trade has been cancelled by ${canceledBy}. Reason: ${reason}`,
      "system",
    );
  }

  async function markDisputeInDB() {
    try {
      const response = await fetchWithAuth(
        `/api/vault?vault_address=${vaultAddress}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_status: "disputed",
          } as Vault),
        },
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Vault listing update failed: ${errorText}`);
      }
    } catch (error) {
      console.error("Vault listing update failed:", error);
    }
  }

  const handleRaiseDispute = async () => {
    try {
      await initiateDisputeMutation.mutateAsync();
    } catch (e) {
      console.log(e);
      return;
    }
  };

  const handleCancelTrade = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      await sendCancelMessage(cancelReason);
      toast.success("Trade cancelled successfully");
      setIsCancelModalOpen(false);
      setCancelReason("");
    } catch (error) {
      console.error("Failed to cancel trade:", error);
      toast.error("Failed to cancel trade");
    }
  };

  const handleResolveDispute = async ({
    traceReceiver,
    fundsReceiver,
  }: {
    traceReceiver: string;
    fundsReceiver: string;
  }) => {
    try {
      toast.success("Dispute resolved successfully!");
      await sendMessage(
        `Dispute has been resolved by admin. Funds sent to ${fundsReceiver} and trace sent to ${traceReceiver}.`,
        "admin",
      );
      setIsResolveModalOpen(false);
    } catch (err) {
      console.error("Dispute resolution failed", err);
      toast.error("Dispute resolution failed.");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    await sendMessage(newMsg.trim(), isAdmin ? "admin" : "user");
    setNewMsg("");
  };

  // Mutations
  const initiateDisputeMutation = useMutation({
    mutationFn: async () => {
      const res = await initiateDispute();
      if (!res) {
        throw new Error("Dispute onchain transaction failed.");
      }
      return res;
    },
    onSuccess: () => {
      markDisputeMutation.mutate();
    },
    onError: (err) => {
      console.error("Failed to initiate dispute onchain:", err);
      toast.error("Dispute onchain transaction failed.");
    },
  });

  const markDisputeMutation = useMutation({
    mutationFn: markDisputeInDB,
    onSuccess: () => {
      sendDisputeMessageMutation.mutate();
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

  if (!userAddress) {
    return (
      <div className="flex items-center justify-center h-[600px] max-w-md bg-white rounded-lg border">
        <p className="text-gray-500">
          Please connect your wallet to view the chat.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md flex flex-col h-[600px] bg-white rounded-lg border shadow-sm">
      <ChatHeader
        isAdmin={isAdmin}
        firstName={first_name}
        isBuyer={isBuyer}
        isSeller={isSeller}
        showConfirmButton={showConfirmButton}
        showCancelButton={showCancelButton}
        showDisputeButton={showDisputeButton}
        showResolveButton={showResolveButton}
        onConfirmOpen={() => setIsConfirmModalOpen(true)}
        onCancelOpen={() => setIsCancelModalOpen(true)}
        onDispute={handleRaiseDispute}
        onResolveOpen={() => setIsResolveModalOpen(true)}
        disputePending={initiateDisputeMutation.isPending}
      />

      <ChatMessages
        messages={messages}
        userAddress={userAddress}
        adminAddress={adminAddress}
        seller={seller}
        buyer={buyer}
        firstName={first_name}
      />

      <ChatInput newMsg={newMsg} onMsgChange={setNewMsg} onSend={handleSend} />

      {/* Dialogs */}
      {isBuyer && (
        <ConfirmTradeDialog
          isOpen={isConfirmModalOpen}
          onOpenChange={setIsConfirmModalOpen}
          vault={vault}
        />
      )}

      {isSeller && (
        <CancelTradeDialog
          isOpen={isCancelModalOpen}
          onOpenChange={setIsCancelModalOpen}
          onCancel={handleCancelTrade}
          reason={cancelReason}
          onReasonChange={setCancelReason}
          vault={vault}
        />
      )}

      {isAdmin && (
        <ResolveDisputeDialog
          isOpen={isResolveModalOpen}
          onOpenChange={setIsResolveModalOpen}
          onResolve={handleResolveDispute}
          buyer={buyer as string}
          seller={seller as string}
          vault={vault}
        />
      )}
    </div>
  );
}
