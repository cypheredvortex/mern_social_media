import ActivityLog from "../models/ActivityLog.js";

export async function list_activityLog(req, res) {
  try {
    const logs = await ActivityLog.find()
      .populate("user_id", "username profile_picture") // optional, populate user info
      .sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error in list_activityLog controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function get_activityLog_by_id(req, res) {
  try {
    const log = await ActivityLog.findById(req.params.id).populate(
      "user_id",
      "username profile_picture"
    );
    if (!log) {
      return res.status(404).json({ message: "Activity log not found!" });
    }
    res.status(200).json(log);
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
