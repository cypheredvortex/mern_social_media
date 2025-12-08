import React, { useState, useEffect } from "react";
import PostComposer from "../components/feed/PostComposer";
import PostList from "../components/feed/PostList";
import api from "../lib/axios";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const [refresh, setRefresh] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");
  const navigate = useNavigate();

  // Feed States
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [feedType, setFeedType] = useState("all"); // "all", "following", "trending"
  const [postSort, setPostSort] = useState("latest"); // "latest", "popular", "following"

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchType, setSearchType] = useState("all"); // "all", "users", "posts"

  // Messages States
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [messageUsers, setMessageUsers] = useState([]);

  // Notifications States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState({ id: null, type: null });
  const [reportReason, setReportReason] = useState("");
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");

  // User Stats
  const [userStats, setUserStats] = useState({
    followers: 0,
    following: 0,
    posts: 0
  });

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await api.get("/users/me");
        const userData = response.data;
        setUser(userData);

        // Fetch user profile
        const profileRes = await api.get(`/profiles?user_id=${userData._id}`);
        const profile = profileRes.data[0] || {};
        
        // Fetch user settings
        const settingsRes = await api.get(`/user-settings?user_id=${userData._id}`);
        const settings = settingsRes.data[0] || {};

        setUser({
          ...userData,
          profile,
          settings
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts");
      const postsData = response.data;

      // Fetch author info for each post
      const postsWithAuthors = await Promise.all(
        postsData.map(async (post) => {
          try {
            const authorRes = await api.get(`/users/${post.author_id}`);
            const profileRes = await api.get(`/profiles?user_id=${post.author_id}`);
            return {
              ...post,
              author: authorRes.data,
              authorProfile: profileRes.data[0] || {}
            };
          } catch (error) {
            return post;
          }
        })
      );

      setPosts(postsWithAuthors);
      applyFilters(postsWithAuthors);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user stats
  const fetchUserStats = async () => {
    if (!user) return;
    try {
      const [followersRes, followingRes, postsRes] = await Promise.all([
        api.get(`/follows?followed_id=${user._id}&status=accepted`),
        api.get(`/follows?follower_id=${user._id}&status=accepted`),
        api.get(`/posts?author_id=${user._id}`)
      ]);

      setUserStats({
        followers: followersRes.data.length,
        following: followingRes.data.length,
        posts: postsRes.data.length
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await api.get(`/notifications?user_id=${user._id}`);
      const notificationsData = response.data;
      
      // Fetch sender info for each notification
      const notificationsWithSenders = await Promise.all(
        notificationsData.map(async (notification) => {
          if (notification.sender_id) {
            try {
              const senderRes = await api.get(`/users/${notification.sender_id}`);
              const profileRes = await api.get(`/profiles?user_id=${notification.sender_id}`);
              return {
                ...notification,
                sender: senderRes.data,
                senderProfile: profileRes.data[0] || {}
              };
            } catch (error) {
              return notification;
            }
          }
          return notification;
        })
      );

      setNotifications(notificationsWithSenders);
      const unread = notificationsWithSenders.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}`, { read: true });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(notification => 
          api.put(`/notifications/${notification._id}`, { read: true })
        )
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Fetch search history
  const fetchSearchHistory = async () => {
    if (!user) return;
    try {
      const response = await api.get(`/search-histories?user_id=${user._id}`);
      setSearchHistory(response.data.slice(0, 10)); // Last 10 searches
    } catch (error) {
      console.error("Error fetching search history:", error);
    }
  };

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user) return;
    try {
      // Fetch sent messages
      const sentRes = await api.get(`/messages?sender_id=${user._id}`);
      // Fetch received messages
      const receivedRes = await api.get(`/messages?receiver_id=${user._id}`);
      
      const allMessages = [...sentRes.data, ...receivedRes.data];
      
      // Group by conversation partner
      const conversationsMap = new Map();
      
      allMessages.forEach(message => {
        const partnerId = message.sender_id === user._id ? message.receiver_id : message.sender_id;
        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, {
            partnerId,
            lastMessage: message,
            unread: false,
            messageCount: 0
          });
        }
        const conv = conversationsMap.get(partnerId);
        conv.messageCount++;
        if (message.createdAt > conv.lastMessage.createdAt) {
          conv.lastMessage = message;
        }
        if (!message.read && message.receiver_id === user._id) {
          conv.unread = true;
        }
      });

      // Fetch partner info for each conversation
      const conversationsArray = Array.from(conversationsMap.values());
      const conversationsWithPartners = await Promise.all(
        conversationsArray.map(async (conv) => {
          try {
            const partnerRes = await api.get(`/users/${conv.partnerId}`);
            const profileRes = await api.get(`/profiles?user_id=${conv.partnerId}`);
            return {
              ...conv,
              partner: partnerRes.data,
              partnerProfile: profileRes.data[0] || {}
            };
          } catch (error) {
            return conv;
          }
        })
      );

      setConversations(conversationsWithPartners.sort((a, b) => 
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      ));
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (partnerId) => {
    try {
      const response = await api.get(`/messages?sender_id=${user._id}&receiver_id=${partnerId}`);
      const messagesData = response.data;
      
      // Mark received messages as read
      const unreadMessages = messagesData.filter(m => 
        m.receiver_id === user._id && !m.read
      );
      
      await Promise.all(
        unreadMessages.map(msg => 
          api.put(`/messages/${msg._id}`, { status: "seen", read: true })
        )
      );

      setMessages(messagesData.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      ));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Search functionality
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      // Save to search history
      if (user) {
        await api.post("/search-histories", {
          user_id: user._id,
          query
        });
        fetchSearchHistory();
      }

      let users = [];
      let posts = [];

      if (searchType === "all" || searchType === "users") {
        const userRes = await api.get("/users");
        users = userRes.data.filter(u =>
          u.username.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase())
        );
      }

      if (searchType === "all" || searchType === "posts") {
        const postRes = await api.get("/posts");
        posts = postRes.data.filter(p =>
          p.content.toLowerCase().includes(query.toLowerCase())
        );
      }

      setSearchResults({ users, posts });
      setShowSearch(true);
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  // Follow/Unfollow user
  const handleFollow = async (userId, action = "follow") => {
    try {
      if (action === "follow") {
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
          target_id: user._id,
          read: false
        });

        alert("Follow request sent!");
      } else {
        // Unfollow - delete follow record
        const followsRes = await api.get(`/follows?follower_id=${user._id}&followed_id=${userId}`);
        if (followsRes.data.length > 0) {
          await api.delete(`/follows/${followsRes.data[0]._id}`);
        }
        
        await api.post("/activity-logs", {
          user_id: user._id,
          action: "unfollowed_user",
          target_id: userId
        });
      }

      fetchUserStats();
      triggerRefresh();
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
    }
  };

  // Like/Unlike content
  const handleLike = async (targetId, targetType = "post") => {
    try {
      // Check if already liked
      const likesRes = await api.get(`/likes?user_id=${user._id}&target_id=${targetId}&target_type=${targetType}`);
      
      if (likesRes.data.length > 0) {
        // Unlike
        await api.delete(`/likes/${likesRes.data[0]._id}`);
        
        // Decrease like count
        if (targetType === "post") {
          const post = await api.get(`/posts/${targetId}`);
          await api.put(`/posts/${targetId}`, {
            like_count: Math.max(0, post.data.like_count - 1)
          });
        }
      } else {
        // Like
        await api.post("/likes", {
          user_id: user._id,
          target_id: targetId,
          target_type: targetType
        });

        // Increase like count
        if (targetType === "post") {
          const post = await api.get(`/posts/${targetId}`);
          await api.put(`/posts/${targetId}`, {
            like_count: post.data.like_count + 1
          });

          // Send notification if not own post
          if (post.data.author_id !== user._id) {
            await api.post("/notifications", {
              user_id: post.data.author_id,
              type: "like",
              sender_id: user._id,
              target_id: targetId,
              read: false
            });
          }
        }
      }

      // Log activity
      await api.post("/activity-logs", {
        user_id: user._id,
        action: targetType === "post" ? "liked_post" : "other",
        target_id: targetId
      });

      fetchPosts();
      fetchNotifications();
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  // Comment on post
  const handleComment = async (postId, content, parentCommentId = null) => {
    try {
      await api.post("/comments", {
        post_id: postId,
        author_id: user._id,
        content,
        parent_comment_id: parentCommentId
      });

      // Update post comment count
      const post = await api.get(`/posts/${postId}`);
      await api.put(`/posts/${postId}`, {
        comment_count: post.data.comment_count + 1
      });

      // Log activity
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "commented_post",
        target_id: postId
      });

      // Send notification if not own post
      if (post.data.author_id !== user._id) {
        await api.post("/notifications", {
          user_id: post.data.author_id,
          type: "comment",
          sender_id: user._id,
          target_id: postId,
          read: false
        });
      }

      fetchPosts();
      fetchNotifications();
    } catch (error) {
      console.error("Error commenting on post:", error);
    }
  };

  // Share post
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

      // Log activity
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "shared_post",
        target_id: postId
      });

      // Add to search history
      await api.post("/search-histories", {
        user_id: user._id,
        query: `shared post`
      });

      fetchPosts();
      fetchSearchHistory();
      alert("Post shared successfully!");
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  // Report content
  const handleReportSubmit = async () => {
    if (!reportReason.trim()) {
      alert("Please provide a reason for reporting");
      return;
    }

    try {
      await api.post("/reports", {
        reporter_id: user._id,
        target_id: reportTarget.id,
        target_type: reportTarget.type,
        reason: reportReason,
        status: "pending"
      });

      // Log activity
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "other",
        target_id: reportTarget.id
      });

      alert("Report submitted successfully. Our team will review it.");
      setShowReportModal(false);
      setReportReason("");
      setReportTarget({ id: null, type: null });
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report");
    }
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        // Delete related comments first
        const commentsRes = await api.get(`/comments?post_id=${postId}`);
        await Promise.all(
          commentsRes.data.map(comment => 
            api.delete(`/comments/${comment._id}`)
          )
        );

        // Delete post
        await api.delete(`/posts/${postId}`);

        // Log activity
        await api.post("/activity-logs", {
          user_id: user._id,
          action: "deleted_post",
          target_id: postId
        });

        fetchPosts();
        alert("Post deleted successfully");
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post");
      }
    }
  };

  // Edit post
  const handleEditPost = async () => {
    if (!editContent.trim()) {
      alert("Post content cannot be empty");
      return;
    }

    try {
      await api.put(`/posts/${editingPost._id}`, {
        content: editContent
      });

      // Log activity
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "updated_post",
        target_id: editingPost._id
      });

      fetchPosts();
      setShowEditPostModal(false);
      setEditingPost(null);
      setEditContent("");
      alert("Post updated successfully");
    } catch (error) {
      console.error("Error editing post:", error);
      alert("Failed to update post");
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      await api.post("/messages", {
        sender_id: user._id,
        receiver_id: activeConversation.partnerId,
        content: newMessage,
        status: "sent"
      });

      setNewMessage("");
      fetchMessages(activeConversation.partnerId);
      fetchConversations();

      // Send notification
      await api.post("/notifications", {
        user_id: activeConversation.partnerId,
        type: "message",
        sender_id: user._id,
        target_id: user._id,
        read: false
      });

      fetchNotifications();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Start new conversation
  const handleStartConversation = async (partnerId) => {
    try {
      const partnerRes = await api.get(`/users/${partnerId}`);
      const profileRes = await api.get(`/profiles?user_id=${partnerId}`);
      
      setActiveConversation({
        partnerId,
        partner: partnerRes.data,
        partnerProfile: profileRes.data[0] || {}
      });
      
      fetchMessages(partnerId);
      setActiveTab("messages");
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  // Clear search history
  const handleClearSearchHistory = async () => {
    if (window.confirm("Clear all search history?")) {
      try {
        const historyRes = await api.get(`/search-histories?user_id=${user._id}`);
        await Promise.all(
          historyRes.data.map(history => 
            api.delete(`/search-histories/${history._id}`)
          )
        );
        setSearchHistory([]);
      } catch (error) {
        console.error("Error clearing search history:", error);
      }
    }
  };

  // Apply filters to posts
  const applyFilters = (postsList) => {
    let filtered = [...postsList];

    // Filter by feed type
    if (feedType === "following" && user) {
      // This would require fetching who the user follows
      // For now, show all posts
    } else if (feedType === "trending") {
      filtered.sort((a, b) => b.like_count - a.like_count);
    }

    // Sort posts
    if (postSort === "latest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (postSort === "popular") {
      filtered.sort((a, b) => 
        (b.like_count + b.comment_count * 2 + b.share_count * 3) - 
        (a.like_count + a.comment_count * 2 + a.share_count * 3)
      );
    }

    setFilteredPosts(filtered);
  };

  const triggerRefresh = () => {
    setRefresh(!refresh);
    fetchPosts();
    fetchUserStats();
    fetchNotifications();
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchUserStats();
      fetchNotifications();
      fetchSearchHistory();
      fetchConversations();
    }
  }, [user, refresh]);

  useEffect(() => {
    applyFilters(posts);
  }, [posts, feedType, postSort]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchType]);

  const renderFeedTab = () => (
    <div className="space-y-6">
      {/* Feed Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFeedType("all")}
              className={`px-4 py-2 rounded-full ${feedType === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              For You
            </button>
            <button
              onClick={() => setFeedType("following")}
              className={`px-4 py-2 rounded-full ${feedType === "following" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Following
            </button>
            <button
              onClick={() => setFeedType("trending")}
              className={`px-4 py-2 rounded-full ${feedType === "trending" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Trending
            </button>
          </div>
          <select
            value={postSort}
            onChange={(e) => setPostSort(e.target.value)}
            className="border rounded-full px-4 py-2 bg-gray-50"
          >
            <option value="latest">Latest</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Post Composer */}
      <div className="bg-white rounded-lg shadow p-4">
        <PostComposer onPostCreated={triggerRefresh} currentUser={user} />
      </div>

      {/* Post List */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      ) : filteredPosts.length > 0 ? (
        <PostList
          posts={filteredPosts}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onReport={(id, type) => {
            setReportTarget({ id, type });
            setShowReportModal(true);
          }}
          onDelete={handleDeletePost}
          onEdit={(post) => {
            setEditingPost(post);
            setEditContent(post.content);
            setShowEditPostModal(true);
          }}
          currentUser={user}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No posts to show. Be the first to post!</p>
        </div>
      )}
    </div>
  );

  const renderSearchTab = () => (
    <div className="space-y-6">
      {/* Search Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search users, posts, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="border rounded-lg px-4 py-3 bg-gray-50"
          >
            <option value="all">All</option>
            <option value="users">Users</option>
            <option value="posts">Posts</option>
          </select>
        </div>
      </div>

      {/* Search Results */}
      {searchResults ? (
        <div className="space-y-6">
          {searchResults.users.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Users ({searchResults.users.length})</h3>
              </div>
              <div className="divide-y">
                {searchResults.users.map((resultUser) => (
                  <div key={resultUser._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <Link to={`/profile/${resultUser._id}`} className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-lg">
                            {resultUser.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{resultUser.username}</p>
                          <p className="text-sm text-gray-500">{resultUser.email}</p>
                        </div>
                      </Link>
                      {resultUser._id !== user?._id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartConversation(resultUser._id)}
                            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                          >
                            Message
                          </button>
                          <button
                            onClick={() => handleFollow(resultUser._id, "follow")}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Follow
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResults.posts.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Posts ({searchResults.posts.length})</h3>
              </div>
              <div className="divide-y">
                {searchResults.posts.map((post) => (
                  <div key={post._id} className="p-4 hover:bg-gray-50">
                    <Link to={`/post/${post._id}`} className="block">
                      <p className="text-gray-700 mb-2">{post.content.substring(0, 200)}...</p>
                      <div className="flex items-center text-sm text-gray-500 gap-4">
                        <span>❤️ {post.like_count}</span>
                        <span>💬 {post.comment_count}</span>
                        <span>↪️ {post.share_count}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Search History */
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Searches</h3>
            {searchHistory.length > 0 && (
              <button
                onClick={handleClearSearchHistory}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="p-4">
            {searchHistory.length > 0 ? (
              <div className="space-y-2">
                {searchHistory.map((history, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <button
                      onClick={() => setSearchQuery(history.query)}
                      className="text-left flex-1"
                    >
                      <p className="font-medium">{history.query}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(history.createdAt).toLocaleString()}
                      </p>
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await api.delete(`/search-histories/${history._id}`);
                          fetchSearchHistory();
                        } catch (error) {
                          console.error("Error deleting search history:", error);
                        }
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent searches</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderMessagesTab = () => (
    <div className="bg-white rounded-lg shadow min-h-[600px] flex">
      {/* Conversations List */}
      <div className={`${activeConversation ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r`}>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Messages</h3>
        </div>
        <div className="overflow-y-auto max-h-[550px]">
          {conversations.length > 0 ? (
            <div className="divide-y">
              {conversations.map((conversation) => (
                <div
                  key={conversation.partnerId}
                  onClick={() => {
                    setActiveConversation(conversation);
                    fetchMessages(conversation.partnerId);
                  }}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${activeConversation?.partnerId === conversation.partnerId ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {conversation.partner?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium truncate">{conversation.partner?.username}</p>
                        {conversation.unread && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage.content || "Media"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No conversations yet</p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${activeConversation ? 'block' : 'hidden md:block'} w-full md:w-2/3 flex flex-col`}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <button
                onClick={() => setActiveConversation(null)}
                className="md:hidden mr-2 text-gray-500 hover:text-gray-700"
              >
                ←
              </button>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {activeConversation.partner?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{activeConversation.partner?.username}</p>
                <p className="text-sm text-gray-500">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.sender_id === user._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender_id === user._id
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_id === user._id ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="divide-y max-h-[600px] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => markNotificationAsRead(notification._id)}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center">
                  {notification.type === "like" && (
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-lg">❤️</span>
                    </div>
                  )}
                  {notification.type === "comment" && (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-lg">💬</span>
                    </div>
                  )}
                  {notification.type === "follow" && (
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-lg">👤</span>
                    </div>
                  )}
                  {notification.type === "message" && (
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-lg">✉️</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {notification.sender && (
                      <span className="font-medium">{notification.sender.username}</span>
                    )}
                    <span>
                      {notification.type === "like" && "liked your post"}
                      {notification.type === "comment" && "commented on your post"}
                      {notification.type === "follow" && "started following you"}
                      {notification.type === "message" && "sent you a message"}
                    </span>
                  </div>
                  {notification.target_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (notification.type === "like" || notification.type === "comment") {
                          navigate(`/post/${notification.target_id}`);
                        }
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                    >
                      View
                    </button>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No notifications</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="text-xl font-bold text-blue-600 hover:text-blue-800"
              >
                SocialApp
              </button>
            </div>

            {/* User Stats */}
            {user && (
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <p className="font-bold">{userStats.posts}</p>
                  <p className="text-xs text-gray-500">Posts</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{userStats.followers}</p>
                  <p className="text-xs text-gray-500">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{userStats.following}</p>
                  <p className="text-xs text-gray-500">Following</p>
                </div>
              </div>
            )}

            {/* User Menu */}
            {user && (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg relative"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-3 border-b flex justify-between items-center">
                        <h3 className="font-medium">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                            onClick={() => markNotificationAsRead(notification._id)}
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
                                  {notification.sender?.username} {notification.type === "like" && "liked your post"}
                                  {notification.type === "comment" && "commented on your post"}
                                  {notification.type === "follow" && "started following you"}
                                  {notification.type === "message" && "sent you a message"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {notifications.length === 0 && (
                          <p className="p-4 text-gray-500 text-center">No notifications</p>
                        )}
                        {notifications.length > 5 && (
                          <div className="p-3 text-center border-t">
                            <button
                              onClick={() => {
                                setActiveTab("notifications");
                                setShowNotifications(false);
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              View all notifications
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <button
                  onClick={() => setActiveTab("messages")}
                  className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>

                {/* Profile */}
                <Link
                  to={`/profile/${user._id}`}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
                >
                  {user.profile?.profile_picture ? (
                    <img
                      src={user.profile.profile_picture}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {user.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:inline font-medium">{user.username}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            {["feed", "search", "messages", "notifications"].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 font-medium capitalize ${
                  activeTab === tab 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === "feed" && renderFeedTab()}
        {activeTab === "search" && renderSearchTab()}
        {activeTab === "messages" && renderMessagesTab()}
        {activeTab === "notifications" && renderNotificationsTab()}
      </main>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Report Content</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for reporting
                  </label>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    placeholder="Please describe why you are reporting this content..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowReportModal(false);
                      setReportReason("");
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportSubmit}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditPostModal && editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Edit Post</h2>
              <div className="space-y-4">
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="6"
                    placeholder="What's on your mind?"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowEditPostModal(false);
                      setEditingPost(null);
                      setEditContent("");
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditPost}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;