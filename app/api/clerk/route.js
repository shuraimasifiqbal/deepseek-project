// import { Webhook } from "svix";
// import connectDB from "@/config/db";
// import User from "@/model/User";
// import { headers } from "next/headers";
// import { NextRequest } from "next/server"; 

// export async function POST(req){
//     const wh = new Webhook(process.env.SIGNING_SECRET)
//     const headerPayLoad = await headers()
//     const svixHeaders = {
//         "svix-id": headerPayLoad.get("svix-id"), 
//         "svix-timestamps": headerPayLoad.get("svix-timestamp"),
//         "svix-signature": headerPayLoad.get("svix-signature") 
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
// app/api/clerk/route.js
import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/model/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    console.log("✅ Webhook POST hit");
    
    // Get headers
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");
    
    console.log("Headers:", {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature
    });
    
    const payload = await req.json();
    const body = JSON.stringify(payload);
    
    let eventData, eventType;
    
    // Only verify if we have a signing secret AND all required headers
    if (process.env.SIGNING_SECRET && svixId && svixTimestamp && svixSignature) {
      try {
        const wh = new Webhook(process.env.SIGNING_SECRET);
        
        const svixHeaders = {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        };
        
        const verifiedPayload = wh.verify(body, svixHeaders);
        eventData = verifiedPayload.data;
        eventType = verifiedPayload.type;
        console.log("✅ Webhook verified:", eventType);
      } catch (err) {
        console.error("❌ Verification failed:", err.message);
        return NextResponse.json(
          { message: "error", error: `Webhook verification failed: ${err.message}` },
          { status: 400 }
        );
      }
    } else {
      // Local/test mode - no verification
      console.log("⚠️ Skipping verification (missing headers or signing secret)");
      eventData = payload.data;  // Changed from payload to payload.data
      eventType = payload.type || "user.created";
    }
    
    console.log("Event data:", eventData);
    
    const userData = {
      clerk_id: eventData.id,
      email: eventData.email_addresses?.[0]?.email_address || eventData.email_addresses?.[0]?.email,  // Note: it's email_address, not email
      name: `${eventData.first_name || ""} ${eventData.last_name || ""}`.trim(),
      image: eventData.image_url || "",
    };
    
    console.log("Prepared userData:", userData);
    
    switch (eventType) {
      case "user.created":
        await User.create(userData);
        console.log("✅ User created:", userData);
        break;
      case "user.updated":
        await User.findOneAndUpdate(
          { clerk_id: eventData.id },  // Changed to use clerk_id
          userData,
          { new: true }
        );
        console.log("🔄 User updated:", userData);
        break;
      case "user.deleted":
        await User.findOneAndDelete({ clerk_id: eventData.id });  // Changed to use clerk_id
        console.log("🗑 User deleted:", eventData.id);
        break;
      default:
        console.log("ℹ️ Unhandled event type:", eventType);
    }
    
    return NextResponse.json({ message: "event received", type: eventType });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { message: "error", error: error.message },
      { status: 500 }
    );
  }
}
