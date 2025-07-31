import ProductCategory from "@/components/ProductCategory";
import ProductFeatured from "@/components/ProductFeatured";
import SliceQc from "@/components/Slide";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [productsNew, setProductsNew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/products/new?limit=5")
      .then((res) => res.json())
      .then((result) => setProductsNew(result?.data || []))
      .catch((error) => {
        console.error("Fetch error: ", error);
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      })
      .finally(() => setLoading(false));
  }, []);

  const LoadingState = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 mx-auto border-4 border-blue-600 border-dashed rounded-full animate-spin"></div>
        <p className="text-lg text-gray-600">Đang tải sản phẩm...</p>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="space-y-4 text-center">
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-600">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center w-24 h-24 mx-auto bg-gray-200 rounded-full">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0H4m16 0l-2-2m-12 4l2-2"
            />
          </svg>
        </div>
        <p className="text-xl text-gray-600">Không có sản phẩm mới nào</p>
      </div>
    </div>
  );

  const ProductCard = ({ item }) => (
    <div className="overflow-hidden transition-all duration-300 shadow-sm group">
      <Link to={`/products/${item._id}`} className="block">
        <div className="relative">
          <img
            src={item.img}
            alt={item.title}
            className="object-cover w-full transition-transform duration-300 h-72 sm:h-80 md:h-72 lg:h-80 xl:h-72"
          />
          <span className="absolute z-10 px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-full top-3 left-3">
            Mới
          </span>
          <div className="absolute inset-0 transition-opacity duration-300 bg-black opacity-0"></div>
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
  );

  const SectionHeader = ({ title, subtitle, linkTo, linkText }) => (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="mb-2 text-3xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>
      {linkTo && (
        <Link to={linkTo} className="flex items-center gap-2 font-semibold">
          {linkText}
          <svg
            className="w-5 h-5 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      )}
    </div>
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  const activeProducts = productsNew;
  if (!activeProducts || activeProducts.length === 0) return <EmptyState />;

  return (
    <div className="min-h-screen bg-gray-50">
      <SliceQc />

      <div className="container px-4 py-2 mx-auto max-w-7xl">
        <section className="mb-18">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold tracking-wide text-[#333F48] uppercase">
              Sản phẩm mới
            </h2>
            <p className="text-base text-gray-600">
              Những sản phẩm mới nhất vừa được cập nhật
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {activeProducts.slice(0, 10).map((item) => (
              <ProductCard key={item._id} item={item} />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold tracking-wide text-[#333F48] uppercase">
              Sản phẩm nổi bật
            </h2>
            <p className="text-gray-600">Những sản phẩm được yêu thích nhất</p>
          </div>
          <div className="overflow-hidden ">
            <ProductFeatured />
          </div>
        </section>

        
          {/* Danh mục sản phẩm */}
          <section className="mb-16 ">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold tracking-wide text-[#333F48] uppercase">
                Danh mục sản phẩm
              </h2>
              <p className="text-gray-600">Khám phá những sản phẩm đa dạng</p>
            </div>
            <div className="overflow-hidden rounded-2xl">
              <ProductCategory />
            </div>
          </section>

          {/* Newsletter */}
          <section className="p-8 text-center text-white bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl md:p-12">
            <h2 className="mb-4 text-3xl font-bold">Đăng ký nhận tin tức</h2>
            <p className="max-w-2xl mx-auto mb-8 text-gray-300">
              Nhận thông báo về sản phẩm mới, khuyến mãi đặc biệt và nhiều ưu
              đãi hấp dẫn khác
            </p>
            <div className="flex flex-col max-w-md gap-4 mx-auto sm:flex-row">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-3 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-6 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                Đăng ký
              </button>
            </div>
          </section>
        </div>
      </div>
  );
}

export default Home;
