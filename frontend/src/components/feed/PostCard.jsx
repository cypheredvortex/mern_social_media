import { useState, useEffect, useContext } from "react";
import api from "../../lib/axios";
import CommentSection from "./CommentSection";
import { AuthContext } from "../../context/AuthContext";

const PostCard = ({ post, onUpdate }) => {
  const { user } = useContext(AuthContext);
  const [likes, setLikes] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      await api.post("/likes", { user_id: user._id, post_id: post._id });
      setLikes(likes + 1);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <p className="font-bold">{post.author_id.name}</p>
      <p className="my-2">{post.content}</p>
      {post.media_url && (
        <img src={post.media_url} alt="media" className="rounded max-h-96 w-full object-cover" />
      )}
      <div className="flex justify-between mt-2">
        <button onClick={handleLike} className="text-blue-500">
          👍 {likes}
        </button>
        <button onClick={() => setShowComments(!showComments)} className="text-gray-500">
          💬 {post.comment_count}
        </button>
      </div>
      {showComments && <CommentSection postId={post._id} />}
    </div>
  );
};

export default PostCard;