import UserSettings from "../models/UserSettings.js";
import mongoose from "mongoose";

export async function list_userSettings(req, res) {
  try {
    const settings = await UserSettings.find().populate("user_id", "username email");
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error in list_user_settings controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function get_userSettings_by_id(req, res) {
  try {
    const settings = await UserSettings.findById(req.params.id).populate("user_id", "username email");
    if (!settings) {
      return res.status(404).json({ message: "User settings not found!" });
    }
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error in get_user_settings_by_id controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function get_userSettings_by_user(req, res) {
  try {
    const settings = await UserSettings.findOne({ user_id: req.params.userId }).populate("user_id", "username email");
    if (!settings) {
      return res.status(404).json({ message: "User settings not found!" });
    }
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error in get_user_settings_by_user controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function create_userSettings(req, res) {
  try {
    const { user_id, dark_mode, language, notifications_enabled, privacy_visibility } = req.body;

    const existing = await UserSettings.findOne({ user_id });
    if (existing) {
      return res.status(400).json({ message: "User settings already exist!" });
    }

    const settings = new UserSettings({ user_id, dark_mode, language, notifications_enabled, privacy_visibility });
    const savedSettings = await settings.save();
    res.status(201).json(savedSettings);
  } catch (error) {
    console.error("Error in create_user_settings controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function update_userSettings(req, res) {
  try {
    const { dark_mode, language, notifications_enabled, privacy_visibility } = req.body;
    const updatedSettings = await UserSettings.findByIdAndUpdate(
      req.params.id,
      { dark_mode, language, notifications_enabled, privacy_visibility },
      { new: true }
    );
    if (!updatedSettings) {
      return res.status(404).json({ message: "User settings not found!" });
    }
    res.status(200).json(updatedSettings);
  } catch (error) {
    console.error("Error in update_user_settings controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function update_userSettings_by_user(req, res) {
  try {
    const { dark_mode, language, notifications_enabled, privacy_visibility } = req.body;
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { user_id: req.params.userId },
      { dark_mode, language, notifications_enabled, privacy_visibility },
      { new: true }
    );
    if (!updatedSettings) {
      return res.status(404).json({ message: "User settings not found!" });
    }
    res.status(200).json(updatedSettings);
  } catch (error) {
    console.error("Error in update_user_settings_by_user controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function delete_userSettings(req, res) {
  try {
    const deletedSettings = await UserSettings.findByIdAndDelete(req.params.id);
    if (!deletedSettings) {
      return res.status(404).json({ message: "User settings not found!" });
    }
    res.status(200).json({ message: "User settings deleted successfully!" });
  } catch (error) {
    console.error("Error in delete_user_settings controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

