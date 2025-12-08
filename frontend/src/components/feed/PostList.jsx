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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((skeleton) => (
            <div
              key={skeleton}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 h-40 rounded-lg"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
          No posts to display.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onUpdate={fetchPosts}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostList;