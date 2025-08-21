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
      console.log("Mock message sent:", { productId, fromAddress, content });
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
      // Return mock messages
      const mockMessages = [
        {
          from: "0x1234567890123456789012345678901234567890",
          content: `Hello, I'm interested in product ${productId}`,
          timestamp: new Date().toISOString(),
        },
        {
          from: "0x0987654321098765432109876543210987654321",
          content: "Great! Let me know if you have any questions",
          timestamp: new Date().toISOString(),
        },
      ];

      return mockMessages;
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
      // Return mock chats
      const mockChats = [
        {
          id: "chat1",
          product_id: "product1",
          from_address: "0x1234567890123456789012345678901234567890",
          message: "Hello, I'm interested in this product",
          timestamp: new Date().toISOString(),
        },
        {
          id: "chat2",
          product_id: "product2",
          from_address: "0x0987654321098765432109876543210987654321",
          message: "When will this be available?",
          timestamp: new Date().toISOString(),
        },
      ];
      return mockChats;
    } catch (error) {
      console.error("Error fetching all chats:", error);
      return [];
    }
  }
}
