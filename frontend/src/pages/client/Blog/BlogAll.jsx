import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Eye,
  Tag,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { IoHome } from "react-icons/io5";

// Constants
const ITEMS_PER_PAGE = 12;
const API_URL = "http://localhost:3000/blog";

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

const truncateText = (text, maxLength = 150) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const LoadingIndicator = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      <p className="text-lg text-gray-600">Đang tải tin tức...</p>
    </div>
  </div>
);

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => (
  <div className="p-6 bg-white shadow-lg rounded-2xl">
    <h3 className="mb-4 text-lg font-semibold text-gray-900">
      Lọc theo danh mục
    </h3>
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => onSelectCategory("all")}
        className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
          selectedCategory === "all"
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <div className="flex items-center gap-1">
          <IoHome />
          <span>Tất cả</span>
        </div>
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
            selectedCategory === cat.id
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-center mt-12 space-x-2">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ChevronLeft className="w-4 h-4 mr-1" />
      Trước
    </button>

    <div className="flex space-x-1">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 text-sm font-medium rounded-lg ${
            currentPage === page
              ? "bg-blue-600 text-white"
              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}
    </div>

    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Sau
      <ChevronRight className="w-4 h-4 ml-1" />
    </button>
  </div>
);

const BlogCard = ({ article, featured = false }) => (
  <Link to={`/blog/${article._id}`}>
    <div className="flex flex-col h-full overflow-hidden transition-all duration-300 bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-[4/3] bg-gray-100">
        {article.thumbnail ? (
          <img
            src={article.thumbnail}
            alt={article.title}
            className="absolute inset-0 object-cover w-full h-full"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <span>Không có ảnh</span>
          </div>
        )}
        {(article.isFeatured || article.featured) && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-xs font-bold text-white rounded-full shadow-md bg-gradient-to-r from-red-500 to-pink-600">
              Nổi bật
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-grow p-4 md:p-6">
        <div className="flex items-center mb-2 md:mb-3">
          <Tag className="w-4 h-4 mr-2 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">
            {article.category_id?.title || "Chưa phân loại"}
          </span>
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600 md:mb-3">
          {article.title}
        </h3>
        <p className="mb-3 leading-relaxed text-gray-600 md:mb-4">
          {truncateText(article.content, featured ? 200 : 120)}
        </p>
        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs text-gray-500 md:text-sm">
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1 md:w-4 md:h-4" />
                {formatDate(article.created_date || article.createdAt)}
              </div>
              <div className="flex items-center">
                <Eye className="w-3 h-3 mr-1 md:w-4 md:h-4" />
                {article.views || 0}
              </div>
            </div>
            {article.author && (
              <span className="font-medium">{article.author}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  </Link>
);

function BlogAll() {
  const [blog, setBlog] = useState([]);
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [shouldShowCategory, setShouldShowCategory] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        const result = await response.json();
        const blogData = result.data || [];
        setBlog(blogData);

        // Extract unique categories
        const categoryMap = new Map();
        blogData.forEach((blogItem) => {
          if (blogItem.category_id && typeof blogItem.category_id === "object") {
            const categoryId = blogItem.category_id._id || blogItem.category_id.id;
            const categoryName = blogItem.category_id.title;
            if (categoryId && categoryName && !categoryMap.has(categoryId)) {
              categoryMap.set(categoryId, {
                id: categoryId,
                name: categoryName,
              });
            }
          }
        });
        
        const categoriesArray = Array.from(categoryMap.values());
        setCategory(categoriesArray);
        
        // Chỉ hiển thị category section nếu có nhiều hơn 1 category
        setShouldShowCategory(categoriesArray.length > 1);
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const processedBlog = useMemo(() => {
    // Nếu không hiển thị category section, chỉ lọc bài viết active
    if (!shouldShowCategory) {
      return blog.filter(item => item.status === "active");
    }
    
    // Nếu có hiển thị category section, áp dụng bộ lọc đầy đủ
    return blog.filter((blogItem) => {
      if (blogItem.status !== "active") return false;
      if (selectedCategory === "all") return true;
      
      if (blogItem.category_id && typeof blogItem.category_id === "object") {
        const categoryID = blogItem.category_id._id || blogItem.category_id.id;
        return categoryID === selectedCategory;
      }
      return false;
    });
  }, [blog, selectedCategory, shouldShowCategory]);

  const featuredBlogs = useMemo(() => {
    return blog
      .filter(item => item.status === "active" && (item.isFeatured || item.featured))
      .slice(0, 3);
  }, [blog]);

  const latestBlogs = useMemo(() => {
    return blog
      .filter(item => item.status === "active")
      .sort(
        (a, b) =>
          new Date(b.created_date || b.createdAt) -
          new Date(a.created_date || a.createdAt)
      )
      .slice(0, 6);
  }, [blog]);

  // Pagination
  const totalItems = processedBlog.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedBlog = processedBlog.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Featured Blogs Section */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Star className="w-6 h-6 mr-2 text-yellow-500 fill-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Bài viết nổi bật</h2>
          </div>
          
          {featuredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {featuredBlogs.map((article) => (
                <BlogCard
                  key={article._id}
                  article={article}
                  featured={true}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center rounded-lg bg-yellow-50">
              <p className="text-yellow-700">Hiện chưa có bài viết nổi bật</p>
            </div>
          )}
        </section>

        {/* Latest Blogs Section */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Clock className="w-6 h-6 mr-2 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900">Bài viết mới nhất</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {latestBlogs.map((article) => (
              <BlogCard key={article._id} article={article} />
            ))}
          </div>
        </section>

        {/* Category Filter - Chỉ hiển thị khi có nhiều hơn 1 category */}
        {shouldShowCategory && (
          <div className="mb-12">
            <CategoryFilter
              categories={category}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        )}

        {/* All Blog Posts */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {shouldShowCategory
                ? selectedCategory === "all"
                  ? "Tất cả bài viết"
                  : `Danh mục: ${category.find((c) => c.id === selectedCategory)?.name}`
                : "Bài viết mới nhất"}
            </h2>
          </div>

          {paginatedBlog.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg text-gray-500">
                Không có bài viết nào
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedBlog.map((article) => (
                  <BlogCard key={article._id} article={article} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default BlogAll;