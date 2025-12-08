import Notification from "../models/Notification.js";

export async function list_notification(req, res) {
  try {
    const { user_id } = req.query; 
    const filter = user_id ? { user_id } : {};
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .populate("sender_id", "username profile_picture");
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in list_notification controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function get_notification_by_id(req, res) {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate("sender_id", "username profile_picture");
    if (!notification) {
      return res.status(404).json({ message: "Notification not found!" });
    }
    res.status(200).json(notification);
  } catch (error) {
    console.error("Error in get_notification_by_id controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function create_notification(req, res) {
  try {
    const { user_id, type, sender_id, target_id } = req.body;
    const notification = new Notification({
      user_id,
      type,
      sender_id: sender_id || null,
      target_id: target_id || null,
    });
    const savedNotification = await notification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    console.error("Error in create_notification controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function update_notification(req, res) {
  try {
    const { read } = req.body;
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read },
      { new: true }
    );
    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found!" });
    }
    res.status(200).json(updatedNotification);
  } catch (error) {
    console.error("Error in update_notification controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function delete_notification(req, res) {
  try {
    const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
    if (!deletedNotification) {
      return res.status(404).json({ message: "Notification not found!" });
    }
    res.status(200).json({ message: "Notification deleted successfully!" });
  } catch (error) {
    console.error("Error in delete_notification controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}
