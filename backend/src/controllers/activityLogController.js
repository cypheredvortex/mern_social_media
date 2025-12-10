import ActivityLog from "../models/ActivityLog.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Follow from "../models/Follow.js";
import Notification from "../models/Notification.js";

export async function list_activityLog(req, res) {
  try {
    const activityLogs = await ActivityLog.find()
      .populate('user_id', 'username email') // Populate user info
      .sort({ createdAt: -1 }); // Sort by latest first
    res.json(activityLogs);
  } catch (error) {
    console.error("Error in list_activityLog controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function get_activityLog_by_id(req, res) {
  try {
    // Fetch the activity log and populate the user
    const log = await ActivityLog.findById(req.params.id)
      .populate("user_id", "username email role profile_id")
      .lean(); // lean() converts Mongoose doc to plain JS object

    if (!log) return res.status(404).json({ message: "Activity log not found!" });

    // Enhance target info based on action type
    let target = null;

    if (log.target_id) {
      switch (log.action) {
        case "created_post":
        case "liked_post":
        case "shared_post":
        case "deleted_post":
          target = await Post.findById(log.target_id)
            .populate("author_id", "username")
            .lean();
          break;

        case "commented_post":
          target = await Comment.findById(log.target_id)
            .populate("author_id", "username")
            .lean();
          break;

        case "followed_user":
        case "unfollowed_user":
          target = await Follow.findById(log.target_id)
            .populate("follower_id followed_id", "username")
            .lean();
          break;

        case "login":
        case "logout":
        case "updated_profile":
          target = await User.findById(log.target_id)
            .populate("profile_id")
            .lean();
          break;

        case "other":
          // Optional: try to populate from any other model if needed
          target = await Notification.findById(log.target_id).lean();
          break;

        default:
          target = { _id: log.target_id }; // fallback: just show the ID
      }
    }

    res.status(200).json({
      ...log,
      target_id: target,
    });
  } catch (error) {
    console.error("Error in get_activityLog_by_id controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function create_activityLog(req, res) {
  try {
    const { user_id, action, target_id } = req.body;

    if (!user_id || !action) {
      return res
        .status(400)
        .json({ message: "user_id and action are required!" });
    }

    const log = new ActivityLog({ user_id, action, target_id: target_id || null });
    const savedLog = await log.save();
    res.status(201).json(savedLog);
  } catch (error) {
    console.error("Error in create_activityLog controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function update_activityLog(req, res) {
  try {
    const { action, target_id } = req.body;

    const updatedLog = await ActivityLog.findByIdAndUpdate(
      req.params.id,
      { action, target_id },
      { new: true }
    );

    if (!updatedLog) {
      return res.status(404).json({ message: "Activity log not found!" });
    }

    res.status(200).json(updatedLog);
  } catch (error) {
    console.error("Error in update_activityLog controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function delete_activityLog(req, res) {
  try {
    const deletedLog = await ActivityLog.findByIdAndDelete(req.params.id);

    if (!deletedLog) {
      return res.status(404).json({ message: "Activity log not found!" });
    }

    res.status(200).json({ message: "Activity log deleted successfully!" });
  } catch (error) {
    console.error("Error in delete_activityLog controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}
