import React from "react";
import { Link } from "react-router-dom";

const Stories = ({ stories }) => {
  if (!stories || stories.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="font-semibold text-gray-700 mb-4">Stories</h2>
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {stories.map((story) => (
          <Link
            key={story._id}
            to={`/post/${story._id}`}
            className="flex-shrink-0 w-20 text-center"
          >
            <div className="w-16 h-16 mx-auto rounded-full border-2 border-blue-500 p-0.5 mb-2">
              <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {story.author?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 truncate">{story.author?.username}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Stories;