import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "created_post",
        "liked_post",
        "commented_post",
        "shared_post",
        "followed_user",
        "unfollowed_user",
        "updated_profile",
        "deleted_post",
        "login",
        "logout",
        "other", 
        "warning_sent",
      ],
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, 
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
