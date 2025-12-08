import Sidebar from "../components/common/SideBar";
import Navbar from "../components/common/NavBar";
import SearchResults from "../components/search/SearchResults";

const SearchResultsPage = () => (
  <div className="flex">
    <Sidebar />
    <div className="flex-1 p-4">
      <Navbar />
      <SearchResults />
    </div>
  </div>
);

export default SearchResultsPage;