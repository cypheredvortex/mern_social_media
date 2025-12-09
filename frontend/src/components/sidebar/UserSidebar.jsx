import React from "react";
import { Link } from "react-router-dom";

const UserSidebar = ({ user, userStats, suggestedUsers, onFollowUser }) => {
  return (
    <div className="space-y-6">
      {/* User Card */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-2xl font-medium">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-lg">{user?.username}</h3>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>
        
        {/* User Stats */}
        <div className="grid grid-cols-3 gap-2 text-center mb-4">
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
        
        <Link
          to={`/profile/${user?._id}`}
          className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          View Profile
        </Link>
      </div>

      {/* Suggested Users */}
      {suggestedUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Who to follow</h3>
          <div className="space-y-3">
            {suggestedUsers.map((suggestedUser) => (
              <div key={suggestedUser._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">
                      {suggestedUser.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{suggestedUser.username}</p>
                    <p className="text-xs text-gray-500">{suggestedUser.postCount} posts</p>
                  </div>
                </div>
                <button
                  onClick={() => onFollowUser(suggestedUser._id, false)}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
          <Link
            to="/explore"
            className="block text-center text-blue-600 hover:text-blue-800 text-sm mt-3"
          >
            See more suggestions →
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserSidebar;