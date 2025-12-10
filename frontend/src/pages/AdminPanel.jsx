import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { AuthContext } from "../context/AuthContext";
import { render } from "@testing-library/react";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { logout: authLogout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalReports: 0,
    pendingReports: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalLikes: 0,
    totalShares: 0,
    totalFollows: 0,
    totalMessages: 0,
    totalNotifications: 0,
    totalMedia: 0,
    totalSearches: 0,
    recentActivity: []
  });

  // Users State
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [userRoles, setUserRoles] = useState([]);

  // Reports State
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [reportFilter, setReportFilter] = useState("all");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");

  // Content State
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [media, setMedia] = useState([]);
  const [contentFilter, setContentFilter] = useState("all");

  // Activity & Logs State
  const [activities, setActivities] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Additional Data
  const [likes, setLikes] = useState([]);
  const [shares, setShares] = useState([]);
  const [follows, setFollows] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [userSettings, setUserSettings] = useState([]);

  // Selection State
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState("post");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Modal States
  const [showUserModal, setShowUserModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showEditContentModal, setShowEditContentModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showCreateNotificationModal, setShowCreateNotificationModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);

  // Form States
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("7");
  const [warningMessage, setWarningMessage] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [editContent, setEditContent] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkAction, setBulkAction] = useState("");

  // New Content Creation
  const [newContent, setNewContent] = useState({
    type: "post",
    title: "",
    content: "",
    author_id: "",
    category: ""
  });

  const [newNotification, setNewNotification] = useState({
  user_id: "",
  type: "system",
  sender_id: "",
  target_id: "",
});


  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Add axios interceptor for authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      // Redirect to login if no token
      navigate("/login");
    }
  }, [navigate]);

  // Fetch All Dashboard Data
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        usersRes, postsRes, commentsRes, reportsRes, 
        activitiesRes, likesRes, sharesRes, followsRes,
        mediaRes, messagesRes, notificationsRes, 
        searchHistoryRes, profilesRes, userSettingsRes
      ] = await Promise.all([
        api.get("/users"),
        api.get("/posts"),
        api.get("/comments"),
        api.get("/reports"),
        api.get("/activity-logs"),
        api.get("/likes"),
        api.get("/shares"),
        api.get("/follows"),
        api.get("/media"),
        api.get("/messages"),
        api.get("/notifications"),
        api.get("/search-histories"),
        api.get("/profiles"),
        api.get("/userSettings")
      ]);

      // Set states
      setUsers(usersRes.data);
      setFilteredUsers(usersRes.data);
      setPosts(postsRes.data);
      setComments(commentsRes.data);
      setReports(reportsRes.data);
      setFilteredReports(reportsRes.data);
      setActivities(activitiesRes.data);
      setLikes(likesRes.data);
      setShares(sharesRes.data);
      setFollows(followsRes.data);
      setMedia(mediaRes.data);
      setMessages(messagesRes.data);
      setNotifications(notificationsRes.data);
      setSearchHistory(searchHistoryRes.data);
      setProfiles(profilesRes.data);
      setUserSettings(userSettingsRes.data);

      // Calculate stats
      const usersData = usersRes.data;
      const totalUsers = usersData.length;
      const activeUsers = usersData.filter(u => u.status === "active").length;
      const suspendedUsers = usersData.filter(u => u.status === "suspended").length;
      const pendingReports = reportsRes.data.filter(r => r.status === "pending").length;
      
      // Extract unique roles
      const roles = [...new Set(usersData.map(user => user.role))];
      setUserRoles(roles);

      setStats({
        totalUsers,
        totalPosts: postsRes.data.length,
        totalComments: commentsRes.data.length,
        totalReports: reportsRes.data.length,
        pendingReports,
        activeUsers,
        suspendedUsers,
        totalLikes: likesRes.data.length,
        totalShares: sharesRes.data.length,
        totalFollows: followsRes.data.length,
        totalMessages: messagesRes.data.length,
        totalNotifications: notificationsRes.data.length,
        totalMedia: mediaRes.data.length,
        totalSearches: searchHistoryRes.data.length,
        recentActivity: activitiesRes.data.slice(0, 10).map(activity => ({
          ...activity,
          user_id: activity.user_id?._id || activity.user_id
        }))
      });

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      if (error.response?.status === 401) {
        handleLogout();
      } else if (error.response?.status) {
        // Server responded with error status
        alert(`Error fetching data: ${error.response?.status} - ${error.response?.data?.message || error.message}. Check console for details.`);
      } else if (error.request) {
        // Request was made but no response received
        alert("No response from server. Please check if the backend server is running on http://localhost:5000");
      } else {
        // Error in request setup
        alert(`Error: ${error.message}. Please check your connection.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Enhanced User Details Fetch
  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      
      // Fetch user with all related data
      const userRes = await api.get(`/users/${userId}`);
      const user = userRes.data;

      // Fetch related data in parallel
      const [
        profileRes, postsRes, commentsRes, reportsRes, 
        activitiesRes, likesRes, followsRes, messagesRes, 
        settingsRes, userNotifications, userMessages
      ] = await Promise.all([
        api.get(`/profiles/${userId}`).catch(() => ({ data: {} })),
        api.get("/posts").then(res => res.data.filter(post => post.author_id === userId)),
        api.get("/comments").then(res => res.data.filter(comment => comment.author_id === userId)),
        api.get("/reports").then(res => res.data.filter(report => 
          (report.target_type === "user" && report.target_id === userId) ||
          (report.target_type === "post" && res.data.some(post => post._id === report.target_id)) ||
          (report.target_type === "comment" && res.data.some(comment => comment._id === report.target_id))
        )),
        api.get("/activity-logs").then(res => res.data.filter(activity => activity.user_id === userId)),
        api.get("/likes").then(res => res.data.filter(like => like.user_id === userId)),
        api.get("/follows").then(res => ({
          following: res.data.filter(follow => follow.follower_id === userId),
          followers: res.data.filter(follow => follow.following_id === userId)
        })),
        api.get("/messages").then(res => res.data.filter(msg => 
          msg.sender_id === userId || msg.receiver_id === userId
        )),
        api.get(`/userSettings/${userId}`).catch(() => ({ data: {} })),
        api.get("/notifications").then(res => res.data.filter(n => n.user_id === userId)),
        api.get("/messages").then(res => res.data.filter(m => 
          m.sender_id === userId || m.receiver_id === userId
        ))
      ]);

      setSelectedUser({
        ...user,
        profile: profileRes.data || {},
        posts: postsRes,
        comments: commentsRes,
        reports: reportsRes,
        activities: activitiesRes.slice(0, 20),
        likes: likesRes,
        follows: followsRes,
        messages: messagesRes,
        settings: settingsRes.data || {},
        notifications: userNotifications,
        userMessages: userMessages
      });

      setShowUserModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      alert("Error fetching user details");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced Report Details Fetch
  const fetchReportDetails = async (reportId) => {
  try {
    setLoading(true);

    const reportRes = await api.get(`/reports/${reportId}`);
    const report = reportRes.data;

    // Fetch target content
    const targetRes = await fetchTargetData(report.target_type, report.target_id);

    // Fetch activities related to this target
    const activitiesRes = await api.get("/activity-logs");
    const relatedActivities = activitiesRes.data.filter(
      (activity) =>
        activity.target_id &&
        activity.target_id._id === report.target_id // if populated
    );

    setSelectedReport({
      ...report,
      target: targetRes,
      activities: relatedActivities,
    });

    setShowReportModal(true);
  } catch (error) {
    console.error("Error fetching report details:", error);
    alert("Error fetching report details");
  } finally {
    setLoading(false);
  }
};

  // Helper to fetch target data
  const fetchTargetData = async (type, id) => {
  try {
    if (type === "user") {
      const res = await api.get(`/users/${id}`);
      return res.data;
    } else if (type === "post") {
      const res = await api.get(`/posts/${id}`);
      return res.data;
    } else if (type === "comment") {
      const res = await api.get(`/comments/${id}`);
      return res.data;
    } else if (type === "media") {
      const res = await api.get(`/media/${id}`);
      return res.data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${type} data:`, error);
    return null;
  }
};


  // Filter Users
  const filterUsers = () => {
    let filtered = [...users];

    if (userFilter !== "all") {
      if (["admin", "moderator", "user"].includes(userFilter)) {
        filtered = filtered.filter(user => user.role === userFilter);
      } else {
        filtered = filtered.filter(user => user.status === userFilter);
      }
    }

    if (userSearch.trim()) {
      const searchTerm = userSearch.toLowerCase();
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        user._id?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  // Filter Reports
  const filterReports = () => {
    let filtered = [...reports];

    if (reportFilter !== "all") {
      filtered = filtered.filter(report => report.status === reportFilter);
    }

    if (reportTypeFilter !== "all") {
      filtered = filtered.filter(report => report.target_type === reportTypeFilter);
    }

    setFilteredReports(filtered);
  };

  // CRUD Operations for Users
  const createUser = async (userData) => {
    try {
      const res = await api.post("/users", userData);
      setUsers([...users, res.data]);
      filterUsers();
      alert("User created successfully");
      return res.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const res = await api.put(`/users/${userId}`, updates);
      
      const updatedUsers = users.map(user => 
        user._id === userId ? { ...user, ...updates } : user
      );
      setUsers(updatedUsers);
      filterUsers();
      
      if (selectedUser?._id === userId) {
        setSelectedUser({ ...selectedUser, ...updates });
      }

      // Log activity
      await createActivityLog({
        action: "user_updated",
        user_id: localStorage.getItem("userId") || "admin",
        target_id: userId,
        details: JSON.stringify(updates)
      });

      return res.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      filterUsers();
      
      // Log activity
      await createActivityLog({
        action: "user_deleted",
        user_id: localStorage.getItem("userId") || "admin",
        target_id: userId
      });

      alert("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  // CRUD Operations for Posts
  const createPost = async (postData) => {
    try {
      const res = await api.post("/posts", postData);
      setPosts([...posts, res.data]);
      alert("Post created successfully");
      return res.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };

  const updatePost = async (postId, updates) => {
    try {
      const res = await api.put(`/posts/${postId}`, updates);
      
      const updatedPosts = posts.map(post => 
        post._id === postId ? { ...post, ...updates } : post
      );
      setPosts(updatedPosts);

      // Log activity
      await createActivityLog({
        action: "post_updated",
        user_id: localStorage.getItem("userId") || "admin",
        target_id: postId,
        details: JSON.stringify(updates)
      });

      return res.data;
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  };

  const deletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
      
      // Log activity
      await createActivityLog({
        action: "post_deleted",
        user_id: localStorage.getItem("userId") || "admin",
        target_id: postId
      });

      alert("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  };

  // CRUD Operations for Comments
  const createComment = async (commentData) => {
    try {
      const res = await api.post("/comments", commentData);
      setComments([...comments, res.data]);
      alert("Comment created successfully");
      return res.data;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  };

  const updateComment = async (commentId, updates) => {
    try {
      const res = await api.put(`/comments/${commentId}`, updates);
      
      const updatedComments = comments.map(comment => 
        comment._id === commentId ? { ...comment, ...updates } : comment
      );
      setComments(updatedComments);

      // Log activity
      await createActivityLog({
        action: "comment_updated",
        user_id: localStorage.getItem("userId") || "admin",
        target_id: commentId,
        details: JSON.stringify(updates)
      });

      return res.data;
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(comment => comment._id !== commentId));
      
      // Log activity
      await createActivityLog({
        action: "comment_deleted",
        user_id: localStorage.getItem("userId") || "admin",
        target_id: commentId
      });

      alert("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  };

  // CRUD Operations for Media
  const createMedia = async (mediaData) => {
    try {
      const res = await api.post("/media", mediaData);
      setMedia([...media, res.data]);
      alert("Media uploaded successfully");
      return res.data;
    } catch (error) {
      console.error("Error uploading media:", error);
      throw error;
    }
  };

  const deleteMedia = async (mediaId) => {
    try {
      await api.delete(`/media/${mediaId}`);
      setMedia(media.filter(item => item._id !== mediaId));
      
      // Log activity
      await createActivityLog({
        action: "media_deleted",
        user_id: localStorage.getItem("userId") || "admin",
        target_id: mediaId
      });

      alert("Media deleted successfully");
    } catch (error) {
      console.error("Error deleting media:", error);
      throw error;
    }
  };

  // CRUD Operations for Reports
  const createReport = async (reportData) => {
    try {
      const res = await api.post("/reports", reportData);
      setReports([...reports, res.data]);
      filterReports();
      alert("Report created successfully");
      return res.data;
    } catch (error) {
      console.error("Error creating report:", error);
      throw error;
    }
  };

  const updateReport = async (reportId, updates) => {
    try {
      const res = await api.put(`/reports/${reportId}`, updates);
      
      const updatedReports = reports.map(report => 
        report._id === reportId ? { ...report, ...updates } : report
      );
      setReports(updatedReports);
      filterReports();
      
      if (selectedReport?._id === reportId) {
        setSelectedReport({ ...selectedReport, ...updates });
      }

      // Log activity
      await createActivityLog({
        action: "report_updated",
        user_id: localStorage.getItem("userId") || "admin",
        target_id: reportId,
        details: JSON.stringify(updates)
      });

      return res.data;
    } catch (error) {
      console.error("Error updating report:", error);
      throw error;
    }
  };

  const deleteReport = async (reportId) => {
    try {
      await api.delete(`/reports/${reportId}`);
      setReports(reports.filter(report => report._id !== reportId));
      filterReports();
      
      // Log activity
      await createActivityLog({
        action: "report_deleted",
        user_id: localStorage.getItem("userId") || "admin",
        target_id: reportId
      });

      alert("Report deleted successfully");
    } catch (error) {
      console.error("Error deleting report:", error);
      throw error;
    }
  };

  // CRUD Operations for Activity Logs
  const createActivityLog = async (activityData) => {
    try {
      await api.post("/activity-logs", {
        ...activityData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error creating activity log:", error);
    }
  };

  const deleteActivityLog = async (activityId) => {
    try {
      await api.delete(`/activity-logs/${activityId}`);
      setActivities(activities.filter(activity => activity._id !== activityId));
      alert("Activity log deleted successfully");
    } catch (error) {
      console.error("Error deleting activity log:", error);
      throw error;
    }
  };
  

  // CRUD Operations for Notifications
  const createNotification = async (notificationData) => {
    try {
      const res = await api.post("/notifications", notificationData);
      setNotifications([...notifications, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  };

  const updateNotification = async (notificationId, updates) => {
    try {
      const res = await api.put(`/notifications/${notificationId}`, updates);
      
      const updatedNotifications = notifications.map(notification => 
        notification._id === notificationId ? { ...notification, ...updates } : notification
      );
      setNotifications(updatedNotifications);

      return res.data;
    } catch (error) {
      console.error("Error updating notification:", error);
      throw error;
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n._id !== notificationId));
      alert("Notification deleted successfully");
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  };

  // CRUD Operations for Messages
  const createMessage = async (messageData) => {
    try {
      const res = await api.post("/messages", messageData);
      setMessages([...messages, res.data]);
      alert("Message sent successfully");
      return res.data;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages(messages.filter(m => m._id !== messageId));
      alert("Message deleted successfully");
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  };

  // CRUD Operations for Follows
  const createFollow = async (followData) => {
    try {
      const res = await api.post("/follows", followData);
      setFollows([...follows, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error creating follow:", error);
      throw error;
    }
  };

  const deleteFollow = async (followId) => {
    try {
      await api.delete(`/follows/${followId}`);
      setFollows(follows.filter(f => f._id !== followId));
    } catch (error) {
      console.error("Error deleting follow:", error);
      throw error;
    }
  };

  // CRUD Operations for Likes
  const createLike = async (likeData) => {
    try {
      const res = await api.post("/likes", likeData);
      setLikes([...likes, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error creating like:", error);
      throw error;
    }
  };

  const deleteLike = async (likeId) => {
    try {
      await api.delete(`/likes/${likeId}`);
      setLikes(likes.filter(l => l._id !== likeId));
    } catch (error) {
      console.error("Error deleting like:", error);
      throw error;
    }
  };

  // CRUD Operations for Shares
  const createShare = async (shareData) => {
    try {
      const res = await api.post("/shares", shareData);
      setShares([...shares, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error creating share:", error);
      throw error;
    }
  };

  const deleteShare = async (shareId) => {
    try {
      await api.delete(`/shares/${shareId}`);
      setShares(shares.filter(s => s._id !== shareId));
    } catch (error) {
      console.error("Error deleting share:", error);
      throw error;
    }
  };

  // CRUD Operations for Search History
  const deleteSearchHistory = async (searchId) => {
    try {
      await api.delete(`/search-histories/${searchId}`);
      setSearchHistory(searchHistory.filter(s => s._id !== searchId));
    } catch (error) {
      console.error("Error deleting search history:", error);
      throw error;
    }
  };

  // CRUD Operations for User Settings
  const updateUserSettings = async (userId, settings) => {
    try {
      const res = await api.put(`/userSettings/${userId}`, settings);
      const updatedSettings = userSettings.map(setting => 
        setting.user_id === userId ? { ...setting, ...settings } : setting
      );
      setUserSettings(updatedSettings);
      return res.data;
    } catch (error) {
      console.error("Error updating user settings:", error);
      throw error;
    }
  };

  // Update User Status
  const updateUserStatus = async (userId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this user?`)) {
      return;
    }

    try {
      await updateUser(userId, { status });
      alert(`User ${status} successfully`);
    } catch (error) {
      alert("Failed to update user status");
    }
  };

  // Update User Role
  const handleUpdateUserRole = async () => {
    if (!selectedUser) return;
    
    try {
      await updateUser(selectedUser._id, { role: newRole });
      setShowEditRoleModal(false);
      setNewRole("user");
      alert(`User role updated to ${newRole}`);
    } catch (error) {
      alert("Failed to update user role");
    }
  };

  // Send Warning to User
  const handleSendWarning = async () => {
    if (!selectedUser || !warningMessage.trim()) {
      alert("Please provide a warning message");
      return;
    }

    try {
      await createNotification({
        user_id: selectedUser._id,
        type: "warning",
        content: warningMessage,
        sender_id: localStorage.getItem("userId") || "admin",
        read: false
      });

      await createActivityLog({
        action: "warning_sent",
        user_id: localStorage.getItem("userId") || "admin",
        target_id: selectedUser._id,
        details: warningMessage
      });

      setShowWarningModal(false);
      setWarningMessage("");
      alert("Warning sent to user successfully");
    } catch (error) {
      console.error("Error sending warning:", error);
      alert("Failed to send warning");
    }
  };

  // Ban User with Reason
  const handleBanUser = async () => {
    if (!banReason.trim()) {
      alert("Please provide a reason for banning");
      return;
    }

    try {
      await updateUser(selectedUser._id, { 
        status: "suspended",
        suspension_reason: banReason,
        suspension_duration: banDuration === "permanent" ? null : parseInt(banDuration),
        suspended_at: new Date().toISOString()
      });

      await createNotification({
        user_id: selectedUser._id,
        type: "suspension",
        content: `Your account has been suspended. Reason: ${banReason}`,
        sender_id: localStorage.getItem("userId") || "admin",
        read: false
      });

      setShowBanModal(false);
      setBanReason("");
      setBanDuration("7");
      alert("User banned successfully");
    } catch (error) {
      console.error("Error banning user:", error);
      alert("Failed to ban user");
    }
  };

  // Update Report Status
  const handleUpdateReportStatus = async (reportId, status, action = null) => {
    try {
      const updates = { status };
      if (action) {
        updates.action_taken = action;
      }

      await updateReport(reportId, updates);
      alert(`Report marked as ${status}`);
    } catch (error) {
      console.error("Error updating report status:", error);
      alert("Failed to update report status");
    }
  };

  // Edit Content
  const handleEditContent = async () => {
    if (!selectedContent || !editContent.trim()) return;
    
    try {
      if (selectedContent.type === "post") {
        await updatePost(selectedContent.id, {
          content: editContent,
          edited_by: localStorage.getItem("userId") || "admin",
          edited_at: new Date().toISOString()
        });
      } else if (selectedContent.type === "comment") {
        await updateComment(selectedContent.id, {
          content: editContent,
          edited_by: localStorage.getItem("userId") || "admin",
          edited_at: new Date().toISOString()
        });
      }
      
      setShowEditContentModal(false);
      setEditContent("");
      alert("Content updated successfully");
    } catch (error) {
      alert("Failed to update content");
    }
  };

  // Delete Content
  const handleDeleteContent = async () => {
    if (!selectedContent) return;
    
    try {
      if (selectedContent.type === "post") {
        await deletePost(selectedContent.id);
      } else if (selectedContent.type === "comment") {
        await deleteComment(selectedContent.id);
      } else if (selectedContent.type === "media") {
        await deleteMedia(selectedContent.id);
      }

      setShowDeleteModal(false);
      alert(`${selectedContent.type.charAt(0).toUpperCase() + selectedContent.type.slice(1)} deleted successfully`);
    } catch (error) {
      alert(`Failed to delete ${selectedContent.type}`);
    }
  };

  const handleCreateMediaUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("File size must be less than 5MB");
    return;
  }

  const validTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4"];
  if (!validTypes.includes(file.type)) {
    alert("Only images (JPEG, PNG, GIF) and videos (MP4) are allowed");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    const base64Data = reader.result;
    setNewContent((prev) => ({ ...prev, media_url: base64Data }));
  };
  reader.readAsDataURL(file);
};


  
  // Create New Content
  const handleCreateContent = async () => {
  if (!newContent.content.trim()) {
    alert("Post content cannot be empty");
    return;
  }

  try {
    await createPost({
      author_id: localStorage.getItem("userId") || "admin",
      content: newContent.content,
      media_url: newContent.media_url || null,
      visibility: newContent.visibility || "public",
      like_count: 0,
      comment_count: 0,
      share_count: 0,
    });

    setShowCreateModal(false);
    setNewContent({
      content: "",
      media_url: "",
      visibility: "public",
    });

    alert("Post created successfully");
    fetchDashboardStats?.();
  } catch (error) {
    console.error("Error creating post:", error);
    alert("Failed to create post");
  }
};



  // Bulk Actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) {
      alert("Please select items and an action");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${bulkAction} ${selectedItems.length} item(s)?`
    );

    if (!confirmed) return;

    try {
      for (const item of selectedItems) {
        if (bulkAction === "delete") {
          if (item.type === "user") {
            await deleteUser(item.id);
          } else if (item.type === "post") {
            await deletePost(item.id);
          } else if (item.type === "comment") {
            await deleteComment(item.id);
          } else if (item.type === "report") {
            await deleteReport(item.id);
          }
        } else if (bulkAction === "activate") {
          await updateUser(item.id, { status: "active" });
        } else if (bulkAction === "suspend") {
          await updateUser(item.id, { status: "suspended" });
        }
      }

      setShowBulkActionModal(false);
      setBulkAction("");
      setSelectedItems([]);
      alert(`Bulk action ${bulkAction} completed successfully`);
      fetchDashboardStats();
    } catch (error) {
      alert("Failed to perform bulk action");
    }
  };

  // Export Data
  const exportData = async (type) => {
    try {
      let data, filename;
      
      switch (type) {
        case "users":
          data = users;
          filename = `users_export_${new Date().toISOString().split('T')[0]}.json`;
          break;
        case "posts":
          data = posts;
          filename = `posts_export_${new Date().toISOString().split('T')[0]}.json`;
          break;
        case "reports":
          data = reports;
          filename = `reports_export_${new Date().toISOString().split('T')[0]}.json`;
          break;
        case "activities":
          data = activities;
          filename = `activities_export_${new Date().toISOString().split('T')[0]}.json`;
          break;
        default:
          return;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data");
    }
  };

  // View Activity Details
  const handleViewActivityDetails = async (activityId) => {
    try {
      setLoading(true);
      const res = await api.get(`/activity-logs/${activityId}`);
      setSelectedActivity(res.data);
      setShowActivityModal(true);
    } catch (error) {
      console.error("Error fetching activity details:", error);
      alert("Failed to load activity details");
    } finally {
      setLoading(false);
    }
  };

  // View Notification Details
  const handleViewNotificationDetails = async (notificationId) => {
    try {
      const res = await api.get(`/notifications/${notificationId}`);
      setSelectedNotification(res.data);
      setShowNotificationModal(true);
    } catch (error) {
      console.error("Error fetching notification details:", error);
      alert("Failed to load notification details");
    }
  };

  // View Message Details
  const handleViewMessageDetails = async (messageId) => {
    try {
      const res = await api.get(`/messages/${messageId}`);
      setSelectedMessage(res.data);
      setShowMessageModal(true);
    } catch (error) {
      console.error("Error fetching message details:", error);
      alert("Failed to load message details");
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      // Log the logout activity
      await createActivityLog({
        action: "admin_logout",
        user_id: localStorage.getItem("userId") || "admin",
        details: "Admin logged out from dashboard"
      });
    } catch (error) {
      console.error("Error logging logout activity:", error);
      // Continue with logout even if logging fails
    }

    // Use AuthContext logout to clear user state and localStorage
    authLogout();
    
    // Navigate to login
    navigate("/login", { replace: true });
  };

  // Toggle item selection for bulk actions
  const toggleItemSelection = (item) => {
    setSelectedItems(prev => {
      const exists = prev.some(i => i.id === item.id && i.type === item.type);
      if (exists) {
        return prev.filter(i => !(i.id === item.id && i.type === item.type));
      } else {
        return [...prev, item];
      }
    });
  };

  // Check if item is selected
  const isItemSelected = (item) => {
    return selectedItems.some(i => i.id === item.id && i.type === item.type);
  };

  // Select all items on current page
  const selectAllItems = () => {
    let items = [];
    if (activeTab === "users") {
      items = currentUsers.map(user => ({ id: user._id, type: "user" }));
    } else if (activeTab === "reports") {
      items = filteredReports.map(report => ({ id: report._id, type: "report" }));
    } else if (activeTab === "content") {
      if (selectedContentType === "post") {
        items = posts.map(post => ({ id: post._id, type: "post" }));
      } else if (selectedContentType === "comment") {
        items = comments.map(comment => ({ id: comment._id, type: "comment" }));
      }
    }
    setSelectedItems(items);
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedItems([]);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Initialize data
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Filter users when filters change
  useEffect(() => {
    filterUsers();
  }, [userFilter, userSearch, users]);

  // Filter reports when filters change
  useEffect(() => {
    filterReports();
  }, [reportFilter, reportTypeFilter, reports]);

  useEffect(() => {
    if (activeTab === "activity") {
      console.log("Fetching activity logs..."); // 👈
      (async () => {
        try {
          const res = await api.get("/activity-logs");
          console.log("Fetched logs:", res.data); // 👈
          setActivities(res.data);
        } catch (error) {
          console.error("Error fetching activity logs:", error);
        }
      })();
    }
  }, [activeTab]);


  // StatCard Component
  const StatCard = ({ title, value, icon, color, trend }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700',
      green: 'bg-green-50 text-green-700',
      red: 'bg-red-50 text-red-700',
      yellow: 'bg-yellow-50 text-yellow-700',
      purple: 'bg-purple-50 text-purple-700',
      pink: 'bg-pink-50 text-pink-700',
      indigo: 'bg-indigo-50 text-indigo-700',
      gray: 'bg-gray-50 text-gray-700'
    };

    return (
      <div className={`${colorClasses[color]} p-4 rounded-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p className="text-xs mt-1 opacity-75">{trend}</p>
            )}
          </div>
          <div className="text-2xl">{icon}</div>
        </div>
      </div>
    );
  };

  // Render Dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers}
          icon="👥"
          color="blue"
          trend={`${stats.activeUsers} active`}
        />
        <StatCard 
          title="Total Posts" 
          value={stats.totalPosts}
          icon="📝"
          color="green"
        />
        <StatCard 
          title="Pending Reports" 
          value={stats.pendingReports}
          icon="⚠️"
          color="red"
          trend={`${stats.totalReports} total`}
        />
        <StatCard 
          title="Active Users" 
          value={stats.activeUsers}
          icon="✅"
          color="green"
          trend={`${stats.suspendedUsers} suspended`}
        />
        <StatCard 
          title="Total Likes" 
          value={stats.totalLikes}
          icon="❤️"
          color="pink"
        />
        <StatCard 
          title="Total Comments" 
          value={stats.totalComments}
          icon="💬"
          color="blue"
        />
        <StatCard 
          title="Total Shares" 
          value={stats.totalShares}
          icon="↪️"
          color="yellow"
        />
        <StatCard 
          title="Total Follows" 
          value={stats.totalFollows}
          icon="👥"
          color="purple"
        />
        <StatCard 
          title="Total Media" 
          value={stats.totalMedia}
          icon="🖼️"
          color="indigo"
        />
        <StatCard 
          title="Searches" 
          value={stats.totalSearches}
          icon="🔍"
          color="gray"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>API Server</span>
              </div>
              <span className="text-green-600 font-medium">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Database</span>
              </div>
              <span className="text-green-600 font-medium">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Storage</span>
              </div>
              <span className="text-green-600 font-medium">72% Free</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => exportData("users")}
              className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center justify-between"
            >
              <span>Export Users Data</span>
              <span>⬇️</span>
            </button>
            <button
              onClick={() => exportData("reports")}
              className="w-full text-left px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center justify-between"
            >
              <span>Export Reports Data</span>
              <span>⬇️</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center justify-between"
            >
              <span>Create New Content</span>
              <span>➕</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="text-sm">
                  <span className="font-medium">
                    {activity.user_id?.substring(0, 8) || 'System'}
                  </span>
                  <span className="text-gray-600 ml-2">
                    {activity.action?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Users Tab
  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* Filters and Bulk Actions */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
              <option value="admin">Admins</option>
              <option value="user">Regular Users</option>
            </select>
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="border rounded px-3 py-2"
            />
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedItems.length} selected
                </span>
                <button
                  onClick={() => setShowBulkActionModal(true)}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Bulk Actions
                </button>
                <button
                  onClick={clearSelections}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Users ({filteredUsers.length})</h2>
          <div className="flex space-x-2">
            <button
              onClick={selectAllItems}
              className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
            >
              Select All
            </button>
            <button
              onClick={() => exportData("users")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === currentUsers.length}
                    onChange={selectAllItems}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isItemSelected({ id: user._id, type: "user" })}
                      onChange={() => toggleItemSelection({ id: user._id, type: "user" })}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fetchUserDetails(user._id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditRoleModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Edit Role
                      </button>
                      {user.status === 'active' ? (
                        <>
                          <button
                            onClick={() => updateUserStatus(user._id, 'banned')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Ban
                          </button>
                          <button
                            onClick={() => updateUserStatus(user._id, 'suspended')}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Suspend
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => updateUserStatus(user._id, 'active')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages ? "bg-gray-100 text-gray-400" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render Reports Tab
  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <select
              value={reportFilter}
              onChange={(e) => setReportFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={reportTypeFilter}
              onChange={(e) => setReportTypeFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="user">User Reports</option>
              <option value="post">Post Reports</option>
              <option value="comment">Comment Reports</option>
              <option value="media">Media Reports</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => {
          const reporter = users.find(u => u._id === report.reporter_id);
          
          return (
            <div key={report._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {report.status}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        {report.target_type}
                      </span>
                    </div>
                    <h3 className="font-medium">Report: {report.reason?.substring(0, 100)}...</h3>
                    <div className="text-sm text-gray-500 mt-2">
                      Reporter: {reporter?.username || 'Unknown'}
                    </div>
                  </div>
                  <button
                    onClick={() => fetchReportDetails(report._id)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    Details →
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateReportStatus(report._id, 'reviewed')}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => handleUpdateReportStatus(report._id, 'resolved')}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedContent({
                        id: report.target_id,
                        type: report.target_type
                      });
                      setShowDeleteModal(true);
                    }}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Delete Content
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Content Tab
  const renderContentTab = () => (
    <div className="space-y-6">
      {/* Content Type Selector */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedContentType("post")}
              className={`px-4 py-2 rounded ${
                selectedContentType === "post" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Posts ({posts.length})
            </button>
            <button
              onClick={() => setSelectedContentType("comment")}
              className={`px-4 py-2 rounded ${
                selectedContentType === "comment" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Comments ({comments.length})
            </button>
            <button
              onClick={() => setSelectedContentType("media")}
              className={`px-4 py-2 rounded ${
                selectedContentType === "media" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Media ({media.length})
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Create Content
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
            {selectedContentType === "post" ? "Posts" : 
             selectedContentType === "comment" ? "Comments" : 
             "Media Files"}
          </h2>
        </div>
        <div className="divide-y">
          {selectedContentType === "post" ? (
            posts.map((post) => {
              const author = users.find(u => u._id === post.author_id);
              
              return (
                <div key={post._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">
                        By {author?.username || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      <p className="mt-1">{post.content?.substring(0, 200)}...</p>
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                        <span>❤️ {post.like_count || 0}</span>
                        <span>💬 {post.comment_count || 0}</span>
                        <span>↪️ {post.share_count || 0}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedContent({ id: post._id, type: "post", data: post });
                          setEditContent(post.content || "");
                          setShowEditContentModal(true);
                        }}
                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedContent({ id: post._id, type: "post" });
                          setShowDeleteModal(true);
                        }}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : selectedContentType === "comment" ? (
            comments.map((comment) => (
              <div key={comment._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Comment ID: {comment._id?.substring(0, 12)}...</p>
                    <p className="mt-1">{comment.content?.substring(0, 200)}...</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedContent({ id: comment._id, type: "comment", data: comment });
                        setEditContent(comment.content || "");
                        setShowEditContentModal(true);
                      }}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedContent({ id: comment._id, type: "comment" });
                        setShowDeleteModal(true);
                      }}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            media.map((mediaItem) => (
              <div key={mediaItem._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">{mediaItem.content?.substring(0, 50) || 'Media File'}</p>
                    <p className="text-sm text-gray-500">URL: {mediaItem.media_url ? mediaItem.media_url.substring(0, 50) : 'No file'}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {mediaItem.media_url && (
                      <button
                      onClick={() => window.open(mediaItem.media_url, '_blank')}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                        View
                      </button>
                    )}
                    <button
                    onClick={() => {
                      setSelectedContent({ id: mediaItem._id, type: "media" });setShowDeleteModal(true);
                    }}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  

  // Render Activity Tab
  const renderActivityTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">System Activity Logs</h2>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.map((activity, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof activity.user_id === "string"? activity.user_id.substring(0, 12): activity.user_id?._id?.substring(0, 12) || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activity.action?.includes('delete') ? 'bg-red-100 text-red-800' :
                        activity.action?.includes('create') ? 'bg-green-100 text-green-800' :
                        activity.action?.includes('update') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.action?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.target_id?.substring(0, 12) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(activity.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewActivityDetails(activity._id)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
  <div className="space-y-6">
    {/* Header / Controls */}
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold">Notifications ({notifications.length})</h2>
        {/* <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowCreateNotificationModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + New Notification
          </button>
          <button
            onClick={() => setNotifications([])}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Clear All
          </button>
        </div> */}
      </div>
    </div>

    {/* Notifications List */}
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No notifications found.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 flex items-start justify-between hover:bg-gray-50 ${
                !n.read ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Sender Avatar */}
                {n.sender_id?.profile_picture ? (
                  <img
                    src={n.sender_id.profile_picture}
                    alt={n.sender_id.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {n.sender_id?.username?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                )}

                {/* Notification Info */}
                <div>
                  <p className="text-gray-900 font-medium">
                    {n.type.charAt(0).toUpperCase() + n.type.slice(1)}{" "}
                    {n.read ? (
                      <span className="text-xs text-gray-500 ml-2">(Read)</span>
                    ) : (
                      <span className="text-xs text-blue-500 ml-2">(Unread)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {n.sender_id?.username
                      ? `From ${n.sender_id.username}`
                      : "System Notification"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedNotification(n);
                    setShowNotificationModal(true);
                  }}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  View
                </button>
                <button
                  onClick={() => updateNotification(n._id, { read: !n.read })}
                  className={`px-3 py-1 text-sm rounded ${
                    n.read
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {n.read ? "Mark Unread" : "Mark Read"}
                </button>
                <button
                  onClick={() => deleteNotification(n._id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    {/* Create Notification Modal */}
    {showCreateNotificationModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Notification</h2>
              <button
                onClick={() => setShowCreateNotificationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* User ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target User ID
                </label>
                <input
                  type="text"
                  value={newNotification.user_id}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      user_id: e.target.value,
                    })
                  }
                  placeholder="Enter target user ID"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Type
                </label>
                <select
                  value={newNotification.type}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      type: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="system">System</option>
                  <option value="warning">Warning</option>
                  <option value="like">Like</option>
                  <option value="comment">Comment</option>
                  <option value="follow">Follow</option>
                  <option value="message">Message</option>
                  <option value="mention">Mention</option>
                </select>
              </div>

              {/* Sender ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sender ID (optional)
                </label>
                <input
                  type="text"
                  value={newNotification.sender_id}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      sender_id: e.target.value,
                    })
                  }
                  placeholder="Enter sender ID"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Target ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target ID (optional)
                </label>
                <input
                  type="text"
                  value={newNotification.target_id}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      target_id: e.target.value,
                    })
                  }
                  placeholder="Enter target object ID"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowCreateNotificationModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await createNotification({
                        user_id: newNotification.user_id,
                        type: newNotification.type,
                        sender_id: newNotification.sender_id || null,
                        target_id: newNotification.target_id || null,
                        read: false,
                      });
                      setShowCreateNotificationModal(false);
                      setNewNotification({
                        user_id: "",
                        type: "system",
                        sender_id: "",
                        target_id: "",
                      });
                      alert("Notification created successfully!");
                    } catch (err) {
                      alert("Failed to create notification.");
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Notification Details Modal */}
    {showNotificationModal && selectedNotification && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg relative">
          <div className="flex justify-between items-center border-b p-4">
            <h2 className="text-xl font-bold text-gray-800">Notification Details</h2>
            <button
              onClick={() => setShowNotificationModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Type</h3>
              <p className="text-gray-800 capitalize mt-1">
                {selectedNotification.type}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p
                className={`mt-1 inline-flex items-center px-2 py-1 rounded text-sm ${
                  selectedNotification.read
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {selectedNotification.read ? "Read" : "Unread"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Target User</h3>
              <p className="text-gray-800 break-all mt-1">
                {selectedNotification.user_id?._id ||
                  selectedNotification.user_id ||
                  "N/A"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Sender</h3>
              {selectedNotification.sender_id ? (
                <div className="flex items-center mt-2 space-x-3">
                  {selectedNotification.sender_id.profile_picture ? (
                    <img
                      src={selectedNotification.sender_id.profile_picture}
                      alt={selectedNotification.sender_id.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {selectedNotification.sender_id.username
                          ?.charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800">
                      {selectedNotification.sender_id.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      ID: {selectedNotification.sender_id._id}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-800 mt-1">System Notification</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Target Object ID</h3>
              <p className="text-gray-800 break-all mt-1">
                {selectedNotification.target_id || "N/A"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <p className="text-gray-800 mt-1">
                {new Date(selectedNotification.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 border-t p-4">
            <button
              onClick={() =>
                updateNotification(selectedNotification._id, {
                  read: !selectedNotification.read,
                })
              }
              className={`px-4 py-2 rounded ${
                selectedNotification.read
                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              {selectedNotification.read ? "Mark as Unread" : "Mark as Read"}
            </button>

            <button
              onClick={() => {
                if (window.confirm("Delete this notification?")) {
                  deleteNotification(selectedNotification._id);
                  setShowNotificationModal(false);
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>

            <button
              onClick={() => setShowNotificationModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);


  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Logout */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage users, content, reports, and system activity</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {localStorage.getItem("username") || "Admin"}
            </span>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            {["dashboard", "users", "reports", "content", "activity", "notifications"].map((tab) => (
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

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-center">Loading...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "users" && renderUsersTab()}
          {activeTab === "reports" && renderReportsTab()}
          {activeTab === "content" && renderContentTab()}
          {activeTab === "activity" && renderActivityTab()}
          {activeTab === "notifications" && renderNotificationsTab()}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Confirm Logout</h2>
              <p className="mb-6">Are you sure you want to logout from the admin panel?</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">User Details: {selectedUser.username}</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Username</label>
                      <p className="text-lg">{selectedUser.username}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="text-lg">{selectedUser.email}</p>
                    </div>
                    <div className="flex space-x-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Role</label>
                        <span className={`px-2 py-1 text-sm rounded-full ${
                          selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          selectedUser.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedUser.role}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Status</label>
                        <span className={`px-2 py-1 text-sm rounded-full ${
                          selectedUser.status === 'active' ? 'bg-green-100 text-green-800' :
                          selectedUser.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedUser.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    {selectedUser.status === 'active' ? (
                      <>
                        <button
                          onClick={() => {
                            updateUserStatus(selectedUser._id, 'banned');
                            setShowUserModal(false);
                          }}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Ban User
                        </button>
                        <button
                          onClick={() => {
                            updateUserStatus(selectedUser._id, 'suspended');
                            setShowUserModal(false);
                          }}
                          className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                        >
                          Suspend User
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          updateUserStatus(selectedUser._id, 'active');
                          setShowUserModal(false);
                        }}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Activate User
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowUserModal(false);
                        setSelectedUser(selectedUser);
                        setShowEditRoleModal(true);
                      }}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Edit Role
                    </button>
                    <button
                      onClick={() => {
                        setShowUserModal(false);
                        setSelectedUser(selectedUser);
                        setShowWarningModal(true);
                      }}
                      className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      Send Warning
                    </button>
                  </div>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium text-gray-700">Posts</h4>
                  <p className="text-2xl font-bold">{selectedUser.posts?.length || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium text-gray-700">Comments</h4>
                  <p className="text-2xl font-bold">{selectedUser.comments?.length || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium text-gray-700">Reports</h4>
                  <p className="text-2xl font-bold">{selectedUser.reports?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Ban User: {selectedUser.username}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Ban
                  </label>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="w-full p-2 border rounded"
                    rows="3"
                    placeholder="Enter reason for banning this user..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (days)
                  </label>
                  <select 
                    value={banDuration}
                    onChange={(e) => setBanDuration(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="1">1 day</option>
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="permanent">Permanent</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowBanModal(false);
                      setBanReason("");
                      setBanDuration("7");
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBanUser}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Confirm Ban
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Send Warning to {selectedUser.username}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warning Message
                  </label>
                  <textarea
                    value={warningMessage}
                    onChange={(e) => setWarningMessage(e.target.value)}
                    className="w-full p-2 border rounded"
                    rows="4"
                    placeholder="Enter warning message..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowWarningModal(false);
                      setWarningMessage("");
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendWarning}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Send Warning
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Edit Role for {selectedUser.username}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Role: <span className="font-bold">{selectedUser.role}</span>
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowEditRoleModal(false);
                      setNewRole("user");
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateUserRole}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Update Role
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Content Modal */}
      {showEditContentModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Edit {selectedContent.type.charAt(0).toUpperCase() + selectedContent.type.slice(1)}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border rounded"
                    rows="6"
                    placeholder="Enter content..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowEditContentModal(false);
                      setEditContent("");
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditContent}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Update Content
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Content Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create New Content</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content Type
                  </label>
                  <select
                    value={newContent.type}
                    onChange={(e) => setNewContent({...newContent, type: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="post">Post</option>
                    <option value="comment">Comment</option>
                  </select>
                </div>
                {newContent.type === "post" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newContent.title}
                      onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                      className="w-full p-2 border rounded"
                      placeholder="Enter post title..."
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={newContent.content}
                    onChange={(e) => setNewContent({...newContent, content: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows="6"
                    placeholder="Enter content..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateContent}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
{showCreateModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Post</h2>
          <button
            onClick={() => setShowCreateModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Post Content
            </label>
            <textarea
              value={newContent.content}
              onChange={(e) =>
                setNewContent({ ...newContent, content: e.target.value })
              }
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              rows="5"
              placeholder="What's on your mind?"
            />
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Media (optional)
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleCreateMediaUpload}
              className="w-full text-sm text-gray-600"
            />
            {newContent.media_url && (
              <div className="mt-3 relative">
                {newContent.media_url.match(/^data:image/) ? (
                  <img
                    src={newContent.media_url}
                    alt="Preview"
                    className="max-w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={newContent.media_url}
                    controls
                    className="max-w-full h-64 rounded-lg"
                  />
                )}
                <button
                  onClick={() =>
                    setNewContent({ ...newContent, media_url: "" })
                  }
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visibility
            </label>
            <select
              value={newContent.visibility || "public"}
              onChange={(e) =>
                setNewContent({ ...newContent, visibility: e.target.value })
              }
              className="w-full p-2 border rounded"
            >
              <option value="public">🌍 Public</option>
              <option value="friends">👥 Friends</option>
              <option value="private">🔒 Private</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateContent}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Post
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}



      {/* Delete Content Modal */}
      {showDeleteModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p className="mb-6">
                Are you sure you want to delete this {selectedContent.type}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteContent}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Details Modal */}
      {showActivityModal && selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4">Activity Details</h2>

            {/* User Info */}
            <div className="flex items-center space-x-4 mb-4">
              {selectedActivity.user_id?.profile_id?.profile_picture && (
                <img
                  src={selectedActivity.user_id.profile_id.profile_picture}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold">{selectedActivity.user_id?.username || "N/A"}</p>
                <p className="text-sm text-gray-500">{selectedActivity.user_id?.email}</p>
                <p className="text-sm text-gray-500 capitalize">{selectedActivity.user_id?.role}</p>
              </div>
            </div>

            {/* Action Type */}
            <p className="mb-2">
              <strong>Action:</strong>{" "}
              {selectedActivity.action?.replace(/_/g, " ")}
            </p>

            {/* Target Info */}
            {selectedActivity.target_id && (
              <div className="mb-4 p-4 bg-gray-50 rounded border">
                <p className="font-semibold mb-2">Target Details:</p>
                {selectedActivity.action.includes("post") && (
                  <>
                    <p><strong>Post Content:</strong> {selectedActivity.target_id?.content}</p>
                    {selectedActivity.target_id?.media_url && (
                      <img
                        src={selectedActivity.target_id.media_url}
                        alt="Media"
                        className="mt-2 max-h-48 object-contain"
                      />
                    )}
                    <p><strong>Visibility:</strong> {selectedActivity.target_id.visibility}</p>
                    <p><strong>Likes:</strong> {selectedActivity.target_id.like_count}</p>
                    <p><strong>Comments:</strong> {selectedActivity.target_id.comment_count}</p>
                    <p><strong>Shares:</strong> {selectedActivity.target_id.share_count}</p>
                  </>
                )}
                {selectedActivity.action.includes("comment") && (
                  <>
                    <p><strong>Comment Content:</strong> {selectedActivity.target_id?.content}</p>
                    <p><strong>Post ID:</strong> {selectedActivity.target_id?.post_id || "N/A"}</p>
                    <p><strong>Likes:</strong> {selectedActivity.target_id?.like_count}</p>
                  </>
                )}
                {selectedActivity.action.includes("follow") && (
                  <>
                    <p><strong>Followed User:</strong> {selectedActivity.target_id?.username}</p>
                    <p><strong>Status:</strong> {selectedActivity.target_id?.status}</p>
                  </>
                )}
                {selectedActivity.action === "login" || selectedActivity.action === "logout" ? (
                  <p>User performed a {selectedActivity.action} action</p>
                ) : null}
              </div>
            )}

            {/* Timestamp */}
            <p className="mb-4">
              <strong>Timestamp:</strong>{" "}
              {new Date(selectedActivity.createdAt).toLocaleString()}
            </p>

            {/* Close Button */}
            <div className="text-right">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setShowActivityModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Report Details</h2>
            
            <p><strong>Reporter:</strong> {selectedReport.reporter?.username || "Unknown"}</p>
            <p><strong>Status:</strong> {selectedReport.status}</p>
            <p><strong>Reason:</strong> {selectedReport.reason}</p>
            <p><strong>Target Type:</strong> {selectedReport.target_type}</p>

            {selectedReport.target && (
              <div className="mt-4 p-2 border rounded bg-gray-50">
                <h3 className="font-semibold">Target Details</h3>
                {selectedReport.target_type === "user" && (
                  <>
                    <p><strong>Username:</strong> {selectedReport.target.username}</p>
                    <p><strong>Email:</strong> {selectedReport.target.email}</p>
                    <p><strong>Role:</strong> {selectedReport.target.role}</p>
                    <p><strong>Status:</strong> {selectedReport.target.status}</p>
                  </>
                )}
                {selectedReport.target_type === "post" && (
                  <>
                    <p><strong>Author:</strong> {selectedReport.target.author_id?.username}</p>
                    <p><strong>Content:</strong> {selectedReport.target.content}</p>
                    <p><strong>Media URL:</strong> {selectedReport.target.media_url}</p>
                    <p><strong>Visibility:</strong> {selectedReport.target.visibility}</p>
                  </>
                )}
                {selectedReport.target_type === "comment" && (
                  <>
                    <p><strong>Author:</strong> {selectedReport.target.author_id?.username}</p>
                    <p><strong>Content:</strong> {selectedReport.target.content}</p>
                  </>
                )}
                {selectedReport.target_type === "media" && (
                  <>
                    <p><strong>Uploader:</strong> {selectedReport.target.uploader_id?.username}</p>
                    <p><strong>URL:</strong> {selectedReport.target.url}</p>
                    <p><strong>Type:</strong> {selectedReport.target.type}</p>
                  </>
                )}
              </div>
            )}
            <div className="mt-4 text-right">
              <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setShowReportModal(false)}
              >
              Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Details Modal */}
{showNotificationModal && selectedNotification && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg relative">
      {/* Header */}
      <div className="flex justify-between items-center border-b p-4">
        <h2 className="text-xl font-bold text-gray-800">Notification Details</h2>
        <button
          onClick={() => setShowNotificationModal(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Notification Type */}
        <div>
          <h3 className="text-sm font-medium text-gray-500">Type</h3>
          <p className="text-gray-800 capitalize mt-1">
            {selectedNotification.type}
          </p>
        </div>

        {/* Read Status */}
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <p
            className={`mt-1 inline-flex items-center px-2 py-1 rounded text-sm ${
              selectedNotification.read
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {selectedNotification.read ? "Read" : "Unread"}
          </p>
        </div>

        {/* User ID */}
        <div>
          <h3 className="text-sm font-medium text-gray-500">Target User</h3>
          <p className="text-gray-800 break-all mt-1">
            {selectedNotification.user_id?._id ||
              selectedNotification.user_id ||
              "N/A"}
          </p>
        </div>

        {/* Sender */}
        <div>
          <h3 className="text-sm font-medium text-gray-500">Sender</h3>
          {selectedNotification.sender_id ? (
            <div className="flex items-center mt-2 space-x-3">
              {selectedNotification.sender_id.profile_picture ? (
                <img
                  src={selectedNotification.sender_id.profile_picture}
                  alt={selectedNotification.sender_id.username}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {selectedNotification.sender_id.username
                      ?.charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-800">
                  {selectedNotification.sender_id.username}
                </p>
                <p className="text-sm text-gray-500">
                  ID: {selectedNotification.sender_id._id}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 mt-1">System Notification</p>
          )}
        </div>

        {/* Target ID */}
        <div>
          <h3 className="text-sm font-medium text-gray-500">Target Object ID</h3>
          <p className="text-gray-800 break-all mt-1">
            {selectedNotification.target_id || "N/A"}
          </p>
        </div>

        {/* Created At */}
        <div>
          <h3 className="text-sm font-medium text-gray-500">Created At</h3>
          <p className="text-gray-800 mt-1">
            {new Date(selectedNotification.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end items-center gap-3 border-t p-4">
        {/* Mark Read / Unread */}
        <button
          onClick={() =>
            updateNotification(selectedNotification._id, {
              read: !selectedNotification.read,
            })
          }
          className={`px-4 py-2 rounded ${
            selectedNotification.read
              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          {selectedNotification.read ? "Mark as Unread" : "Mark as Read"}
        </button>

        {/* Delete */}
        <button
          onClick={() => {
            if (window.confirm("Delete this notification?")) {
              deleteNotification(selectedNotification._id);
              setShowNotificationModal(false);
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>

        {/* Close */}
        <button
          onClick={() => setShowNotificationModal(false)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default AdminPanel;