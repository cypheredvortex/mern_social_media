import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    media_url: {
      type: String,
      default: null,
    },
    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
    like_count: {
      type: Number,
      default: 0,
    },
    comment_count: {
      type: Number,
      default: 0,
    },
    share_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, 
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
