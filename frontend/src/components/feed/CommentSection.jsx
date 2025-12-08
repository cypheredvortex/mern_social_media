import { useState, useEffect, useContext } from "react";
import api from "../../lib/axios";
import { AuthContext } from "../../context/AuthContext";

const CommentSection = ({ postId }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const fetchComments = async () => {
    try {
      const res = await api.get("/comments");
      setComments(res.data.filter(c => c.post_id === postId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      await api.post("/comments", { post_id: postId, user_id: user._id, content: newComment });
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <div className="mt-2">
      {comments.map(c => (
        <p key={c._id} className="text-gray-700 mb-1">
          <span className="font-bold">{c.user_id.name}: </span>{c.content}
        </p>
      ))}
      <form onSubmit={handleComment} className="flex mt-2">
        <input
          type="text"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 p-2 border rounded mr-2"
          required
        />
        <button className="bg-blue-500 text-white p-2 rounded">Comment</button>
      </form>
    </div>
  );
};

export default CommentSection;
