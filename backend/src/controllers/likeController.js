import Like from "../models/Like.js";

export async function list_like(req, res) {
  try {
    const likes = await Like.find().sort({ createdAt: -1 }).populate("user_id", "username profile_picture");
    res.status(200).json(likes);
  } catch (error) {
    console.error("Error in list_like controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function get_like_by_id(req, res) {
  try {
    const like = await Like.findById(req.params.id).populate("user_id", "username profile_picture");
    if (!like) {
      return res.status(404).json({ message: "Like not found!" });
    }
    res.status(200).json(like);
  } catch (error) {
    console.error("Error in get_like_by_id controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function create_like(req, res) {
  try {
    const { user_id, target_id, target_type } = req.body;

    const existingLike = await Like.findOne({ user_id, target_id, target_type });
    if (existingLike) {
      return res.status(400).json({ message: "User has already liked this item!" });
    }

    const like = new Like({ user_id, target_id, target_type });
    const savedLike = await like.save();
    res.status(201).json(savedLike);
  } catch (error) {
    console.error("Error in create_like controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function update_like(req, res) {
  try {
    const { target_id, target_type } = req.body;

    const updatedLike = await Like.findByIdAndUpdate(
      req.params.id,
      { target_id, target_type },
      { new: true }
    );

    if (!updatedLike) {
      return res.status(404).json({ message: "Like not found!" });
    }

    res.status(200).json(updatedLike);
  } catch (error) {
    console.error("Error in update_like controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function delete_like(req, res) {
  try {
    const deletedLike = await Like.findByIdAndDelete(req.params.id);
    if (!deletedLike) {
      return res.status(404).json({ message: "Like not found!" });
    }
    res.status(200).json({ message: "Like deleted successfully!" });
  } catch (error) {
    console.error("Error in delete_like controller:", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}
