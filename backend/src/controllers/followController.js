import Follow from "../models/Follow.js";

export async function list_follow(req, res) {
  try {
    const follows = await Follow.find()
      .populate("follower_id", "username profile_picture")
      .populate("followed_id", "username profile_picture")
      .sort({ createdAt: -1 });

    res.status(200).json(follows);
  } catch (error) {
    console.error("Error in list_follow controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function get_follow_by_id(req, res) {
  try {
    const follow = await Follow.findById(req.params.id)
      .populate("follower_id", "username profile_picture")
      .populate("followed_id", "username profile_picture");

    if (!follow) {
      return res.status(404).json({ message: "Follow relationship not found!" });
    }

    res.status(200).json(follow);
  } catch (error) {
    console.error("Error in get_follow_by_id controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function create_follow(req, res) {
  try {
    const { follower_id, followed_id } = req.body;

    if (follower_id === followed_id) {
      return res.status(400).json({ message: "You cannot follow yourself!" });
    }

    const existingFollow = await Follow.findOne({ follower_id, followed_id });
    if (existingFollow) {
      return res.status(400).json({ message: "Follow relationship already exists!" });
    }

    const follow = new Follow({ follower_id, followed_id });
    const savedFollow = await follow.save();

    res.status(201).json(savedFollow);
  } catch (error) {
    console.error("Error in create_follow controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function update_follow(req, res) {
  try {
    const { status } = req.body;

    if (!["pending", "accepted", "blocked"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value!" });
    }

    const updatedFollow = await Follow.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedFollow) {
      return res.status(404).json({ message: "Follow relationship not found!" });
    }

    res.status(200).json(updatedFollow);
  } catch (error) {
    console.error("Error in update_follow controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function delete_follow(req, res) {
  try {
    const deletedFollow = await Follow.findByIdAndDelete(req.params.id);

    if (!deletedFollow) {
      return res.status(404).json({ message: "Follow relationship not found!" });
    }

    res.status(200).json({ message: "Follow relationship deleted successfully!" });
  } catch (error) {
    console.error("Error in delete_follow controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}
