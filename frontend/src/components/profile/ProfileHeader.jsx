import { useState, useEffect } from "react";
import api from "../../lib/axios";
import FollowButton from "./FollowButton";

const ProfileHeader = ({ userId }) => {
  const [profile, setProfile] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/profiles/${userId}`);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="bg-white shadow rounded p-4 mb-4 flex items-center justify-between">
      <div>
        <p className="text-xl font-bold">{profile.name}</p>
        <p className="text-gray-600">{profile.bio}</p>
      </div>
      <FollowButton profileId={userId} />
    </div>
  );
};

export default ProfileHeader;