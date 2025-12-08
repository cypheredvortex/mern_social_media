import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    uploader_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "audio", "document"],
      required: true,
    },
    size: {
      type: Number, 
      required: true,
    },
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: false, 
    },
  },
  {
    timestamps: true, 
  }
);

const Media = mongoose.model("Media", mediaSchema);

export default Media;
