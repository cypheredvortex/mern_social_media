import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// Import models
import ActivityLog from "../src/models/ActivityLog.js";
import Comment from "../src/models/Comment.js";
import Follow from "../src/models/Follow.js";
import Like from "../src/models/Like.js";
import Media from "../src/models/Media.js";
import Message from "../src/models/Message.js";
import Notification from "../src/models/Notification.js";
import Post from "../src/models/Post.js";
import Profile from "../src/models/Profile.js";
import Report from "../src/models/Report.js";
import SearchHistory from "../src/models/SearchHistory.js";
import Share from "../src/models/Share.js";
import User from "../src/models/User.js";
import UserSettings from "../src/models/UserSettings.js";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/social_media_db";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected!");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  const models = [ActivityLog, Comment, Follow, Like, Media, Message, Notification, Post, Profile, Report, SearchHistory, Share, User, UserSettings];
  for (const model of models) await model.deleteMany({});
  console.log("Database cleared!");
};

const seedDatabase = async () => {
  // Users
  const password = await bcrypt.hash("password123", 10);
  const users = await User.insertMany([
    { username: "alice", email: "alice@example.com", password },
    { username: "bob", email: "bob@example.com", password },
    { username: "charlie", email: "charlie@example.com", password },
  ]);

  // Profiles
  const profiles = [];
  for (const user of users) {
    const profile = await Profile.create({
      user_id: user._id,
      bio: `Hi, I am ${user.username}`,
      profile_picture: "",
      cover_photo: "",
      location: "Earth",
      website: "",
      birthdate: new Date(1990, 0, 1),
      gender: "other",
      interests: ["coding", "music"],
    });
    user.profile_id = profile._id;
    await user.save();
    profiles.push(profile);
  }

  // UserSettings
  for (const user of users) {
    await UserSettings.create({
      user_id: user._id,
      dark_mode: false,
      language: "en",
      notifications_enabled: true,
      privacy_visibility: "public",
    });
  }

  // Follows
  await Follow.insertMany([
    { follower_id: users[0]._id, followed_id: users[1]._id, status: "accepted" },
    { follower_id: users[1]._id, followed_id: users[2]._id, status: "accepted" },
    { follower_id: users[2]._id, followed_id: users[0]._id, status: "pending" },
  ]);

  // Posts
  const posts = await Post.insertMany([
    { author_id: users[0]._id, content: "Hello world!", visibility: "public" },
    { author_id: users[1]._id, content: "This is my first post", visibility: "friends" },
    { author_id: users[2]._id, content: "Excited to join!", visibility: "public" },
  ]);

  // Comments
  const comments = await Comment.insertMany([
    { post_id: posts[0]._id, author_id: users[1]._id, content: "Nice post!" },
    { post_id: posts[0]._id, author_id: users[2]._id, content: "Welcome!", parent_comment_id: null },
    { post_id: posts[1]._id, author_id: users[0]._id, content: "Congrats!" },
  ]);

  // Likes
  await Like.insertMany([
    { user_id: users[1]._id, target_id: posts[0]._id, target_type: "post" },
    { user_id: users[2]._id, target_id: comments[0]._id, target_type: "comment" },
    { user_id: users[0]._id, target_id: posts[1]._id, target_type: "post" },
  ]);

  // Shares
  await Share.insertMany([
    { user_id: users[1]._id, post_id: posts[0]._id },
    { user_id: users[2]._id, post_id: posts[1]._id },
  ]);

  // Messages
  await Message.insertMany([
    { sender_id: users[0]._id, receiver_id: users[1]._id, content: "Hi Bob!" },
    { sender_id: users[1]._id, receiver_id: users[0]._id, content: "Hello Alice!" },
    { sender_id: users[2]._id, receiver_id: users[0]._id, content: "Hey Alice, how are you?" },
  ]);

  // Notifications
  await Notification.insertMany([
    { user_id: users[1]._id, type: "follow", sender_id: users[0]._id },
    { user_id: users[0]._id, type: "like", sender_id: users[1]._id, target_id: posts[0]._id },
  ]);

  // Media
  await Media.insertMany([
    { uploader_id: users[0]._id, url: "https://picsum.photos/200", type: "image", size: 20000, post_id: posts[0]._id },
    { uploader_id: users[1]._id, url: "https://picsum.photos/300", type: "image", size: 30000, post_id: posts[1]._id },
  ]);

  // SearchHistory
  await SearchHistory.insertMany([
    { user_id: users[0]._id, query: "React tutorials" },
    { user_id: users[1]._id, query: "Node.js examples" },
  ]);

  // ActivityLogs
  await ActivityLog.insertMany([
    { user_id: users[0]._id, action: "created_post", target_id: posts[0]._id },
    { user_id: users[1]._id, action: "liked_post", target_id: posts[0]._id },
    { user_id: users[2]._id, action: "followed_user", target_id: users[0]._id },
  ]);

  // Reports
  await Report.insertMany([
    { reporter_id: users[1]._id, target_id: posts[2]._id, target_type: "post", reason: "Spam" },
    { reporter_id: users[2]._id, target_id: users[1]._id, target_type: "user", reason: "Inappropriate content" },
  ]);

  console.log("Database seeding completed!");
};

const main = async () => {
  await connectDB();
  await clearDatabase();
  await seedDatabase();
  mongoose.disconnect();
};

main().catch(err => console.error(err));
