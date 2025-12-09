import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ user, userStats, followRequests, onShowFollowRequests, onNavigate, onLogout }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 sticky top-6">
      {/* User Info */}
      <div className="mb-6">
        <Link to={`/profile/${user?._id}`} className="flex items-center gap-3 mb-4">
          {user?.profile?.profile_picture ? (
            <img
              src={user.profile.profile_picture}
              alt={user.username}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-2xl font-medium">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg">{user?.username}</h3>
            <p className="text-gray-600 text-sm">{user?.email}</p>
          </div>
        </Link>

        {/* User Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="font-bold">{userStats.posts}</p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
          <div>
            <p className="font-bold">{userStats.followers}</p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
          <div>
            <p className="font-bold">{userStats.following}</p>
            <p className="text-xs text-gray-500">Following</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="space-y-2 mb-6">
        <Link
          to="/home"
          className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Home</span>
        </Link>

        <Link
          to={`/profile/${user?._id}`}
          className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Profile</span>
        </Link>

        <Link
          to="/explore"
          className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <span>Explore</span>
        </Link>

        <Link
          to="/messages"
          className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Messages</span>
        </Link>

        <Link
          to="/notifications"
          className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span>Notifications</span>
          {followRequests.length > 0 && (
            <span className="ml-auto bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {followRequests.length}
            </span>
          )}
        </Link>

        <Link
          to="/settings"
          className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
        </Link>
      </div>

      {/* Follow Requests */}
      {followRequests.length > 0 && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-blue-800">Follow Requests</p>
            <button
              onClick={onShowFollowRequests}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              See all
            </button>
          </div>
          <p className="text-sm text-blue-600">{followRequests.length} pending request(s)</p>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;