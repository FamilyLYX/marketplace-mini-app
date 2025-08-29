import { adminDb } from "./firerbase";

export interface ChatMessage {
  from: string;
  content: string;
  timestamp: string;
}

export class ChatService {
  /**
   * Send a message to a product chat
   */
  static async sendMessage(
    productId: string,
    fromAddress: string,
    content: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock message send
      // console.log("Mock message sent:", { productId, fromAddress, content });
      await adminDb.collection("messages").add({
        productId,
        from: fromAddress,
        content,
        timestamp: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error sending message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get all messages for a product
   */
  static async getMessages(productId: string): Promise<ChatMessage[]> {
    try {
      const messages = await adminDb
        .collection("messages")
        .where("productId", "==", productId)
        .get();
      const messagesData = messages.docs.map(
        (doc) => doc.data() as ChatMessage
      );
      console.log("messagesData", messagesData);
      return messagesData;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  }

  /**
   * Get all product chats (for admin view)
   */
  static async getAllProductChats() {
    try {
      const chats = await adminDb.collection("messages").get();
      const chatsData = chats.docs.map((doc) => doc.data() as ChatMessage);
      return chatsData;
    } catch (error) {
      console.error("Error fetching all chats:", error);
      return [];
    }
  }
}
