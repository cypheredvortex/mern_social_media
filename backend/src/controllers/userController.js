import User from "../models/User.js";
import bcrypt from "bcryptjs";

export async function list_user(req, res) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in list_user controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function get_user_by_id(req, res) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in get_user_by_id controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function create_user(req, res) {
  try {
    const { username, email, password, role, status } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      status,
    });

    const savedUser = await user.save();
    const userWithoutPassword = savedUser.toObject();
    delete userWithoutPassword.password;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Error in create_user controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function update_user(req, res) {
  try {
    const { username, email, password, role, status } = req.body;

    const updateData = { username, email, role, status };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in update_user controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function delete_user(req, res) {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    console.error("Error in delete_user controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}
