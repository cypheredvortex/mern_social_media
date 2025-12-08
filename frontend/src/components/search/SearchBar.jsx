import { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex mb-4">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search users, posts..."
        className="flex-1 p-2 border rounded-l"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">Search</button>
    </form>
  );
};

export default SearchBar;
