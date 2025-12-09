import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  
  // Main states
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});

  // Profile & Search
  const [profiles, setProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [searchHistory, setSearchHistory] = useState([]);

  // Messages
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Follow System
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followRequests, setFollowRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Content Creation
  const [newPost, setNewPost] = useState({
    content: "",
    media_url: "",
    visibility: "public"
  });
  const [editingPost, setEditingPost] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [uploadedMedia, setUploadedMedia] = useState(null);

  // Modals & UI States
  const [reportData, setReportData] = useState({
    target_id: "",
    target_type: "",
    reason: ""
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Feed Filters
  const [feedFilter, setFeedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // =======================================================
  //               AUTHENTICATION & ACCOUNT
  // =======================================================

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      // Delete user's posts
      const userPosts = posts.filter(post => post.author_id === user._id);
      await Promise.all(
        userPosts.map(post => api.delete(`/posts/${post._id}`))
      );

      // Delete user's comments
      const allComments = Object.values(comments).flat();
      const userComments = allComments.filter(comment => comment.author_id === user._id);
      await Promise.all(
        userComments.map(comment => api.delete(`/comments/${comment._id}`))
      );

      // Delete user's likes
      const likesRes = await api.get("/likes");
      const userLikes = likesRes.data.filter(like => like.user_id === user._id);
      await Promise.all(
        userLikes.map(like => api.delete(`/likes/${like._id}`))
      );

      // Delete user's follows
      const followsRes = await api.get("/follows");
      const userFollows = followsRes.data.filter(
        follow => follow.follower_id === user._id || follow.followed_id === user._id
      );
      await Promise.all(
        userFollows.map(follow => api.delete(`/follows/${follow._id}`))
      );

      // Delete user's profile
      const profilesRes = await api.get("/profiles");
      const userProfile = profilesRes.data.find(p => p.user_id === user._id);
      if (userProfile) {
        await api.delete(`/profiles/${userProfile._id}`);
      }

      // Delete user
      await api.delete(`/users/${user._id}`);

      // Log activity
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "deleted_account",
        target_id: null
      });

      logout();
      toast.success("Account deleted successfully");
      navigate("/register");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  // =======================================================
  //               PROFILE & USER INTERACTIONS
  // =======================================================

  const fetchAllUsers = async () => {
    try {
      const res = await api.get("/users");
      setAllUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const res = await api.get("/profiles");
      setProfiles(res.data);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleEditProfile = async (profileData) => {
    try {
      const profilesRes = await api.get("/profiles");
      const userProfile = profilesRes.data.find(p => p.user_id === user._id);

      if (userProfile) {
        await api.put(`/profiles/${userProfile._id}`, profileData);
        toast.success("Profile updated successfully");
      } else {
        await api.post("/profiles", {
          user_id: user._id,
          ...profileData
        });
        toast.success("Profile created successfully");
      }

      // Log activity
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "updated_profile",
        target_id: user._id
      });

      fetchProfiles();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const fetchFollowData = async () => {
    if (!user) return;
    
    try {
      const [followsRes, usersRes, profilesRes] = await Promise.all([
        api.get("/follows"),
        api.get("/users"),
        api.get("/profiles")
      ]);
      
      const userFollowers = followsRes.data.filter(
        follow => follow.followed_id === user._id && follow.status === "accepted"
      );
      const userFollowing = followsRes.data.filter(
        follow => follow.follower_id === user._id && follow.status === "accepted"
      );
      const pendingRequests = followsRes.data.filter(
        follow => follow.followed_id === user._id && follow.status === "pending"
      );

      const users = usersRes.data;
      const profiles = profilesRes.data;

      const followersWithUsers = userFollowers.map(follow => {
        const follower = users.find(u => u._id === follow.follower_id);
        const followerProfile = profiles.find(p => p.user_id === follow.follower_id);

        return {
          ...follow,
          user: follower || {},
          profile: followerProfile || {}
        };
      });

      const followingWithUsers = userFollowing.map(follow => {
        const followed = users.find(u => u._id === follow.followed_id);
        const followedProfile = profiles.find(p => p.user_id === follow.followed_id);

        return {
          ...follow,
          user: followed || {},
          profile: followedProfile || {}
        };
      });

      setFollowers(followersWithUsers);
      setFollowing(followingWithUsers);
      setFollowRequests(pendingRequests);
    } catch (error) {
      console.error("Error fetching follow data:", error);
    }
  };

  const handleFollow = async (targetUserId, action = "follow") => {
    try {
      if (action === "follow") {
        await api.post("/follows", {
          follower_id: user._id,
          followed_id: targetUserId,
          status: "pending"
        });

        // Log activity
        await api.post("/activity-logs", {
          user_id: user._id,
          action: "followed_user",
          target_id: targetUserId
        });

        // Send notification
        await api.post("/notifications", {
          user_id: targetUserId,
          type: "follow_request",
          sender_id: user._id,
          target_id: user._id,
          read: false,
          message: `${user.username} wants to follow you`
        });

        toast.success("Follow request sent!");
      } else {
        // Unfollow
        const followsRes = await api.get("/follows");
        const followRecord = followsRes.data.find(
          follow => follow.follower_id === user._id && follow.followed_id === targetUserId
        );

        if (followRecord) {
          await api.delete(`/follows/${followRecord._id}`);

          // Log activity
          await api.post("/activity-logs", {
            user_id: user._id,
            action: "unfollowed_user",
            target_id: targetUserId
          });
        }
        toast.success("Unfollowed!");
      }

      fetchFollowData();
      fetchNotifications();
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleFollowRequest = async (requestId, action) => {
    try {
      if (action === "accept") {
        await api.put(`/follows/${requestId}`, { status: "accepted" });
        
        const followRes = await api.get(`/follows/${requestId}`);
        const follow = followRes.data;
        
        await api.post("/notifications", {
          user_id: follow.follower_id,
          type: "follow_accepted",
          sender_id: user._id,
          target_id: user._id,
          read: false,
          message: `${user.username} accepted your follow request`
        });
        toast.success("Follow request accepted!");
      } else {
        await api.delete(`/follows/${requestId}`);
        toast.success("Follow request rejected!");
      }

      fetchFollowData();
      fetchNotifications();
    } catch (error) {
      console.error("Error handling follow request:", error);
      toast.error("Failed to handle follow request");
    }
  };

  const handleSearchUsers = async (query) => {
    try {
      const usersRes = await api.get("/users");
      const filteredUsers = usersRes.data.filter(u =>
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      );
      
      // Fetch profiles for filtered users
      const profilesRes = await api.get("/profiles");
      const usersWithProfiles = filteredUsers.map(user => ({
        ...user,
        profile: profilesRes.data.find(p => p.user_id === user._id) || {}
      }));

      setSearchResults(prev => ({ ...prev, users: usersWithProfiles }));
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  // =======================================================
  //                    POSTS & CONTENT
  // =======================================================

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const postsRes = await api.get("/posts");
      const postsData = postsRes.data;

      // Fetch all related data in parallel
      const [usersRes, profilesRes, likesRes, sharesRes] = await Promise.all([
        api.get("/users"),
        api.get("/profiles"),
        api.get("/likes"),
        api.get("/shares")
      ]);

      const users = usersRes.data;
      const profiles = profilesRes.data;
      const likes = likesRes.data;
      const shares = sharesRes.data;

      const postsWithAuthors = postsData.map(post => {
        const author = users.find(u => u._id === post.author_id);
        const authorProfile = profiles.find(p => p.user_id === post.author_id);
        
        const userLike = likes.find(
          like => like.user_id === user?._id && 
                 like.target_id === post._id && 
                 like.target_type === "post"
        );

        const postShares = shares.filter(share => share.post_id === post._id);

        return {
          ...post,
          author: author || {},
          authorProfile: authorProfile || {},
          isLiked: !!userLike,
          likeId: userLike?._id,
          shares: postShares,
          shareCount: postShares.length
        };
      });

      setPosts(postsWithAuthors);
      applyFilters(postsWithAuthors);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async (userId) => {
    try {
      const postsRes = await api.get("/posts");
      const userPosts = postsRes.data.filter(post => post.author_id === userId);
      setFilteredPosts(userPosts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim() && !uploadedMedia) {
      toast.error("Please add some content or media");
      return;
    }

    try {
      let mediaUrl = newPost.media_url;
      
      if (uploadedMedia) {
        const formData = new FormData();
        formData.append("file", uploadedMedia);
        const mediaRes = await api.post("/media", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mediaUrl = mediaRes.data.url || mediaRes.data.media_url;
      }

      const postData = {
        author_id: user._id,
        content: newPost.content,
        media_url: mediaUrl,
        visibility: newPost.visibility,
        like_count: 0,
        comment_count: 0,
        share_count: 0
      };

      await api.post("/posts", postData);

      // Log activity
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "created_post",
        target_id: null
      });

      // Reset form
      setNewPost({
        content: "",
        media_url: "",
        visibility: "public"
      });
      setUploadedMedia(null);

      // Refresh posts
      fetchPosts();
      
      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  const handleUpdatePost = async (postId, content) => {
    try {
      await api.put(`/posts/${postId}`, { content });

      // Log activity
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "updated_post",
        target_id: postId
      });

      fetchPosts();
      setEditingPost(null);
      toast.success("Post updated successfully!");
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      // Delete related comments
      const commentsRes = await api.get("/comments");
      const postComments = commentsRes.data.filter(comment => comment.post_id === postId);
      
      await Promise.all(
        postComments.map(comment => api.delete(`/comments/${comment._id}`))
      );

      // Delete related likes
      const likesRes = await api.get("/likes");
      const postLikes = likesRes.data.filter(
        like => like.target_id === postId && like.target_type === "post"
      );
      
      await Promise.all(
        postLikes.map(like => api.delete(`/likes/${like._id}`))
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
      toast.success("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleSharePost = async (postId) => {
    try {
      await api.post("/shares", {
        user_id: user._id,
        post_id: postId
      });

      // Update post share count
      const post = posts.find(p => p._id === postId);
      if (post) {
        await api.put(`/posts/${postId}`, {
          share_count: (post.share_count || 0) + 1
        });
      }

      // Log activity
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "shared_post",
        target_id: postId
      });

      // Notify post owner
      if (post.author_id !== user._id) {
        await api.post("/notifications", {
          user_id: post.author_id,
          type: "share",
          sender_id: user._id,
          target_id: postId,
          read: false,
          message: `${user.username} shared your post`
        });
      }

      fetchPosts();
      fetchNotifications();
      toast.success("Post shared!");
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error("Failed to share post");
    }
  };

  const handleSearchPosts = async (query) => {
    try {
      const postsRes = await api.get("/posts");
      const filteredPosts = postsRes.data.filter(post =>
        post.content.toLowerCase().includes(query.toLowerCase())
      );
      
      // Enhance posts with author info
      const [usersRes, profilesRes] = await Promise.all([
        api.get("/users"),
        api.get("/profiles")
      ]);

      const users = usersRes.data;
      const profiles = profilesRes.data;

      const postsWithAuthors = filteredPosts.map(post => {
        const author = users.find(u => u._id === post.author_id);
        const authorProfile = profiles.find(p => p.user_id === post.author_id);
        
        return {
          ...post,
          author: author || {},
          authorProfile: authorProfile || {}
        };
      });

      setSearchResults(prev => ({ ...prev, posts: postsWithAuthors }));
    } catch (error) {
      console.error("Error searching posts:", error);
    }
  };

  // =======================================================
  //                      COMMENTS
  // =======================================================

  const fetchComments = async (postId) => {
    try {
      const [commentsRes, usersRes, profilesRes, likesRes] = await Promise.all([
        api.get("/comments"),
        api.get("/users"),
        api.get("/profiles"),
        api.get("/likes")
      ]);

      const postComments = commentsRes.data.filter(comment => comment.post_id === postId);
      const users = usersRes.data;
      const profiles = profilesRes.data;
      const likes = likesRes.data;

      const commentsWithAuthors = postComments.map(comment => {
        const author = users.find(u => u._id === comment.author_id);
        const authorProfile = profiles.find(p => p.user_id === comment.author_id);

        const userLike = likes.find(
          like => like.user_id === user?._id && 
                 like.target_id === comment._id && 
                 like.target_type === "comment"
        );

        // Fetch replies
        const replies = postComments.filter(c => c.parent_comment_id === comment._id);

        return {
          ...comment,
          author: author || {},
          authorProfile: authorProfile || {},
          isLiked: !!userLike,
          likeId: userLike?._id,
          replies: replies.map(reply => {
            const replyAuthor = users.find(u => u._id === reply.author_id);
            const replyAuthorProfile = profiles.find(p => p.user_id === reply.author_id);
            const replyUserLike = likes.find(
              like => like.user_id === user?._id && 
                     like.target_id === reply._id && 
                     like.target_type === "comment"
            );

            return {
              ...reply,
              author: replyAuthor || {},
              authorProfile: replyAuthorProfile || {},
              isLiked: !!replyUserLike,
              likeId: replyUserLike?._id
            };
          })
        };
      });

      // Filter out replies (they'll be nested under parent comments)
      const mainComments = commentsWithAuthors.filter(comment => !comment.parent_comment_id);

      setComments(prev => ({ ...prev, [postId]: mainComments }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async (postId, content, parentCommentId = null) => {
    try {
      const commentData = {
        post_id: postId,
        author_id: user._id,
        content,
        parent_comment_id: parentCommentId,
        like_count: 0
      };

      await api.post("/comments", commentData);

      // Update post comment count
      const post = posts.find(p => p._id === postId);
      if (post) {
        await api.put(`/posts/${postId}`, {
          comment_count: (post.comment_count || 0) + 1
        });
      }

      // Log activity
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "commented_post",
        target_id: postId
      });

      // Send notification if not own post
      if (post.author_id !== user._id) {
        await api.post("/notifications", {
          user_id: post.author_id,
          type: "comment",
          sender_id: user._id,
          target_id: postId,
          read: false,
          message: `${user.username} commented on your post`
        });
      }

      // If it's a reply, notify the parent comment author
      if (parentCommentId) {
        const commentsRes = await api.get("/comments");
        const parentComment = commentsRes.data.find(c => c._id === parentCommentId);
        
        if (parentComment && parentComment.author_id !== user._id) {
          await api.post("/notifications", {
            user_id: parentComment.author_id,
            type: "reply",
            sender_id: user._id,
            target_id: postId,
            read: false,
            message: `${user.username} replied to your comment`
          });
        }
      }

      // Refresh data
      fetchPosts();
      fetchComments(postId);
      fetchNotifications();
      
      // Clear input
      if (parentCommentId) {
        setReplyInputs(prev => ({ ...prev, [parentCommentId]: "" }));
      } else {
        setCommentInputs(prev => ({ ...prev, [postId]: "" }));
      }
      
      toast.success(parentCommentId ? "Reply added!" : "Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleUpdateComment = async (commentId, content) => {
    try {
      await api.put(`/comments/${commentId}`, { content });

      // Log activity
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "updated_comment",
        target_id: commentId
      });

      // Refresh comments for the post
      const commentsRes = await api.get("/comments");
      const comment = commentsRes.data.find(c => c._id === commentId);
      if (comment) {
        fetchComments(comment.post_id);
      }

      setEditingComment(null);
      toast.success("Comment updated successfully!");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      // Delete related likes
      const likesRes = await api.get("/likes");
      const commentLikes = likesRes.data.filter(
        like => like.target_id === commentId && like.target_type === "comment"
      );
      
      await Promise.all(
        commentLikes.map(like => api.delete(`/likes/${like._id}`))
      );

      // Delete comment
      await api.delete(`/comments/${commentId}`);

      // Update post comment count
      const commentsRes = await api.get("/comments");
      const comment = commentsRes.data.find(c => c._id === commentId);
      if (comment) {
        const post = posts.find(p => p._id === comment.post_id);
        if (post) {
          await api.put(`/posts/${comment.post_id}`, {
            comment_count: Math.max(0, (post.comment_count || 0) - 1)
          });
        }
      }

      // Log activity
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "deleted_comment",
        target_id: commentId
      });

      // Refresh posts and comments
      fetchPosts();
      if (comment) {
        fetchComments(comment.post_id);
      }
      
      toast.success("Comment deleted successfully!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  // =======================================================
  //                      LIKES
  // =======================================================

  const handleLike = async (targetId, targetType) => {
    try {
      // Check if already liked
      const likesRes = await api.get("/likes");
      const existingLike = likesRes.data.find(
        like => like.user_id === user._id && 
               like.target_id === targetId && 
               like.target_type === targetType
      );

      if (existingLike) {
        // Unlike
        await api.delete(`/likes/${existingLike._id}`);
        
        // Decrease like count
        if (targetType === "post") {
          const post = posts.find(p => p._id === targetId);
          if (post) {
            await api.put(`/posts/${targetId}`, {
              like_count: Math.max(0, (post.like_count || 0) - 1)
            });
          }
        } else if (targetType === "comment") {
          const allComments = Object.values(comments).flat();
          const comment = allComments.find(c => c._id === targetId);
          if (comment) {
            await api.put(`/comments/${targetId}`, {
              like_count: Math.max(0, (comment.like_count || 0) - 1)
            });
          }
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
          const post = posts.find(p => p._id === targetId);
          if (post) {
            await api.put(`/posts/${targetId}`, {
              like_count: (post.like_count || 0) + 1
            });

            // Send notification if not own post
            if (post.author_id !== user._id) {
              await api.post("/notifications", {
                user_id: post.author_id,
                type: "like",
                sender_id: user._id,
                target_id: targetId,
                read: false,
                message: `${user.username} liked your post`
              });
            }
          }
        } else if (targetType === "comment") {
          const allComments = Object.values(comments).flat();
          const comment = allComments.find(c => c._id === targetId);
          if (comment) {
            await api.put(`/comments/${targetId}`, {
              like_count: (comment.like_count || 0) + 1
            });

            // Send notification if not own comment
            if (comment.author_id !== user._id) {
              await api.post("/notifications", {
                user_id: comment.author_id,
                type: "like",
                sender_id: user._id,
                target_id: targetId,
                read: false,
                message: `${user.username} liked your comment`
              });
            }
          }
        }
      }

      // Log activity
      await api.post("/activity-logs", {
        user_id: user._id,
        action: targetType === "post" ? "liked_post" : "liked_comment",
        target_id: targetId
      });

      // Refresh data
      fetchPosts();
      fetchNotifications();
      
      // Refresh comments if needed
      if (targetType === "comment") {
        const allComments = Object.values(comments).flat();
        const comment = allComments.find(c => c._id === targetId);
        if (comment) {
          const postsWithComment = posts.filter(p => 
            Object.keys(comments).includes(p._id)
          );
          postsWithComment.forEach(post => {
            if (comments[post._id]?.some(c => c._id === targetId)) {
              fetchComments(post._id);
            }
          });
        }
      }
      
    } catch (error) {
      console.error("Error handling like:", error);
      toast.error("Failed to like");
    }
  };

  // =======================================================
  //                      FEED & NOTIFICATIONS
  // =======================================================

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const notificationsRes = await api.get("/notifications");
      const userNotifications = notificationsRes.data
        .filter(n => n.user_id === user._id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Fetch sender info for each notification
      const [usersRes, profilesRes] = await Promise.all([
        api.get("/users"),
        api.get("/profiles")
      ]);

      const users = usersRes.data;
      const profiles = profilesRes.data;

      const notificationsWithSenders = userNotifications.map(notification => {
        if (notification.sender_id) {
          const sender = users.find(u => u._id === notification.sender_id);
          const senderProfile = profiles.find(p => p.user_id === notification.sender_id);

          return {
            ...notification,
            sender: sender || {},
            senderProfile: senderProfile || {}
          };
        }
        return notification;
      });

      setNotifications(notificationsWithSenders);
      const unread = notificationsWithSenders.filter(n => !n.read).length;
      setUnreadNotifications(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}`, { read: true });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(notification =>
          api.put(`/notifications/${notification._id}`, { read: true })
        )
      );
      fetchNotifications();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const applyFilters = (postsList) => {
    let filtered = [...postsList];

    // Apply feed filter
    if (feedFilter === "following") {
      const followingIds = following.map(f => f.followed_id);
      filtered = filtered.filter(post => followingIds.includes(post.author_id));
    } else if (feedFilter === "trending") {
      filtered.sort((a, b) => {
        const scoreA = (a.like_count || 0) + ((a.comment_count || 0) * 2) + ((a.share_count || 0) * 3);
        const scoreB = (b.like_count || 0) + ((b.comment_count || 0) * 2) + ((b.share_count || 0) * 3);
        return scoreB - scoreA;
      });
    }

    // Apply sort
    if (sortBy === "latest") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === "popular") {
      filtered.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
    }

    setFilteredPosts(filtered);
  };

  // =======================================================
  //                      MESSAGES
  // =======================================================

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      const [messagesRes, usersRes, profilesRes] = await Promise.all([
        api.get("/messages"),
        api.get("/users"),
        api.get("/profiles")
      ]);

      const userMessages = messagesRes.data.filter(
        msg => msg.sender_id === user._id || msg.receiver_id === user._id
      );

      // Group messages by conversation partner
      const conversationsMap = new Map();
      
      userMessages.forEach(message => {
        const partnerId = message.sender_id === user._id ? message.receiver_id : message.sender_id;
        
        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, {
            partnerId,
            messages: [],
            lastMessage: message,
            unreadCount: 0
          });
        }
        
        const conversation = conversationsMap.get(partnerId);
        conversation.messages.push(message);
        
        if (new Date(message.created_at) > new Date(conversation.lastMessage.created_at)) {
          conversation.lastMessage = message;
        }
        
        if (message.receiver_id === user._id && !message.read) {
          conversation.unreadCount++;
        }
      });

      const users = usersRes.data;
      const profiles = profilesRes.data;

      const conversationsWithPartners = Array.from(conversationsMap.values()).map(conv => {
        const partner = users.find(u => u._id === conv.partnerId);
        const partnerProfile = profiles.find(p => p.user_id === conv.partnerId);

        return {
          ...conv,
          partner: partner || {},
          partnerProfile: partnerProfile || {}
        };
      });

      const sortedConversations = conversationsWithPartners.sort((a, b) => 
        new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
      );

      setConversations(sortedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      const messagesRes = await api.get("/messages");
      const conversationMessages = messagesRes.data.filter(
        msg => (msg.sender_id === user._id && msg.receiver_id === partnerId) ||
               (msg.sender_id === partnerId && msg.receiver_id === user._id)
      ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      setMessages(conversationMessages);

      // Mark received messages as read
      const unreadMessages = conversationMessages.filter(
        msg => msg.receiver_id === user._id && !msg.read
      );

      await Promise.all(
        unreadMessages.map(msg => 
          api.put(`/messages/${msg._id}`, { read: true, status: "seen" })
        )
      );

      fetchConversations();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) {
      toast.error("Please enter a message");
      return;
    }

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
        read: false,
        message: `${user.username} sent you a message`
      });

      fetchNotifications();
      toast.success("Message sent!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleStartConversation = (partnerId) => {
    const conversation = conversations.find(c => c.partnerId === partnerId);
    if (conversation) {
      setActiveConversation(conversation);
      setShowMessagesModal(true);
      fetchMessages(partnerId);
    } else {
      // Start new conversation
      const partner = allUsers.find(u => u._id === partnerId);
      const partnerProfile = profiles.find(p => p.user_id === partnerId);
      
      setActiveConversation({
        partnerId,
        partner: partner || {},
        partnerProfile: partnerProfile || {}
      });
      setShowMessagesModal(true);
      setMessages([]);
    }
  };

  // =======================================================
  //                      REPORTS
  // =======================================================

  const handleReport = async () => {
    if (!reportData.reason.trim()) {
      toast.error("Please provide a reason for reporting");
      return;
    }

    try {
      await api.post("/reports", {
        reporter_id: user._id,
        target_id: reportData.target_id,
        target_type: reportData.target_type,
        reason: reportData.reason,
        status: "pending"
      });

      // Log activity
      await api.post("/activity-logs", {
        user_id: user._id,
        action: "reported_content",
        target_id: reportData.target_id
      });

      toast.success("Report submitted!");
      setShowReportModal(false);
      setReportData({
        target_id: "",
        target_type: "",
        reason: ""
      });
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report");
    }
  };

  // =======================================================
  //                      MEDIA
  // =======================================================

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only images (JPEG, PNG, GIF) and videos (MP4) are allowed");
      return;
    }

    setUploadedMedia(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setNewPost(prev => ({ ...prev, media_url: previewUrl }));
    toast.success("Media uploaded!");
  };

  // =======================================================
  //                      SEARCH HISTORY
  // =======================================================

  const fetchSearchHistory = async () => {
    if (!user) return;
    
    try {
      const searchHistoryRes = await api.get("/search-histories");
      const userSearchHistory = searchHistoryRes.data
        .filter(history => history.user_id === user._id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      setSearchHistory(userSearchHistory);
    } catch (error) {
      console.error("Error fetching search history:", error);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({ users: [], posts: [] });
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

      // Search users and posts
      await Promise.all([
        handleSearchUsers(query),
        handleSearchPosts(query)
      ]);

      setShowSearchModal(true);
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Search failed");
    }
  };

  const handleClearSearchHistory = async () => {
    if (!window.confirm("Clear all search history?")) return;

    try {
      const searchHistoryRes = await api.get("/search-histories");
      const userSearchHistory = searchHistoryRes.data.filter(
        history => history.user_id === user._id
      );

      await Promise.all(
        userSearchHistory.map(history => 
          api.delete(`/search-histories/${history._id}`)
        )
      );

      setSearchHistory([]);
      toast.success("Search history cleared!");
    } catch (error) {
      console.error("Error clearing search history:", error);
      toast.error("Failed to clear search history");
    }
  };

  // =======================================================
  //                      HELPER FUNCTIONS
  // =======================================================

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));

    if (!comments[postId] && !expandedComments[postId]) {
      fetchComments(postId);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // =======================================================
  //                      INITIALIZATION
  // =======================================================

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchPosts(),
        fetchAllUsers(),
        fetchProfiles(),
        fetchNotifications(),
        fetchSearchHistory(),
        fetchConversations(),
        fetchFollowData()
      ]);
    }
  }, [user]);

  useEffect(() => {
    applyFilters(posts);
  }, [posts, feedFilter, sortBy, following]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        setSearchResults({ users: [], posts: [] });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =======================================================
  //                      RENDER COMPONENTS
  // =======================================================

  // Navigation Bar Component
  const renderNavigationBar = () => (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              SocialApp
            </Link>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, people, or topics..."
                className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-3 top-2.5 text-gray-500">
                🔍
              </button>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="p-2 rounded-full hover:bg-gray-100 text-gray-700">
              🏠
            </Link>
            
            <button
              onClick={() => setShowMessagesModal(true)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700 relative"
            >
              💬
              {conversations.some(c => c.unreadCount > 0) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setShowNotificationsModal(true)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700 relative"
            >
              🔔
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
            >
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
              <span className="font-medium hidden md:inline">{user?.username}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  // Create Post Component
  const renderCreatePost = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-start gap-3 mb-4">
        {user?.profile?.profile_picture ? (
          <img
            src={user.profile.profile_picture}
            alt={user.username}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1">
          <textarea
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            placeholder="What's on your mind?"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          />
        </div>
      </div>

      {/* Media Preview */}
      {newPost.media_url && (
        <div className="mb-4 relative">
          {newPost.media_url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
            <img
              src={newPost.media_url}
              alt="Preview"
              className="max-w-full h-64 object-cover rounded-lg"
            />
          ) : (
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-600">Media attached</p>
            </div>
          )}
          <button
            onClick={() => setNewPost({ ...newPost, media_url: "" })}
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Media</span>
          </button>
          
          <select
            value={newPost.visibility}
            onChange={(e) => setNewPost({ ...newPost, visibility: e.target.value })}
            className="border rounded-lg px-2 py-1 text-sm"
          >
            <option value="public">🌍 Public</option>
            <option value="friends">👥 Friends</option>
            <option value="private">🔒 Private</option>
          </select>
        </div>

        <button
          onClick={handleCreatePost}
          disabled={!newPost.content.trim() && !newPost.media_url}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Post
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleMediaUpload}
        accept="image/*,video/*"
        className="hidden"
      />
    </div>
  );

  // Feed Controls Component
  const renderFeedControls = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFeedFilter("all")}
            className={`px-4 py-2 rounded-full ${
              feedFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setFeedFilter("following")}
            className={`px-4 py-2 rounded-full ${
              feedFilter === "following" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Following
          </button>
          <button
            onClick={() => setFeedFilter("trending")}
            className={`px-4 py-2 rounded-full ${
              feedFilter === "trending" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Trending
          </button>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-full px-4 py-2 bg-gray-50"
        >
          <option value="latest">Latest</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>
    </div>
  );

  // Single Post Component
  const renderPost = (post) => (
    <div key={post._id} className="bg-white rounded-lg shadow mb-6">
      {/* Post Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleViewProfile(post.author_id)}
              className="flex items-center space-x-3"
            >
              {post.authorProfile?.profile_picture ? (
                <img
                  src={post.authorProfile.profile_picture}
                  alt={post.author?.username}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {post.author?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="font-medium hover:text-blue-600">
                  {post.author?.username}
                </div>
                <p className="text-sm text-gray-500">
                  {formatTime(post.created_at)} • {post.visibility}
                </p>
              </div>
            </button>
          </div>
          
          {/* Post Actions Menu */}
          <div className="relative group">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              ⋮
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {user?._id === post.author_id ? (
                <>
                  <button
                    onClick={() => setEditingPost(post)}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Edit Post
                  </button>
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Delete Post
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleFollow(post.author_id, following.some(f => f.followed_id === post.author_id) ? "unfollow" : "follow")}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    {following.some(f => f.followed_id === post.author_id) ? "Unfollow" : "Follow"}
                  </button>
                  <button
                    onClick={() => {
                      setReportData({
                        target_id: post._id,
                        target_type: "post",
                        reason: ""
                      });
                      setShowReportModal(true);
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Report Post
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
        
        {post.media_url && (
          <div className="mt-4">
            {post.media_url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
              <img
                src={post.media_url}
                alt="Post media"
                className="rounded-lg max-w-full h-auto"
              />
            ) : (
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-600">Media file: {post.media_url}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="px-4 py-2 border-t border-b text-sm text-gray-500 flex justify-between">
        <div className="flex space-x-4">
          <span>{post.like_count || 0} likes</span>
          <span>{post.comment_count || 0} comments</span>
          <span>{post.share_count || 0} shares</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="p-2 flex border-b">
        <button
          onClick={() => handleLike(post._id, "post")}
          className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg ${
            post.isLiked ? "text-red-600" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <span className="text-lg">{post.isLiked ? "❤️" : "🤍"}</span>
          <span>Like</span>
        </button>
        <button
          onClick={() => toggleComments(post._id)}
          className="flex-1 flex items-center justify-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <span className="text-lg">💬</span>
          <span>Comment</span>
        </button>
        <button
          onClick={() => handleSharePost(post._id)}
          className="flex-1 flex items-center justify-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <span className="text-lg">↪️</span>
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {expandedComments[post._id] && (
        <div className="p-4">
          {/* Comment Input */}
          <div className="flex gap-2 mb-4">
            {user?.profile?.profile_picture ? (
              <img
                src={user.profile.profile_picture}
                alt={user.username}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={commentInputs[post._id] || ""}
                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                placeholder="Write a comment..."
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="2"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleAddComment(post._id, commentInputs[post._id])}
                  disabled={!commentInputs[post._id]?.trim()}
                  className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          {comments[post._id]?.length > 0 ? (
            <div className="space-y-4">
              {comments[post._id].map((comment) => (
                <div key={comment._id} className="space-y-3">
                  {/* Main Comment */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewProfile(comment.author_id)}
                      className="flex-shrink-0"
                    >
                      {comment.authorProfile?.profile_picture ? (
                        <img
                          src={comment.authorProfile.profile_picture}
                          alt={comment.author?.username}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 text-sm">
                            {comment.author?.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <button
                              onClick={() => handleViewProfile(comment.author_id)}
                              className="font-medium text-sm hover:text-blue-600"
                            >
                              {comment.author?.username}
                            </button>
                            {editingComment?._id === comment._id ? (
                              <div className="mt-2">
                                <textarea
                                  value={editingComment.content}
                                  onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                                  className="w-full p-2 border rounded"
                                  rows="2"
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => handleUpdateComment(comment._id, editingComment.content)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingComment(null)}
                                    className="px-3 py-1 bg-gray-200 rounded text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-800 text-sm mt-1">{comment.content}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {user?._id === comment.author_id ? (
                              <>
                                <button
                                  onClick={() => setEditingComment(comment)}
                                  className="text-xs text-gray-500 hover:text-blue-600"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(comment._id)}
                                  className="text-xs text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleLike(comment._id, "comment")}
                                  className={`text-xs ${comment.isLiked ? "text-red-600" : "text-gray-500 hover:text-red-600"}`}
                                >
                                  Like
                                </button>
                                <button
                                  onClick={() => {
                                    setReportData({
                                      target_id: comment._id,
                                      target_type: "comment",
                                      reason: ""
                                    });
                                    setShowReportModal(true);
                                  }}
                                  className="text-xs text-gray-500 hover:text-red-600"
                                >
                                  Report
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>{formatTime(comment.created_at)}</span>
                          <span>❤️ {comment.like_count || 0} likes</span>
                          <button
                            onClick={() => setReplyInputs(prev => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                            className="hover:text-blue-600"
                          >
                            Reply
                          </button>
                        </div>
                      </div>

                      {/* Reply Input */}
                      {replyInputs[comment._id] && (
                        <div className="ml-8 mt-3">
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <textarea
                                value={replyInputs[`${comment._id}_input`] || ""}
                                onChange={(e) => setReplyInputs(prev => ({ ...prev, [`${comment._id}_input`]: e.target.value }))}
                                placeholder="Write a reply..."
                                className="w-full p-2 border rounded text-sm"
                                rows="1"
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  onClick={() => setReplyInputs(prev => ({ ...prev, [comment._id]: false }))}
                                  className="px-2 py-1 text-sm text-gray-600"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleAddComment(post._id, replyInputs[`${comment._id}_input`], comment._id)}
                                  disabled={!replyInputs[`${comment._id}_input`]?.trim()}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Replies List */}
                      {comment.replies?.length > 0 && (
                        <div className="ml-8 mt-3 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply._id} className="flex gap-2">
                              <button
                                onClick={() => handleViewProfile(reply.author_id)}
                                className="flex-shrink-0"
                              >
                                {reply.authorProfile?.profile_picture ? (
                                  <img
                                    src={reply.authorProfile.profile_picture}
                                    alt={reply.author?.username}
                                    className="w-6 h-6 rounded-full"
                                  />
                                ) : (
                                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600 text-xs">
                                      {reply.author?.username?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </button>
                              <div className="flex-1 bg-gray-50 rounded-lg p-2">
                                <div className="flex justify-between">
                                  <div>
                                    <button
                                      onClick={() => handleViewProfile(reply.author_id)}
                                      className="font-medium text-xs hover:text-blue-600"
                                    >
                                      {reply.author?.username}
                                    </button>
                                    <p className="text-gray-800 text-xs mt-1">{reply.content}</p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleLike(reply._id, "comment")}
                                      className={`text-xs ${reply.isLiked ? "text-red-600" : "text-gray-500 hover:text-red-600"}`}
                                    >
                                      Like
                                    </button>
                                    {user?._id === reply.author_id && (
                                      <button
                                        onClick={() => handleDeleteComment(reply._id)}
                                        className="text-xs text-red-600 hover:text-red-800"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                  <span>{formatTime(reply.created_at)}</span>
                                  <span>❤️ {reply.like_count || 0}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
          )}
        </div>
      )}
    </div>
  );

  // Profile Modal
  const renderProfileModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Profile</h2>
            <button
              onClick={() => setShowProfileModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {user?.profile?.profile_picture ? (
                <img
                  src={user.profile.profile_picture}
                  alt={user.username}
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-2xl font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold">{user?.username}</h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowFollowersModal(true);
                  setShowProfileModal(false);
                }}
                className="flex-1 text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="font-bold">{followers.length}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </button>
              <button
                onClick={() => {
                  setShowFollowingModal(true);
                  setShowProfileModal(false);
                }}
                className="flex-1 text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="font-bold">{following.length}</div>
                <div className="text-sm text-gray-600">Following</div>
              </button>
            </div>

            {followRequests.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">
                  You have {followRequests.length} pending follow request{followRequests.length > 1 ? 's' : ''}
                </h4>
                <button
                  onClick={() => {
                    setShowFollowersModal(true);
                    setShowProfileModal(false);
                  }}
                  className="text-yellow-700 hover:text-yellow-800 text-sm"
                >
                  View requests →
                </button>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Account Settings</h4>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    // Navigate to edit profile page
                    navigate("/edit-profile");
                    setShowProfileModal(false);
                  }}
                  className="w-full text-left p-2 rounded hover:bg-gray-100"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    // Navigate to settings page
                    navigate("/settings");
                    setShowProfileModal(false);
                  }}
                  className="w-full text-left p-2 rounded hover:bg-gray-100"
                >
                  Settings
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full text-left p-2 rounded text-red-600 hover:bg-red-50"
                >
                  Delete Account
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <button
                onClick={handleLogout}
                className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Notifications Modal
  const renderNotificationsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Notifications</h2>
            <div className="flex items-center gap-2">
              {unreadNotifications > 0 && (
                <button
                  onClick={handleMarkAllNotificationsAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 rounded-lg ${!notification.read ? 'bg-blue-50' : 'bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {notification.sender?.profile?.profile_picture ? (
                        <img
                          src={notification.sender.profile.profile_picture}
                          alt={notification.sender?.username}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : notification.sender?.username ? (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm">
                            {notification.sender?.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      )}
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{notification.sender?.username || 'System'}</span>
                          {' '}{notification.message || notification.type}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkNotificationAsRead(notification._id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No notifications yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Messages Modal
  const renderMessagesModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex h-[80vh]">
          {/* Conversations List */}
          <div className="w-1/3 border-r">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Messages</h2>
                <button
                  onClick={() => setShowMessagesModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="overflow-y-auto h-[calc(80vh-73px)]">
              {conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <button
                    key={conversation.partnerId}
                    onClick={() => {
                      setActiveConversation(conversation);
                      fetchMessages(conversation.partnerId);
                    }}
                    className={`w-full p-4 text-left border-b hover:bg-gray-50 ${
                      activeConversation?.partnerId === conversation.partnerId ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {conversation.partnerProfile?.profile_picture ? (
                        <img
                          src={conversation.partnerProfile.profile_picture}
                          alt={conversation.partner?.username}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {conversation.partner?.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <div className="font-medium truncate">
                            {conversation.partner?.username}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage?.content}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No conversations yet
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                <div className="p-4 border-b flex items-center space-x-3">
                  {activeConversation.partnerProfile?.profile_picture ? (
                    <img
                      src={activeConversation.partnerProfile.profile_picture}
                      alt={activeConversation.partner?.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">
                        {activeConversation.partner?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{activeConversation.partner?.username}</div>
                    <div className="text-xs text-gray-500">
                      {following.some(f => f.followed_id === activeConversation.partnerId) ? 'Following' : 'Not following'}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.sender_id === user._id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                          message.sender_id === user._id
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${message.sender_id === user._id ? 'text-blue-200' : 'text-gray-500'}`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Followers/Following Modal
  const renderFollowModal = () => {
    const isFollowers = showFollowersModal;
    const title = isFollowers ? "Followers" : "Following";
    const data = isFollowers ? followers : following;
    const hasRequests = isFollowers && followRequests.length > 0;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{title}</h2>
              <button
                onClick={() => {
                  setShowFollowersModal(false);
                  setShowFollowingModal(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {hasRequests && (
              <div className="mb-6">
                <h3 className="font-medium mb-3 text-gray-700">Follow Requests</h3>
                <div className="space-y-3">
                  {followRequests.map((request) => {
                    const requester = allUsers.find(u => u._id === request.follower_id);
                    const requesterProfile = profiles.find(p => p.user_id === request.follower_id);
                    
                    return (
                      <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {requesterProfile?.profile_picture ? (
                            <img
                              src={requesterProfile.profile_picture}
                              alt={requester?.username}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {requester?.username?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{requester?.username}</div>
                            <div className="text-sm text-gray-500">Wants to follow you</div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleFollowRequest(request._id, "accept")}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleFollowRequest(request._id, "reject")}
                            className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {data.length > 0 ? (
                data.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <button
                      onClick={() => handleViewProfile(item.user?._id || item.followed_id)}
                      className="flex items-center space-x-3 flex-1 text-left"
                    >
                      {item.profile?.profile_picture ? (
                        <img
                          src={item.profile.profile_picture}
                          alt={item.user?.username}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {item.user?.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{item.user?.username}</div>
                        <div className="text-sm text-gray-500">
                          {item.profile?.bio || 'No bio'}
                        </div>
                      </div>
                    </button>
                    
                    {isFollowers ? (
                      <button
                        onClick={() => handleStartConversation(item.user?._id || item.follower_id)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Message
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollow(item.user?._id || item.followed_id, "unfollow")}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                      >
                        Unfollow
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {isFollowers ? 'No followers yet' : 'Not following anyone yet'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Search Results Modal
  const renderSearchModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Search Results for "{searchQuery}"</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearSearchHistory}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear History
              </button>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Search Tabs */}
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 ${searchResults.users.length > 0 ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            >
              Users ({searchResults.users.length})
            </button>
            <button
              className={`px-4 py-2 ${searchResults.posts.length > 0 ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            >
              Posts ({searchResults.posts.length})
            </button>
          </div>

          {/* Search Results */}
          <div className="space-y-6">
            {/* Users Results */}
            {searchResults.users.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 text-gray-700">Users</h3>
                <div className="space-y-3">
                  {searchResults.users.map((userResult) => (
                    <div key={userResult._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <button
                        onClick={() => {
                          handleViewProfile(userResult._id);
                          setShowSearchModal(false);
                        }}
                        className="flex items-center space-x-3 flex-1 text-left"
                      >
                        {userResult.profile?.profile_picture ? (
                          <img
                            src={userResult.profile.profile_picture}
                            alt={userResult.username}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {userResult.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{userResult.username}</div>
                          <div className="text-sm text-gray-500">
                            {userResult.profile?.bio || userResult.email}
                          </div>
                        </div>
                      </button>
                      <div className="flex space-x-2">
                        {userResult._id !== user._id && (
                          <>
                            {following.some(f => f.followed_id === userResult._id) ? (
                              <button
                                onClick={() => handleFollow(userResult._id, "unfollow")}
                                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                              >
                                Following
                              </button>
                            ) : (
                              <button
                                onClick={() => handleFollow(userResult._id, "follow")}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Follow
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleStartConversation(userResult._id);
                                setShowSearchModal(false);
                              }}
                              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                              Message
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Results */}
            {searchResults.posts.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 text-gray-700">Posts</h3>
                <div className="space-y-4">
                  {searchResults.posts.map((post) => (
                    <div key={post._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-3 mb-3">
                        {post.authorProfile?.profile_picture ? (
                          <img
                            src={post.authorProfile.profile_picture}
                            alt={post.author?.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm">
                              {post.author?.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{post.author?.username}</div>
                          <div className="text-sm text-gray-500">
                            {formatTime(post.created_at)}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-800 mb-3 line-clamp-3">{post.content}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-4">❤️ {post.like_count || 0}</span>
                        <span className="mr-4">💬 {post.comment_count || 0}</span>
                        <span>↪️ {post.share_count || 0}</span>
                      </div>
                      <button
                        onClick={() => {
                          // Scroll to post in feed
                          const element = document.getElementById(`post-${post._id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                            setShowSearchModal(false);
                          }
                        }}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Post →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchResults.users.length === 0 && searchResults.posts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-medium mb-3 text-gray-700">Recent Searches</h3>
              <div className="space-y-2">
                {searchHistory.map((history) => (
                  <button
                    key={history._id}
                    onClick={() => setSearchQuery(history.query)}
                    className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-50 rounded"
                  >
                    <span className="text-gray-700">{history.query}</span>
                    <span className="text-xs text-gray-500">{formatTime(history.created_at)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Report Modal
  const renderReportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Report {reportData.target_type}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for reporting
              </label>
              <textarea
                value={reportData.reason}
                onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Please describe why you are reporting this content..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportData({
                    target_id: "",
                    target_type: "",
                    reason: ""
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Edit Post Modal
  const renderEditPostModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Edit Post</h2>
          <div className="space-y-4">
            <div>
              <textarea
                value={editingPost?.content || ""}
                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="6"
                placeholder="What's on your mind?"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditingPost(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdatePost(editingPost._id, editingPost.content);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      {renderNavigationBar()}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Welcome Message */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
          <p className="text-gray-600">Here's what's happening in your network.</p>
        </div>

        {/* Create Post */}
        {renderCreatePost()}

        {/* Feed Controls */}
        {renderFeedControls()}

        {/* Posts */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading posts...</p>
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div key={post._id} id={`post-${post._id}`}>
              {renderPost(post)}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No posts to show. Follow some users or create your first post!</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Discover People to Follow
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showProfileModal && renderProfileModal()}
      {showNotificationsModal && renderNotificationsModal()}
      {showMessagesModal && renderMessagesModal()}
      {(showFollowersModal || showFollowingModal) && renderFollowModal()}
      {showSearchModal && renderSearchModal()}
      {showReportModal && renderReportModal()}
      {editingPost && renderEditPostModal()}
    </div>
  );
};

export default Home;