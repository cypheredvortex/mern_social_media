import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";

const PostList = ({ 
  posts, 
  onLike, 
  onComment, 
  onShare, 
  onReport, 
  onDelete, 
  onEdit,
  currentUser 
}) => {
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [postComments, setPostComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});

  const fetchComments = async (postId) => {
    try {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      const response = await api.get(`/comments?post_id=${postId}`);
      const commentsWithAuthors = await Promise.all(
        response.data.map(async (comment) => {
          try {
            const authorRes = await api.get(`/users/${comment.author_id}`);
            const profileRes = await api.get(`/profiles?user_id=${comment.author_id}`);
            return {
              ...comment,
              author: authorRes.data,
              authorProfile: profileRes.data[0] || {}
            };
          } catch (error) {
            return comment;
          }
        })
      );
      setPostComments(prev => ({ ...prev, [postId]: commentsWithAuthors }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    
    if (!postComments[postId] && !expandedComments[postId]) {
      fetchComments(postId);
    }
  };

  const handleCommentSubmit = (postId) => {
    const content = commentInputs[postId];
    if (content && content.trim()) {
      onComment(postId, content);
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    }
  };

  const handleLikeComment = async (commentId) => {
    // Implement comment liking logic
    console.log("Like comment:", commentId);
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

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post._id} className="bg-white rounded-lg shadow">
          {/* Post Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link to={`/profile/${post.author_id}`}>
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
                </Link>
                <div>
                  <Link to={`/profile/${post.author_id}`} className="font-medium hover:text-blue-600">
                    {post.author?.username}
                  </Link>
                  <p className="text-sm text-gray-500">{formatTime(post.createdAt)}</p>
                </div>
              </div>
              
              {/* Post Actions Menu */}
              <div className="relative">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  ⋮
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 hidden">
                  {currentUser?._id === post.author_id ? (
                    <>
                      <button
                        onClick={() => onEdit(post)}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Edit Post
                      </button>
                      <button
                        onClick={() => onDelete(post._id)}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        Delete Post
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onReport(post._id, "post")}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      Report Post
                    </button>
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
                {post.media_url.match(/\.(jpeg|jpg|gif|png)$/) ? (
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
              <span>{post.like_count} likes</span>
              <span>{post.comment_count} comments</span>
              <span>{post.share_count} shares</span>
            </div>
            <span>{post.visibility === 'private' ? '🔒 Private' : '🌍 Public'}</span>
          </div>

          {/* Post Actions */}
          <div className="p-2 flex border-b">
            <button
              onClick={() => onLike(post._id, "post")}
              className="flex-1 flex items-center justify-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <span className="text-lg">❤️</span>
              <span className="text-gray-700">Like</span>
            </button>
            <button
              onClick={() => toggleComments(post._id)}
              className="flex-1 flex items-center justify-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <span className="text-lg">💬</span>
              <span className="text-gray-700">Comment</span>
            </button>
            <button
              onClick={() => onShare(post._id)}
              className="flex-1 flex items-center justify-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <span className="text-lg">↪️</span>
              <span className="text-gray-700">Share</span>
            </button>
          </div>

          {/* Comments Section */}
          {expandedComments[post._id] && (
            <div className="p-4">
              {/* Comment Input */}
              <div className="flex gap-2 mb-4">
                {currentUser?.profile?.profile_picture ? (
                  <img
                    src={currentUser.profile.profile_picture}
                    alt={currentUser.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">
                      {currentUser?.username?.charAt(0).toUpperCase()}
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
                      onClick={() => handleCommentSubmit(post._id)}
                      className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              {loadingComments[post._id] ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : postComments[post._id]?.length > 0 ? (
                <div className="space-y-4">
                  {postComments[post._id].map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <Link to={`/profile/${comment.author_id}`}>
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
                      </Link>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between">
                            <Link to={`/profile/${comment.author_id}`} className="font-medium text-sm hover:text-blue-600">
                              {comment.author?.username}
                            </Link>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleLikeComment(comment._id)}
                                className="text-xs text-gray-500 hover:text-red-600"
                              >
                                Like
                              </button>
                              <button
                                onClick={() => onReport(comment._id, "comment")}
                                className="text-xs text-gray-500 hover:text-red-600"
                              >
                                Report
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-800 text-sm mt-1">{comment.content}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span>{formatTime(comment.createdAt)}</span>
                            <span>❤️ {comment.like_count} likes</span>
                          </div>
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
      ))}
    </div>
  );
};

export default PostList;