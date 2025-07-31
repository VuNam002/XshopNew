import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ProductFeatured() {
  const [productsFeatured, setProductsFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Sử dụng endpoint đã được tối ưu cho sản phẩm nổi bật
    fetch("http://localhost:3000/products/featured?type=featured&limit=10")
      .then((res) => res.json())
      .then((result) => setProductsFeatured(result?.data || []))
      .catch((error) => {
        console.error("Fetch error: ", error);
        setError("Không thể tải sản phẩm nổi bật.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="space-y-4 text-center">
            <div className="w-8 h-8 mx-auto border-4 border-blue-600 border-dashed rounded-full animate-spin"></div>
            <p className="text-gray-600">Đang tải sản phẩm nổi bật...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && productsFeatured.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-200 rounded-full">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <p className="text-gray-600">Hiện không có sản phẩm nổi bật nào</p>
          </div>
        </div>
      )}

      {!loading && !error && productsFeatured.length > 0 && (
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {productsFeatured.map((item) => (
            <div key={item._id} className="overflow-hidden transition-all duration-300 shadow-sm group">
              <Link to={`/products/${item._id}`} className="block">
                <div className="relative">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="object-cover w-full transition-transform duration-300 h-72 sm:h-80 md:h-72 lg:h-80 xl:h-72"
                  />
                  <span className="absolute z-10 px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-full top-3 left-3">
                    Nổi bật
                  </span>
                  <div className="absolute inset-0 transition-opacity duration-300 bg-black opacity-0 group-hover:opacity-10"></div>
                </div>

                <div className="p-4">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 transition-colors line-clamp-2 group-hover:text-blue-600">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-red-600">
                      {Number(item.price).toLocaleString()} VND
                    </div>
                    <svg
                      className="w-5 h-5 text-blue-600 transition-opacity opacity-0 group-hover:opacity-100"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5h4"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductFeatured;