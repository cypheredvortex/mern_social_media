import { useState, useEffect } from "react";
import api from "../../lib/axios";
import PostCard from "../feed/PostCard";

const ProfilePosts = ({ userId }) => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data.filter(p => p.author_id._id === userId));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  return (
    <div>
      {posts.map(post => <PostCard key={post._id} post={post} onUpdate={fetchPosts} />)}
    </div>
  );
};

export default ProfilePosts;
