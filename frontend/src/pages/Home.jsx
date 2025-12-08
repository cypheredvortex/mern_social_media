import PostComposer from "../components/feed/PostComposer";
import PostList from "../components/feed/PostList";
import { useState } from "react";

const Home = () => {
  const [refresh, setRefresh] = useState(false);

  const triggerRefresh = () => setRefresh(!refresh);

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <PostComposer onPostCreated={triggerRefresh} />
      <PostList key={refresh} />
    </div>
  );
};

export default Home;
