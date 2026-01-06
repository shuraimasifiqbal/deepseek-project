// app/api/chat/get/route.js
import connectDB from "@/config/db";
import Chat from "@/model/Chat";
import { currentUser } from "@clerk/nextjs/server"; // ✅ server-side import
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const user = await currentUser(); // get the logged-in user
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const chats = await Chat.find({ userId: user.id }).sort({ updatedAt: -1 });

    return NextResponse.json({ success: true, data: chats });
  } catch (error) {
    console.error("❌ Error fetching chats:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
