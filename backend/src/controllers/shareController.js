import Share from "../models/Share.js";

export async function list_share(req, res) {
  try {
    const shares = await Share.find()
      .populate("user_id", "username profile_picture")
      .populate("post_id", "content media_url")
      .sort({ createdAt: -1 });
    res.status(200).json(shares);
  } catch (error) {
    console.error("Error in list_share controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function get_share_by_id(req, res) {
  try {
    const share = await Share.findById(req.params.id)
      .populate("user_id", "username profile_picture")
      .populate("post_id", "content media_url");

    if (!share) {
      return res.status(404).json({ message: "Share not found!" });
    }
    res.status(200).json(share);
  } catch (error) {
    console.error("Error in get_share_by_id controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function create_share(req, res) {
  try {
    const { user_id, post_id } = req.body;

    const existingShare = await Share.findOne({ user_id, post_id });
    if (existingShare) {
      return res.status(400).json({ message: "Post already shared by this user!" });
    }

    const share = new Share({ user_id, post_id });
    const savedShare = await share.save();
    res.status(201).json(savedShare);
  } catch (error) {
    console.error("Error in create_share controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function update_share(req, res) {
  try {
    const { user_id, post_id } = req.body;
    const updatedShare = await Share.findByIdAndUpdate(
      req.params.id,
      { user_id, post_id },
      { new: true }
    );

    if (!updatedShare) {
      return res.status(404).json({ message: "Share not found!" });
    }
    res.status(200).json(updatedShare);
  } catch (error) {
    console.error("Error in update_share controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function delete_share(req, res) {
  try {
    const deletedShare = await Share.findByIdAndDelete(req.params.id);
    if (!deletedShare) {
      return res.status(404).json({ message: "Share not found!" });
    }
    res.status(200).json({ message: "Share deleted successfully!" });
  } catch (error) {
    console.error("Error in delete_share controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}
