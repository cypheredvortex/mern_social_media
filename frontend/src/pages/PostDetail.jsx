import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../lib/axios";
import PostCard from "../components/feed/PostCard";
import CommentSection from "../components/feed/CommentSection";
import Navbar from "../components/common/NavBar";
import Sidebar from "../components/common/SideBar";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const res = await api.get(`/posts/${id}`);
      setPost(res.data);
    };
    fetchPost();
  }, [id]);

  if (!post) return <div>Loading...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4">
        <Navbar />
        <PostCard post={post} />
        <CommentSection postId={id} />
      </div>
    </div>
  );
};

export default PostDetail;
