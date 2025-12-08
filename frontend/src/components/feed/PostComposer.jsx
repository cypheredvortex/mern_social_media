import { useState, useContext } from "react";
import api from "../../lib/axios";
import { AuthContext } from "../../context/AuthContext";

const PostComposer = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/posts", { author_id: user._id, content, media_url: media });
      setContent("");
      setMedia("");
      if (onPostCreated) onPostCreated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-2 border rounded mb-2"
        required
      />
      <input
        type="text"
        placeholder="Media URL (optional)"
        value={media}
        onChange={(e) => setMedia(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full">
        Post
      </button>
    </form>
  );
};

export default PostComposer;