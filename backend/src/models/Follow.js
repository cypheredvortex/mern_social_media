import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    follower_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followed_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false } 
  }
);

followSchema.index({ follower_id: 1, followed_id: 1 }, { unique: true });

const Follow = mongoose.model("Follow", followSchema);

export default Follow;
