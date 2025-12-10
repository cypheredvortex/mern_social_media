import React from 'react';
import PostComposer from './PostComposer';
import PostList from './PostList';

const Feed = ({ posts, currentUser, onPostCreated, onLike, onComment, onShare, onReport, onDelete, onEdit }) => {
  return (
    <div className="w-full lg:w-3/4 xl:w-1/2">
      <PostComposer currentUser={currentUser} onPostCreated={onPostCreated} />
      <PostList 
        posts={posts} 
        currentUser={currentUser} 
        onLike={onLike} 
        onComment={onComment} 
        onShare={onShare} 
        onReport={onReport} 
        onDelete={onDelete} 
        onEdit={onEdit} 
      />
    </div>
  );
};

export default Feed;