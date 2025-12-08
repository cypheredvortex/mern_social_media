import React, { useState, useEffect } from "react";
import PostComposer from "../components/feed/PostComposer";
import PostList from "../components/feed/PostList";
import api from "../lib/axios";
import { Link } from "react-router-dom";

const Home = () => {
  const [refresh, setRefresh] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const triggerRefresh = () => setRefresh(!refresh);

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await api.get("/users/me");
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data);
      const unread = response.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}`, { read: true });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Search users and posts
  const handleSearch = async (query) => {
    try {
      if (query.trim()) {
        // Search users
        const userResponse = await api.get(`/users/search/${query}`);
        // Search posts
        const postResponse = await api.get(`/posts?search=${query}`);
        setSearchResults({
          users: userResponse.data,
          posts: postResponse.data
        });
        setShowSearch(true);
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  // Follow a user
  const handleFollow = async (userId) => {
    try {
      await api.post("/follows", {
        follower_id: user._id,
        followed_id: userId,
        status: "pending"
      });
      // Add activity log
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "followed_user",
        target_id: userId
      });
      // Send notification
      await api.post("/notifications", {
        user_id: userId,
        type: "follow",
        sender_id: user._id,
        target_id: user._id
      });
      triggerRefresh();
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  // Like a post
  const handleLike = async (postId) => {
    try {
      await api.post("/likes", {
        user_id: user._id,
        target_id: postId,
        target_type: "post"
      });
      
      // Update post like count
      const post = await api.get(`/posts/${postId}`);
      await api.put(`/posts/${postId}`, {
        like_count: post.data.like_count + 1
      });
      
      // Add activity log
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "liked_post",
        target_id: postId
      });
      
      // Send notification to post author if not self
      if (post.data.author_id !== user._id) {
        await api.post("/notifications", {
          user_id: post.data.author_id,
          type: "like",
          sender_id: user._id,
          target_id: postId
        });
      }
      
      triggerRefresh();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // Comment on a post
  const handleComment = async (postId, content) => {
    try {
      await api.post("/comments", {
        post_id: postId,
        author_id: user._id,
        content
      });
      
      // Update post comment count
      const post = await api.get(`/posts/${postId}`);
      await api.put(`/posts/${postId}`, {
        comment_count: post.data.comment_count + 1
      });
      
      // Add activity log
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "commented_post",
        target_id: postId
      });
      
      // Send notification to post author if not self
      if (post.data.author_id !== user._id) {
        await api.post("/notifications", {
          user_id: post.data.author_id,
          type: "comment",
          sender_id: user._id,
          target_id: postId
        });
      }
      
      triggerRefresh();
    } catch (error) {
      console.error("Error commenting on post:", error);
    }
  };

  // Share a post
  const handleShare = async (postId) => {
    try {
      await api.post("/shares", {
        user_id: user._id,
        post_id: postId
      });
      
      // Update post share count
      const post = await api.get(`/posts/${postId}`);
      await api.put(`/posts/${postId}`, {
        share_count: post.data.share_count + 1
      });
      
      // Add activity log
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "shared_post",
        target_id: postId
      });
      
      // Add to search history
      await api.post("/search-histories", {
        user_id: user._id,
        query: `shared post ${postId}`
      });
      
      triggerRefresh();
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  // Report content
  const handleReport = async (targetId, targetType, reason) => {
    try {
      await api.post("/reports", {
        reporter_id: user._id,
        target_id: targetId,
        target_type: targetType,
        reason,
        status: "pending"
      });
      alert("Report submitted successfully");
    } catch (error) {
      console.error("Error reporting content:", error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Search */}
            <div className="flex-1 flex items-center">
              <div className="relative w-96">
                <input
                  type="text"
                  placeholder="Search users and posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {showSearch && searchResults && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {searchResults.users.length > 0 && (
                      <div className="p-2">
                        <h3 className="font-medium text-gray-700 px-2 py-1">Users</h3>
                        {searchResults.users.map((resultUser) => (
                          <Link
                            key={resultUser._id}
                            to={`/profile/${resultUser._id}`}
                            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded"
                          >
                            {resultUser.profile_picture && (
                              <img
                                src={resultUser.profile_picture}
                                alt={resultUser.username}
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                            <div>
                              <p className="font-medium">{resultUser.username}</p>
                              <p className="text-sm text-gray-500">{resultUser.email}</p>
                            </div>
                            {resultUser._id !== user?._id && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleFollow(resultUser._id);
                                }}
                                className="ml-auto px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Follow
                              </button>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchResults.posts.length > 0 && (
                      <div className="p-2 border-t">
                        <h3 className="font-medium text-gray-700 px-2 py-1">Posts</h3>
                        {searchResults.posts.map((post) => (
                          <Link
                            key={post._id}
                            to={`/post/${post._id}`}
                            className="block p-2 hover:bg-gray-100 rounded"
                          >
                            <p className="truncate">{post.content.substring(0, 100)}...</p>
                            <p className="text-sm text-gray-500">
                              By {post.author_username} • {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Icons */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                Home
              </Link>
              
              <Link
                to={`/profile/${user?._id}`}
                className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                Profile
              </Link>
              
              <Link
                to="/settings"
                className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                Settings
              </Link>
              
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg relative"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b">
                      <h3 className="font-medium">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-gray-500 text-center">No notifications</p>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-3 border-b hover:bg-gray-50 ${!notification.read ? "bg-blue-50" : ""}`}
                            onClick={() => markAsRead(notification._id)}
                          >
                            <div className="flex items-start gap-3">
                              <div>
                                {notification.type === "like" && "❤️"}
                                {notification.type === "comment" && "💬"}
                                {notification.type === "follow" && "👤"}
                                {notification.type === "message" && "✉️"}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">
                                  {notification.type === "like" && "liked your post"}
                                  {notification.type === "comment" && "commented on your post"}
                                  {notification.type === "follow" && "started following you"}
                                  {notification.type === "message" && "sent you a message"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {user && (
                <Link
                  to={`/profile/${user._id}`}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
                >
                  {user.profile_picture && (
                    <img
                      src={user.profile_picture}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="font-medium">{user.username}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Post Composer */}
        <div className="mb-6">
          <PostComposer onPostCreated={triggerRefresh} />
        </div>

        {/* Post List */}
        <PostList
          refresh={refresh}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onReport={handleReport}
          currentUser={user}
        />
      </main>
    </div>
  );
};

export default Home;