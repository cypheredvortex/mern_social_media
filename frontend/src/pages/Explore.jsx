import { useState } from "react";
import SearchBar from "../components/search/SearchBar";
import SearchResults from "../components/search/SearchResults";

const Explore = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <SearchBar onSearch={setQuery} />
      <SearchResults query={query} />
    </div>
  );
};

export default Explore;