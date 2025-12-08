import { useState, useEffect } from "react";
import api from "../../lib/axios";
import { Link } from "react-router-dom";

const SearchResults = ({ query }) => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const usersRes = await api.get("/users");
        const postsRes = await api.get("/posts");

        const userResults = usersRes.data.filter(u => u.name.toLowerCase().includes(query.toLowerCase()));
        const postResults = postsRes.data.filter(p => p.content.toLowerCase().includes(query.toLowerCase()));

        setResults([...userResults.map(u => ({ type: "user", data: u })), 
                    ...postResults.map(p => ({ type: "post", data: p }))]);
      } catch (err) {
        console.error(err);
      }
    };

    if (query) fetchResults();
  }, [query]);

  if (!query) return null;
  if (results.length === 0) return <p>No results found</p>;

  return (
    <div className="space-y-2">
      {results.map((r, i) => (
        <div key={i} className="p-2 border rounded">
          {r.type === "user" ? (
            <Link to={`/profile/${r.data._id}`} className="font-bold">{r.data.name}</Link>
          ) : (
            <p>{r.data.content}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default SearchResults;