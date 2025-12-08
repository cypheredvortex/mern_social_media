import { useState, useEffect, useContext } from "react";
import api from "../../lib/axios";
import { AuthContext } from "../../context/AuthContext";

const FollowButton = ({ profileId }) => {
  const { user } = useContext(AuthContext);
  const [isFollowing, setIsFollowing] = useState(false);

  const checkFollow = async () => {
    try {
      const res = await api.get("/follows");
      setIsFollowing(res.data.some(f => f.follower_id === user._id && f.following_id === profileId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        const follows = await api.get("/follows");
        const follow = follows.data.find(f => f.follower_id === user._id && f.following_id === profileId);
        await api.delete(`/follows/${follow._id}`);
      } else {
        await api.post("/follows", { follower_id: user._id, following_id: profileId });
      }
      checkFollow();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkFollow();
  }, [profileId]);

  return (
    <button
      onClick={handleFollow}
      className={`px-4 py-2 rounded ${isFollowing ? "bg-gray-300 text-black" : "bg-blue-500 text-white"}`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;
