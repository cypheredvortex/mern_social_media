import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },
    dark_mode: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      default: "en",
    },
    notifications_enabled: {
      type: Boolean,
      default: true,
    },
    privacy_visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const UserSettings = mongoose.model("UserSettings", userSettingsSchema);

export default UserSettings;
