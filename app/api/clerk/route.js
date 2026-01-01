// import { Webhook } from "svix";
// import connectDB from "@/config/db";
// import User from "@/model/User";
// import { headers } from "next/headers";
// import { NextRequest } from "next/server"; 

// export async function POST(req){
//     const wh = new Webhook(process.env.SIGNING_SECRET)
//     const headerPayLoad = await headers()
//     const svixHeaders = {
//         "svix_id": headerPayLoad.get("svix_id"),
//          "svix_timestamps": headerPayLoad.get("svix_timestamps"),
//         "svix_signature": headerPayLoad.get("svix_signature") 
//     };
//     // get the payload and verify it

//     const payload = await req.json;
//     const body = JSON.stringify(payload)
//     const {data , type} = wh.verify(body , svixHeaders)

//     // prepare user data to save into data base

//     const userData = {
//         _id: data.id,
//         email: data.email_addresses[0].email_addresses,
//         name: `${data.first_name} ${data.last_name}`,
//         image: data.image_url
//     };

//     await connectDB();

//     switch (type) {
//         case 'user.created':
//             await User.create(userData)
//             break;
    
//         case 'user.updated':
//             await User.findByIdAndUpdate(data.id , userData)
//             break;
    
//         case 'user.deleted':
//             await User.findByIdAndDelete(data.id)
//             break;
    
//         default:
//             break;
//     }

//     return NextRequest.json({message: "event received"})
// }

import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/model/User";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1️⃣ Signing secret check
    const SIGNING_SECRET = process.env.SIGNING_SECRET;
    if (!SIGNING_SECRET) {
      return NextResponse.json(
        { error: "SIGNING_SECRET missing" },
        { status: 500 }
      );
    }

    // 2️⃣ Get headers (NO await here)
    const headerPayload = headers();

    const svixHeaders = {
      "svix-id": headerPayload.get("svix-id"),
      "svix-timestamp": headerPayload.get("svix-timestamp"),
      "svix-signature": headerPayload.get("svix-signature"),
    };

    // 3️⃣ Get request body
    const payload = await req.json(); // () is IMPORTANT
    const body = JSON.stringify(payload);

    // 4️⃣ Verify Clerk webhook
    const wh = new Webhook(SIGNING_SECRET);
    const { data, type } = wh.verify(body, svixHeaders);

    // 5️⃣ Connect MongoDB
    await connectDB();

    // 6️⃣ Prepare user data
    const userData = {
      _id: data.id,
      email: data.email_addresses?.[0]?.email_address || "",
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      image: data.image_url || "",
    };

    // 7️⃣ Handle events
    switch (type) {
      case "user.created":
        await User.create(userData);
        break;

      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        break;

      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;

      default:
        console.log("Unhandled event:", type);
    }

    // 8️⃣ Success response
    return NextResponse.json({ message: "Webhook received" });
  } catch (error) {
    console.error("Clerk Webhook Error:", error);
    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}
