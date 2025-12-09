import React, { useState, useEffect } from "react";
import api from "../lib/axios";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalReports: 0,
    pendingReports: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    recentActivity: []
  });

  // Users State
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");

  // Reports State
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [reportFilter, setReportFilter] = useState("all");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");

  // Content State
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [contentFilter, setContentFilter] = useState("all");

  // Selection State
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState("post");

  // Modal States
  const [showUserModal, setShowUserModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form States
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("7");

  // Add axios interceptor for authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Fetch Dashboard Stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [usersRes, postsRes, reportsRes, activityRes] = await Promise.all([
        api.get("/users"),
        api.get("/posts"),
        api.get("/reports"),
        api.get("/activity-logs")
      ]);

      const usersData = usersRes.data;
      const postsData = postsRes.data;
      const reportsData = reportsRes.data;
      const activityData = activityRes.data;

      const totalUsers = usersData.length;
      const activeUsers = usersData.filter(u => u.status === "active").length;
      const suspendedUsers = usersData.filter(u => u.status === "suspended").length;
      const pendingReports = reportsData.filter(r => r.status === "pending").length;

      setStats({
        totalUsers,
        totalPosts: postsData.length,
        totalReports: reportsData.length,
        pendingReports,
        activeUsers,
        suspendedUsers,
        recentActivity: activityData.slice(0, 5).map(activity => ({
          ...activity,
          user_id: activity.user_id?._id || activity.user_id
        }))
      });

      setUsers(usersData);
      setFilteredUsers(usersData);
      setPosts(postsData);
      setReports(reportsData);
      setFilteredReports(reportsData);

      // Fetch comments
      const commentsRes = await api.get("/comments");
      setComments(commentsRes.data);

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      alert("Error fetching data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch User Details with all related data
  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      
      // Fetch user data
      const userRes = await api.get(`/users/${userId}`);
      const user = userRes.data;
      
      // Fetch profile data
      let profile = {};
      try {
        const profileRes = await api.get(`/profiles`);
        const userProfile = profileRes.data.find(p => p.user_id === userId);
        if (userProfile) {
          profile = userProfile;
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }

      // Fetch user's posts
      let userPosts = [];
      try {
        const postsRes = await api.get("/posts");
        userPosts = postsRes.data.filter(post => post.author_id === userId);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }

      // Fetch user's comments
      let userComments = [];
      try {
        const commentsRes = await api.get("/comments");
        userComments = commentsRes.data.filter(comment => comment.author_id === userId);
      } catch (error) {
        console.error("Error fetching user comments:", error);
      }

      // Fetch reports against this user
      let userReports = [];
      try {
        const reportsRes = await api.get("/reports");
        userReports = reportsRes.data.filter(report => 
          (report.target_type === "user" && report.target_id === userId) ||
          (report.target_type === "post" && userPosts.some(post => post._id === report.target_id)) ||
          (report.target_type === "comment" && userComments.some(comment => comment._id === report.target_id))
        );
      } catch (error) {
        console.error("Error fetching user reports:", error);
      }

      // Fetch user's activity
      let userActivity = [];
      try {
        const activityRes = await api.get("/activity-logs");
        userActivity = activityRes.data.filter(activity => activity.user_id === userId);
      } catch (error) {
        console.error("Error fetching user activity:", error);
      }

      setSelectedUser({
        ...user,
        profile,
        posts: userPosts,
        comments: userComments,
        reports: userReports,
        activity: userActivity.slice(0, 10) // Show last 10 activities
      });

      setShowUserModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      alert("Error fetching user details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Report Details with all related data
  const fetchReportDetails = async (reportId) => {
    try {
      setLoading(true);
      
      // Fetch report data
      const reportRes = await api.get(`/reports/${reportId}`);
      const report = reportRes.data;

      // Fetch reporter info
      let reporter = {};
      let reporterProfile = {};
      try {
        const reporterRes = await api.get(`/users/${report.reporter_id}`);
        reporter = reporterRes.data;
        
        // Try to get reporter profile
        const profilesRes = await api.get("/profiles");
        const foundProfile = profilesRes.data.find(p => p.user_id === report.reporter_id);
        if (foundProfile) {
          reporterProfile = foundProfile;
        }
      } catch (error) {
        console.error("Error fetching reporter:", error);
      }

      // Fetch target info based on type
      let targetData = null;
      let targetUser = null;
      let targetProfile = {};
      
      try {
        if (report.target_type === "user") {
          const targetRes = await api.get(`/users/${report.target_id}`);
          targetUser = targetRes.data;
          targetData = { type: "user", data: targetUser };
          
          // Get target profile
          const profilesRes = await api.get("/profiles");
          const foundProfile = profilesRes.data.find(p => p.user_id === report.target_id);
          if (foundProfile) {
            targetProfile = foundProfile;
          }
        } 
        else if (report.target_type === "post") {
          const postRes = await api.get(`/posts/${report.target_id}`);
          const post = postRes.data;
          targetData = { type: "post", data: post };
          
          // Get post author
          const authorRes = await api.get(`/users/${post.author_id}`);
          targetUser = authorRes.data;
          
          // Get author profile
          const profilesRes = await api.get("/profiles");
          const foundProfile = profilesRes.data.find(p => p.user_id === post.author_id);
          if (foundProfile) {
            targetProfile = foundProfile;
          }
        }
        else if (report.target_type === "comment") {
          const commentRes = await api.get(`/comments/${report.target_id}`);
          const comment = commentRes.data;
          targetData = { type: "comment", data: comment };
          
          // Get comment author
          const authorRes = await api.get(`/users/${comment.author_id}`);
          targetUser = authorRes.data;
          
          // Get author profile
          const profilesRes = await api.get("/profiles");
          const foundProfile = profilesRes.data.find(p => p.user_id === comment.author_id);
          if (foundProfile) {
            targetProfile = foundProfile;
          }
        }
      } catch (error) {
        console.error("Error fetching target data:", error);
      }

      setSelectedReport({
        ...report,
        reporter: { ...reporter, profile: reporterProfile },
        targetUser: { ...targetUser, profile: targetProfile },
        targetData
      });

      setShowReportModal(true);
    } catch (error) {
      console.error("Error fetching report details:", error);
      alert("Error fetching report details");
    } finally {
      setLoading(false);
    }
  };

  // Filter Users
  const filterUsers = () => {
    let filtered = [...users];

    // Apply status filter
    if (userFilter !== "all") {
      if (userFilter === "admin" || userFilter === "moderator") {
        filtered = filtered.filter(user => user.role === userFilter);
      } else {
        filtered = filtered.filter(user => user.status === userFilter);
      }
    }

    // Apply search filter
    if (userSearch.trim()) {
      const searchTerm = userSearch.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  // Filter Reports
  const filterReports = () => {
    let filtered = [...reports];

    // Apply status filter
    if (reportFilter !== "all") {
      filtered = filtered.filter(report => report.status === reportFilter);
    }

    // Apply type filter
    if (reportTypeFilter !== "all") {
      filtered = filtered.filter(report => report.target_type === reportTypeFilter);
    }

    setFilteredReports(filtered);
  };

  // Update User Status
  const updateUserStatus = async (userId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this user?`)) {
      return;
    }

    try {
      await api.put(`/users/${userId}`, { status });
      
      // Update local state
      const updatedUsers = users.map(user => 
        user._id === userId ? { ...user, status } : user
      );
      setUsers(updatedUsers);
      filterUsers();
      
      if (selectedUser?._id === userId) {
        setSelectedUser({ ...selectedUser, status });
      }

      // Log activity
      await api.post("/activity-logs", {
        user_id: localStorage.getItem("userId") || "admin",
        action: "other",
        target_id: userId
      });

      alert(`User ${status} successfully`);
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status");
    }
  };

  // Update Report Status
  const updateReportStatus = async (reportId, status) => {
    try {
      await api.put(`/reports/${reportId}`, { status });
      
      // Update local state
      const updatedReports = reports.map(report =>
        report._id === reportId ? { ...report, status } : report
      );
      setReports(updatedReports);
      filterReports();
      
      if (selectedReport?._id === reportId) {
        setSelectedReport({ ...selectedReport, status });
      }

      // Log activity
      await api.post("/activity-logs", {
        user_id: localStorage.getItem("userId") || "admin",
        action: "other",
        target_id: reportId
      });

      alert(`Report marked as ${status}`);
    } catch (error) {
      console.error("Error updating report status:", error);
      alert("Failed to update report status");
    }
  };

  // Delete Content
  const deleteContent = async (contentId, contentType) => {
    if (!window.confirm(`Are you sure you want to delete this ${contentType}?`)) {
      return;
    }

    try {
      if (contentType === "post") {
        await api.delete(`/posts/${contentId}`);
        
        // Update local state
        const updatedPosts = posts.filter(post => post._id !== contentId);
        setPosts(updatedPosts);
        
        // Also remove any reports for this post
        const updatedReports = reports.filter(report => 
          !(report.target_type === "post" && report.target_id === contentId)
        );
        setReports(updatedReports);
        filterReports();
      } 
      else if (contentType === "comment") {
        await api.delete(`/comments/${contentId}`);
        
        // Update local state
        const updatedComments = comments.filter(comment => comment._id !== contentId);
        setComments(updatedComments);
        
        // Also remove any reports for this comment
        const updatedReports = reports.filter(report => 
          !(report.target_type === "comment" && report.target_id === contentId)
        );
        setReports(updatedReports);
        filterReports();
      }

      // Log activity
      await api.post("/activity-logs", {
        user_id: localStorage.getItem("userId") || "admin",
        action: "deleted_post",
        target_id: contentId
      });

      setShowDeleteModal(false);
      alert(`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting ${contentType}:`, error);
      alert(`Failed to delete ${contentType}`);
    }
  };

  // Ban User with Reason
  const banUserWithReason = async () => {
    if (!banReason.trim()) {
      alert("Please provide a reason for banning");
      return;
    }

    try {
      const userId = selectedUser._id;
      await api.put(`/users/${userId}`, { 
        status: "suspended" 
      });

      // Log activity
      await api.post("/activity-logs", {
        user_id: localStorage.getItem("userId") || "admin",
        action: "other",
        target_id: userId
      });

      // Update local state
      const updatedUsers = users.map(user => 
        user._id === userId ? { ...user, status: "suspended" } : user
      );
      setUsers(updatedUsers);
      filterUsers();
      
      if (selectedUser) {
        setSelectedUser({ ...selectedUser, status: "suspended" });
      }

      // Send system notification
      await api.post("/notifications", {
        user_id: userId,
        type: "system",
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

  // Export Data
  const exportData = async (type) => {
    try {
      let data, filename;
      
      if (type === "users") {
        data = users;
        filename = `users_export_${new Date().toISOString().split('T')[0]}.json`;
      } else if (type === "reports") {
        data = reports;
        filename = `reports_export_${new Date().toISOString().split('T')[0]}.json`;
      } else if (type === "posts") {
        data = posts;
        filename = `posts_export_${new Date().toISOString().split('T')[0]}.json`;
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

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [userFilter, userSearch, users]);

  useEffect(() => {
    filterReports();
  }, [reportFilter, reportTypeFilter, reports]);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 1.5l-5-5m0 0l-5 5m5-5v12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Posts</p>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Pending Reports</p>
              <p className="text-2xl font-bold">{stats.pendingReports}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>
        <div className="p-6">
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">
                      User {activity.user_id} {activity.action?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activity.action?.includes('delete') ? 'bg-red-100 text-red-800' :
                    activity.action?.includes('create') ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {activity.action}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => exportData("users")}
              className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded"
            >
              Export Users Data
            </button>
            <button
              onClick={() => exportData("reports")}
              className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded"
            >
              Export Reports Data
            </button>
            <button
              onClick={() => exportData("posts")}
              className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded"
            >
              Export Posts Data
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Database</span>
              <span className="text-green-600 font-medium">● Online</span>
            </div>
            <div className="flex justify-between">
              <span>API Server</span>
              <span className="text-green-600 font-medium">● Online</span>
            </div>
            <div className="flex justify-between">
              <span>Storage</span>
              <span className="text-green-600 font-medium">● 65% Free</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Pending Reviews</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>User Reports</span>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">{stats.pendingReports}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Suspended Users</span>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">{stats.suspendedUsers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex space-x-4">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
              <option value="admin">Admins</option>
              <option value="moderator">Moderators</option>
            </select>
          </div>
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search users by username or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full p-2 pl-10 border rounded"
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Users ({filteredUsers.length})</h2>
          <button
            onClick={() => exportData("users")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Export Users
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">ID: {user._id?.substring(0, 8) || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
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
                      {user.status === 'active' ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowBanModal(true);
                            }}
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
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => updateUserStatus(user._id, 'deleted')}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex space-x-4">
            <select
              value={reportFilter}
              onChange={(e) => setReportFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Reports</option>
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
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
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
              <div className="text-sm text-gray-600 mb-3">
                <p>Target ID: {report.target_id?.substring(0, 12) || 'N/A'}...</p>
                <p>Reporter ID: {report.reporter_id?.substring(0, 12) || 'N/A'}...</p>
                <p className="mt-2">Created: {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => updateReportStatus(report._id, 'reviewed')}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Review
                </button>
                <button
                  onClick={() => updateReportStatus(report._id, 'resolved')}
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
        ))}
      </div>
    </div>
  );

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
          </div>
          <select
            value={contentFilter}
            onChange={(e) => setContentFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Content</option>
            <option value="recent">Recent</option>
            <option value="reported">Reported</option>
          </select>
        </div>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
            {selectedContentType === "post" ? "Posts" : "Comments"}
          </h2>
        </div>
        <div className="divide-y">
          {selectedContentType === "post" ? (
            posts.map((post) => (
              <div key={post._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Post ID: {post._id?.substring(0, 12) || 'N/A'}...</p>
                    <p className="mt-1">{post.content?.substring(0, 200)}...</p>
                    <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                      <span>❤️ {post.like_count || 0}</span>
                      <span>💬 {post.comment_count || 0}</span>
                      <span>↪️ {post.share_count || 0}</span>
                      <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedContent({ id: post._id, type: "post", data: post });
                        setShowContentModal(true);
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View
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
            ))
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Comment ID: {comment._id?.substring(0, 12) || 'N/A'}...</p>
                    <p className="mt-1">{comment.content?.substring(0, 200)}...</p>
                    <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                      <span>❤️ {comment.like_count || 0}</span>
                      <span>{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedContent({ id: comment._id, type: "comment", data: comment });
                        setShowContentModal(true);
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View
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
          )}
        </div>
      </div>
    </div>
  );

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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentActivity.map((activity, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.user_id?.substring(0, 12) || activity.user_id}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users, content, reports, and system activity</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            {["dashboard", "users", "reports", "content", "activity"].map((tab) => (
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
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">User Details</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="col-span-2">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-500">User ID</label>
                      <p className="text-sm text-gray-600">{selectedUser._id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Joined</label>
                      <p className="text-sm text-gray-600">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                      </p>
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
                            setShowUserModal(false);
                            setShowBanModal(true);
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
                    {selectedUser.role !== 'admin' && (
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this user permanently?")) {
                            updateUserStatus(selectedUser._id, 'deleted');
                            setShowUserModal(false);
                          }
                        }}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Delete User
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              {selectedUser.profile && Object.keys(selectedUser.profile).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Bio</label>
                      <p className="text-gray-700">{selectedUser.profile.bio || "No bio"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Location</label>
                      <p className="text-gray-700">{selectedUser.profile.location || "Not specified"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Website</label>
                      <p className="text-gray-700">{selectedUser.profile.website || "Not specified"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Interests</label>
                      <p className="text-gray-700">
                        {selectedUser.profile.interests?.join(", ") || "No interests"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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

              {/* Recent Activity */}
              {selectedUser.activity && selectedUser.activity.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-2">
                    {selectedUser.activity.map((activity, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between">
                          <span className="font-medium">{activity.action?.replace(/_/g, ' ')}</span>
                          <span className="text-sm text-gray-500">
                            {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                        {activity.target_id && (
                          <p className="text-sm text-gray-600 mt-1">Target: {activity.target_id.substring(0, 12)}...</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Report Details</h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Report Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Report Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <span className={`px-2 py-1 text-sm rounded-full ${
                        selectedReport.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedReport.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedReport.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Target Type</label>
                      <span className="px-2 py-1 text-sm bg-gray-100 text-gray-800 rounded">
                        {selectedReport.target_type}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-500">Reason</label>
                      <p className="p-3 bg-gray-50 rounded">{selectedReport.reason}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Created</label>
                      <p className="text-sm text-gray-600">
                        {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-sm text-gray-600">
                        {selectedReport.updatedAt ? new Date(selectedReport.updatedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reporter Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Reporter</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {selectedReport.reporter?.username?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{selectedReport.reporter?.username || 'Unknown User'}</p>
                        <p className="text-sm text-gray-500">{selectedReport.reporter?.email || 'N/A'}</p>
                        <p className="text-xs text-gray-500">ID: {selectedReport.reporter_id?.substring(0, 12)}...</p>
                      </div>
                    </div>
                    {selectedReport.reporter?.profile?.bio && (
                      <p className="mt-2 text-sm text-gray-600">{selectedReport.reporter.profile.bio}</p>
                    )}
                  </div>
                </div>

                {/* Target Info */}
                {selectedReport.targetUser && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Reported User</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-medium">
                            {selectedReport.targetUser.username?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{selectedReport.targetUser.username || 'Unknown User'}</p>
                          <p className="text-sm text-gray-500">{selectedReport.targetUser.email || 'N/A'}</p>
                          <div className="flex gap-2 mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              selectedReport.targetUser.status === 'active' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {selectedReport.targetUser.status}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              selectedReport.targetUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedReport.targetUser.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      {selectedReport.targetUser.profile?.bio && (
                        <p className="mt-2 text-sm text-gray-600">{selectedReport.targetUser.profile.bio}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Target Content */}
                {selectedReport.targetData && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Reported Content</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="mb-2">
                        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">
                          {selectedReport.targetData.type}
                        </span>
                      </div>
                      {selectedReport.targetData.type === 'post' && selectedReport.targetData.data && (
                        <>
                          <p className="mb-2">{selectedReport.targetData.data.content}</p>
                          {selectedReport.targetData.data.media_url && (
                            <img
                              src={selectedReport.targetData.data.media_url}
                              alt="Reported content"
                              className="max-w-full h-auto rounded mt-2"
                            />
                          )}
                        </>
                      )}
                      {selectedReport.targetData.type === 'comment' && selectedReport.targetData.data && (
                        <p>{selectedReport.targetData.data.content}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => updateReportStatus(selectedReport._id, 'reviewed')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Mark as Reviewed
                  </button>
                  <button
                    onClick={() => updateReportStatus(selectedReport._id, 'resolved')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Mark as Resolved
                  </button>
                  {selectedReport.target_type !== 'user' && (
                    <button
                      onClick={() => {
                        deleteContent(selectedReport.target_id, selectedReport.target_type);
                        setShowReportModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete Content
                    </button>
                  )}
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
                    onClick={banUserWithReason}
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

      {/* Delete Content Modal */}
      {showDeleteModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p className="mb-6">
                Are you sure you want to delete this {selectedContent.type}? This action cannot be undone.
              </p>
              {selectedContent.type === 'post' && selectedContent.data && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">{selectedContent.data.content?.substring(0, 100)}...</p>
                </div>
              )}
              {selectedContent.type === 'comment' && selectedContent.data && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">{selectedContent.data.content?.substring(0, 100)}...</p>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteContent(selectedContent.id, selectedContent.type)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;