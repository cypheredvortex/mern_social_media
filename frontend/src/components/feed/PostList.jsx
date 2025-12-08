import { useEffect, useState } from "react";
import api from "../../lib/axios";
import PostCard from "./PostCard";

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading posts...</p>
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} onUpdate={fetchPosts} />)
      )}
    </div>
  );
};

export default PostList;
