// app/api/chat/[id]/route.js
import connectDB from "@/config/db";
import Chat from "@/model/Chat";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function DELETE(req, context) {
  try {
    // ✅ params is a Promise in Next 16.1
    const { id: chatId } = await context.params;

    console.log("CHAT ID:", chatId);

    if (!chatId) {
      return NextResponse.json(
        { message: "Chat ID missing" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const deletedChat = await Chat.findOneAndDelete({
      _id: new ObjectId(chatId),
      userId: user.id,
    });

    if (!deletedChat) {
      return NextResponse.json(
        { message: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Chat deleted",
    });
  } catch (err) {
    console.error("❌ DELETE ERROR:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
