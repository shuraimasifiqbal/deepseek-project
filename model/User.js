// import mongoose from "mongoose";

// const UserSchema = new mongoose.Schema(
//   {
//     _id: { type: String, required: true },
//     name: { type: String, required: true },
//     email: { type: String, required: true },
//     image: { type: String, required: false },
//   },
//   { timestamps: true }
// );

// const User = mongoose.models.User || mongoose.model("User", UserSchema);

// export default User;

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerk_id: { type: String},
    name: { type: String},
    email: { type: String},
    image: { type: String},
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
