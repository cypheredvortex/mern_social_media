import React from "react";

const TrendingSidebar = ({ trendingHashtags, onSearchHashtag }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-700 mb-4">Trending Now</h3>
      
      {trendingHashtags.length > 0 ? (
        <div className="space-y-3">
          {trendingHashtags.map((hashtag, index) => (
            <button
              key={hashtag.tag}
              onClick={() => onSearchHashtag(hashtag.tag)}
              className="block w-full text-left hover:bg-gray-50 p-2 rounded"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{hashtag.tag}</p>
                  <p className="text-xs text-gray-500">{hashtag.count} posts</p>
                </div>
                <span className="text-gray-400">#{index + 1}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No trending topics yet</p>
      )}
      
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-500">
          • <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          • <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          • <a href="#" className="text-blue-600 hover:underline">Cookie Policy</a>
        </p>
        <p className="text-xs text-gray-500 mt-4">
          © {new Date().getFullYear()} SocialApp
        </p>
      </div>
    </div>
  );
};

export default TrendingSidebar;