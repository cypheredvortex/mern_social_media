import React, { useState } from "react";
import api from "../../lib/axios";

const PostComposer = ({ onPostCreated, currentUser }) => {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const [showMediaInput, setShowMediaInput] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl.trim()) {
      alert("Please add some content or media");
      return;
    }

    setLoading(true);
    try {
      await api.post("/posts", {
        author_id: currentUser._id,
        content: content.trim(),
        media_url: mediaUrl.trim() || null,
        visibility,
        like_count: 0,
        comment_count: 0,
        share_count: 0
      });

      // Log activity
      await api.post("/activity-logs", {
        user_id: currentUser._id,
        action: "created_post"
      });

      // Reset form
      setContent("");
      setMediaUrl("");
      setVisibility("public");
      setShowMediaInput(false);

      // Trigger refresh
      onPostCreated();
      
      alert("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // In a real app, you would upload to a server like Cloudinary
    // For now, we'll just create a local URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start gap-3 mb-4">
        {currentUser?.profile?.profile_picture ? (
          <img
            src={currentUser.profile.profile_picture}
            alt={currentUser.username}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {currentUser?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          />
        </div>
      </div>

      {showMediaInput && (
        <div className="mb-4">
          <input
            type="text"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="Paste image URL or upload"
            className="w-full p-2 border rounded-lg mb-2"
          />
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
            >
              Upload Image
            </label>
            <button
              onClick={() => setShowMediaInput(false)}
              className="px-3 py-1 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {mediaUrl && (
        <div className="mb-4">
          <img
            src={mediaUrl}
            alt="Preview"
            className="max-w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={() => setMediaUrl("")}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Remove image
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowMediaInput(!showMediaInput)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Photo/Video</span>
          </button>
          
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="border rounded-lg px-2 py-1 text-sm"
          >
            <option value="public">🌍 Public</option>
            <option value="friends">👥 Friends</option>
            <option value="private">🔒 Private</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || (!content.trim() && !mediaUrl.trim())}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default PostComposer;