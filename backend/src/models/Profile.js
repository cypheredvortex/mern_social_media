import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one profile per user
    },
    bio: {
      type: String,
      maxlength: 300, // optional limit
    },
    profile_picture: {
      type: String,
      default: "", // default empty string or placeholder URL
    },
    cover_photo: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    birthdate: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    interests: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, 
  }
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
