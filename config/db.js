  // import mongoose  from "mongoose";

  // let cached = global.mongoose || {conn: null , promise: null}

  // export default async function connectDB(){
  //     if(cached.conn) return cached.conn;
  //     if(!cached.promise){
  //         cached.promise = mongoose.connect(process.env.MONGODB_URI).then((mongoose) => mongoose)
  //     }
  //     try {
  //         cached.conn = await cached.promise;
  //     } catch (error) {
  //         console.err("error connecting to mongo DB:" , error)
  //     }
  //     return cached.conn
  // }

  // config/db.js
  import mongoose from "mongoose";

  let cached = global.mongoose || { conn: null, promise: null };
  global.mongoose = cached;

  export default async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
      cached.promise = mongoose.connect(process.env.MONGODB_URI).then((mongoose) => mongoose);
    }

    try {
      cached.conn = await cached.promise;
      console.log("MongoDB connected"); // <-- this will show in terminal
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }

    return cached.conn;
  }
