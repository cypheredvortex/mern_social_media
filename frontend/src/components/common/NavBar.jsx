import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Navbar = ({ 
  user, 
  unreadNotifications, 
  notifications,
  onSearch,
  onLogout,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead 
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setSearchQuery("");
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="text-2xl font-bold text-blue-600">
            SocialApp
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users, posts, or content..."
                className="w-full px-4 py-2 pl-10 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button type="submit" className="absolute left-3 top-2.5 text-gray-400">
                🔍
              </button>
            </form>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-4">
            {/* Home */}
            <Link to="/home" className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>

            {/* Explore */}
            <Link to="/explore" className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </Link>

            {/* Messages */}
            <Link to="/messages" className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg relative"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b flex justify-between items-center">
                    <h3 className="font-medium">Notifications</h3>
                    {unreadNotifications > 0 && (
                      <button
                        onClick={onMarkAllNotificationsAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-gray-500 text-center">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => onMarkNotificationAsRead(notification._id)}
                          className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-start gap-2">
                            <div>
                              {notification.type === "like" && "❤️"}
                              {notification.type === "comment" && "💬"}
                              {notification.type === "follow" && "👤"}
                              {notification.type === "message" && "✉️"}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">
                                {notification.sender?.username || 'Someone'} 
                                {notification.type === "like" && " liked your post"}
                                {notification.type === "comment" && " commented on your post"}
                                {notification.type === "follow" && " started following you"}
                                {notification.type === "message" && " sent you a message"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <Link to={`/profile/${user?._id}`} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
                {user?.profile?.profile_picture ? (
                  <img
                    src={user.profile.profile_picture}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;