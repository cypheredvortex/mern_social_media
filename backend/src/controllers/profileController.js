import Profile from "../models/Profile.js";

export async function list_profile(req, res) {
  try {
    const profiles = await Profile.find()
      .populate("user_id", "username email") 
      .sort({ createdAt: -1 });
    res.status(200).json(profiles);
  } catch (error) {
    console.error("Error in list_profile controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function get_profile_by_id(req, res) {
  try {
    const profile = await Profile.findById(req.params.id).populate(
      "user_id",
      "username email"
    );
    if (!profile) {
      return res.status(404).json({ message: "Profile not found!" });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error in get_profile_by_id controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function create_profile(req, res) {
  try {
    const {
      user_id,
      bio,
      profile_picture,
      cover_photo,
      location,
      website,
      birthdate,
      gender,
      interests,
    } = req.body;

    const existingProfile = await Profile.findOne({ user_id });
    if (existingProfile) {
      return res
        .status(400)
        .json({ message: "Profile for this user already exists!" });
    }

    const profile = new Profile({
      user_id,
      bio,
      profile_picture,
      cover_photo,
      location,
      website,
      birthdate,
      gender,
      interests,
    });

    const savedProfile = await profile.save();
    res.status(201).json(savedProfile);
  } catch (error) {
    console.error("Error in create_profile controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function update_profile(req, res) {
  try {
    const {
      bio,
      profile_picture,
      cover_photo,
      location,
      website,
      birthdate,
      gender,
      interests,
    } = req.body;

    const updatedProfile = await Profile.findByIdAndUpdate(
      req.params.id,
      {
        bio,
        profile_picture,
        cover_photo,
        location,
        website,
        birthdate,
        gender,
        interests,
      },
      { new: true } 
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found!" });
    }

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Error in update_profile controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function delete_profile(req, res) {
  try {
    const deletedProfile = await Profile.findByIdAndDelete(req.params.id);
    if (!deletedProfile) {
      return res.status(404).json({ message: "Profile not found!" });
    }
    res.status(200).json({ message: "Profile deleted successfully!" });
  } catch (error) {
    console.error("Error in delete_profile controller", error);
    res.status(500).json({ message: "Internal server error!" });
  }
}
