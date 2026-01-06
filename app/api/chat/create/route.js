import connectDB from "@/config/db";
import Chat from "@/model/Chat";
import { currentUser } from "@clerk/nextjs/server"; // ✅ server-side auth
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const user = await currentUser(); // get logged-in user
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const newChat = await Chat.create({
      name: "New Chat",
      messages: [],
      userId: user.id, // use Clerk user id
    });

    return NextResponse.json({ success: true, data: newChat });
  } catch (error) {
    console.error("❌ Error creating chat:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
