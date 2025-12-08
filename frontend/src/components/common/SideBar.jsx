import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen p-4 bg-gray-100 hidden md:block">
      <ul className="space-y-3">
        <li>
          <Link to="/" className="hover:text-blue-500">Home</Link>
        </li>
        <li>
          <Link to="/explore" className="hover:text-blue-500">Explore</Link>
        </li>
        <li>
          <Link to="/messages" className="hover:text-blue-500">Messages</Link>
        </li>
        <li>
          <Link to="/notifications" className="hover:text-blue-500">Notifications</Link>
        </li>
        <li>
          <Link to="/settings" className="hover:text-blue-500">Settings</Link>
        </li>
        <li>
          <Link to="/admin" className="hover:text-blue-500">Admin Panel</Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
