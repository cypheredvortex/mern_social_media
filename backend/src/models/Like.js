import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    target_type: {
      type: String,
      enum: ["post", "comment", "reply"],
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const Like = mongoose.model("Like", likeSchema);

export default Like;
