import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-500">SocialApp</Link>
      <div className="flex items-center space-x-4">
        <Link to="/explore" className="hover:text-blue-500">Explore</Link>
        <Link to="/notifications" className="hover:text-blue-500">Notifications</Link>
        {user ? (
          <>
            <Link to={`/profile/${user._id}`} className="hover:text-blue-500">{user.name}</Link>
            <button onClick={logout} className="text-red-500">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-500">Login</Link>
            <Link to="/register" className="hover:text-blue-500">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;