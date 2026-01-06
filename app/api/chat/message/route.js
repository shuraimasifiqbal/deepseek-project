import connectDB from "@/config/db";
import Chat from "@/model/Chat";
import { currentUser } from "@clerk/nextjs/server"; // ✅ server-side auth
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    // Get logged-in user
    const user = await currentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Get chatId and message from request body
    const { chatId, message } = await req.json();
    if (!chatId || !message) return NextResponse.json(
      { message: "chatId and message required" },
      { status: 400 }
    );

    // Add message to the chat
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, userId: user.id }, // ✅ filter by logged-in user
      { $push: { messages: message } },
      { new: true }
    );

    if (!updatedChat) return NextResponse.json(
      { message: "Chat not found" },
      { status: 404 }
    );

    return NextResponse.json({ success: true, data: updatedChat });
  } catch (error) {
    console.error("❌ Error saving message:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
