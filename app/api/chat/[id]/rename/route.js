// app/api/chat/[id]/route.js
import connectDB from "@/config/db";
import Chat from "@/model/Chat";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function PUT(req, context) {
  try {
    // ✅ params is Promise in Next 16.1
    const { id: chatId } = await context.params;

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

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const updatedChat = await Chat.findOneAndUpdate(
      {
        _id: new ObjectId(chatId),
        userId: user.id,
      },
      { $set: { name } },
      { new: true }
    );

    if (!updatedChat) {
      return NextResponse.json(
        { message: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedChat,
    });
  } catch (err) {
    console.error("❌ Error renaming chat:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
