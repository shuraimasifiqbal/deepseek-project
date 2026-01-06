// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerk_id: { type: String, required: true, unique: true }, // ensure uniqueness
    name: { type: String },
    email: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
