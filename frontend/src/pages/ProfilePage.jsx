import { useParams } from "react-router-dom";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfilePosts from "../components/profile/ProfilePosts";

const ProfilePage = () => {
  const { id } = useParams();

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <ProfileHeader userId={id} />
      <ProfilePosts userId={id} />
    </div>
  );
};

export default ProfilePage;