import React from "react";
import { Link } from "react-router-dom";

const TrendsSidebar = ({ trendingPosts, suggestedUsers, onFollowUser, onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* Trending Posts */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold text-lg mb-4">Trending Now</h3>
        <div className="space-y-3">
          {trendingPosts.map((post, index) => (
            <div key={post._id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => onNavigate(`/post/${post._id}`)}>
              <p className="text-sm text-gray-500">Trending #{index + 1}</p>
              <p className="font-medium text-sm mt-1 line-clamp-2">{post.content}</p>
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <span className="mr-3">❤️ {post.like_count}</span>
                <span>💬 {post.comment_count}</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => onNavigate("/explore")} className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm">
          Show more
        </button>
      </div>

      {/* Who to Follow */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold text-lg mb-4">Who to Follow</h3>
        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user._id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.profile?.profile_picture ? (
                  <img
                    src={user.profile.profile_picture}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => onFollowUser(user._id)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                Follow
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => onNavigate("/explore")} className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm">
          Show more
        </button>
      </div>

      {/* Footer Links */}
      <div className="text-xs text-gray-500 space-y-2">
        <div className="flex flex-wrap gap-2">
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Cookie Policy</a>
          <a href="#" className="hover:underline">Accessibility</a>
        </div>
        <p>© {new Date().getFullYear()} SocialApp, Inc.</p>
      </div>
    </div>
  );
};

export default TrendsSidebar;