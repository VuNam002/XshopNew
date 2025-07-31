import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

function HeaderSearch() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products/search?keyword=${encodeURIComponent(keyword.trim())}`);
      setKeyword("");
    }
  };

  return (
    <div className="relative w-64">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full py-2 pl-4 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"

        />
        <button
          type="submit"
          className="absolute top-0 right-0 h-full px-3 text-gray-500 rounded-r-full "
          aria-label="Tìm kiếm"
        >
          <FaSearch />
        </button>
      </form>
    </div>
  );
}

export default HeaderSearch;
