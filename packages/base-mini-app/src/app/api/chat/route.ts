import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "@/lib/chatService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const messages = await ChatService.getMessages(productId);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, fromAddress, content } = body;

    if (!productId || !fromAddress || !content) {
      return NextResponse.json(
        { error: "Product ID, from address, and content are required" },
        { status: 400 }
      );
    }

    const result = await ChatService.sendMessage(
      productId,
      fromAddress,
      content
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
