import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "@/helpers/pagination";

function ProductAll() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest"); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get('keyword') || '';

  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then((res) => res.json())
      .then((result) => {
        const productData = result.data || [];
        setProducts(productData);

        // Extract unique categories from products
        const uniqueCategories = [];
        const categoryMap = new Map();

        productData.forEach((product) => {
          if (
            product.category &&
            typeof product.category === "object" &&
            product.category !== null
          ) {
            const categoryId = product.category._id || product.category.id;
            const categoryName = product.category.name;

            if (categoryId && categoryName && !categoryMap.has(categoryId)) {
              categoryMap.set(categoryId, {
                id: categoryId,
                name: categoryName,
              });
              uniqueCategories.push({
                id: categoryId,
                name: categoryName,
              });
            }
          }
        });

        setCategories(uniqueCategories);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setCurrentPage(1);//Luôn về trang 1 khi đổi danh mục
  }, [selectedCategory, sortBy, searchKeyword]); 

  //Lọc sản phẩm theo tiêu chí
  const processedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      if (product.status !== "active") return false;
      
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        const titleMatch = product.title.toLowerCase().includes(keyword);
        const descriptionMatch = product.description?.toLowerCase().includes(keyword) || false;
        const categoryMatch = product.category?.name?.toLowerCase().includes(keyword) || false;
        
        if (!titleMatch && !descriptionMatch && !categoryMatch) {
          return false;
        }
      }
      
      // Lọc theo category
      if (selectedCategory === "all") return true;

      if (
        product.category &&
        typeof product.category === "object" &&
        product.category !== null
      ) {
        const categoryId = product.category._id || product.category.id;
        return categoryId === selectedCategory;
      }
      return false;
    });

    const sortable = [...filtered]; 

    switch (sortBy) {
      case "price-asc":
        sortable.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sortable.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        sortable.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "latest":
      default:
        break;
    }
    return sortable;
  }, [products, selectedCategory, sortBy, searchKeyword]); 

  //Phân trang
  const totalItems = processedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = processedProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0); 
    }
  };

  const handlePrevPage = () => handlePageChange(currentPage - 1);
  const handleNextPage = () => handlePageChange(currentPage + 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-slate-700">
            Đang tải sản phẩm...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-12 bg-gradient-to-br from-slate-50 via-white to-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="sticky top-0 z-10 mb-8 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                  selectedCategory === "all"
                    ? "text-blue-600 border-blue-600 bg-blue-50"
                    : "text-gray-600 border-transparent hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                Tất cả
              </button>

              {/* Category Buttons */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                    selectedCategory === category.id
                      ? "text-blue-600 border-blue-600 bg-blue-50"
                      : "text-gray-600 border-transparent hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Info */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 text-gray-700 border border-gray-200 rounded focus:outline-none focus:ring-1"
              >
                <option value="latest">Mới nhất</option>
                <option value="price-asc">Giá thấp → cao</option>
                <option value="price-desc">Giá cao → thấp</option>
                <option value="name-asc">Tên A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {paginatedProducts.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="p-8 text-center bg-white border shadow-lg rounded-2xl border-slate-200">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-slate-700">
                {searchKeyword 
                  ? `Không tìm thấy sản phẩm nào cho "${searchKeyword}"`
                  : selectedCategory === "all"
                  ? "Không có sản phẩm nào."
                  : "Không có sản phẩm nào trong danh mục này."
                }
              </p>
            </div>
          </div>
        ) : (
          <ul className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {paginatedProducts.map((product) => (
              <li
                key={product._id}
                className="overflow-hidden transition-all duration-300 shadow-sm group"
              >
                <Link to={`/products/${product._id}`} className="block">
                    <div className="relative overflow-hidden bg-slate-50">
                      <img
                        src={product.img}
                        alt={product.title}
                        className="object-cover w-full transition-transform duration-300 h-72 sm:h-80 md:h-72 lg:h-80 xl:h-72"
                      />
                      <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/10 via-transparent to-transparent group-hover:opacity-100"></div>

                      <div className="absolute px-2 py-1 text-xs font-medium transition-all duration-300 transform translate-y-2 rounded-full opacity-0 top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-600 group-hover:opacity-100 group-hover:translate-y-0">
                        Xem chi tiết
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold leading-relaxed transition-colors duration-300 text-slate-800 line-clamp-2 group-hover:text-blue-600">
                          {product.title}
                        </h3>
                      </div>

                      {/* Price */}
                      <div className="mb-2">
                        <span className="text-xl font-bold text-transparent bg-gradient-to-r from-red-600 to-red-500 bg-clip-text">
                          {Number(product.price).toLocaleString()} VND
                        </span>
                      </div>
                    </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductAll;