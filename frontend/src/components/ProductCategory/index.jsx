import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const MAX_PRODUCTS_PER_CATEGORY = 5;

function ProductCategory() {
  const [groupedProducts, setGroupedProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Lỗi HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then((result) => {
        const products = result?.data || [];

        const groups = products.reduce((acc, product) => {
          const categoryId = product.category?._id;
          if (!categoryId) return acc;

          if (!acc[categoryId]) {
            acc[categoryId] = {
              id: categoryId,
              name: product.category.name,
              products: [],
            };
          }

          if (acc[categoryId].products.length < MAX_PRODUCTS_PER_CATEGORY) {
            acc[categoryId].products.push(product);
          }

          return acc;
        }, {});

        setGroupedProducts(groups);
      })
      .catch((error) => {
        console.error("Đã xảy ra lỗi khi tải sản phẩm:", error);
        setError("Không thể tải sản phẩm.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Đang tải sản phẩm theo danh mục...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const categoryList = Object.values(groupedProducts);

  return (
    <div className="space-y-10">
      {categoryList.length > 0 ? (
        categoryList.map((group) => (
          <div key={group.id}>
            <Link
              to={`/products/category/${group.id}`}
              className="no-underline hover:no-underline"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">{group.name}</h2>
              </div>
            </Link>

            <ul className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {group.products.map((item) => (
                <li
                  key={item._id}
                  className="overflow-hidden transition-all duration-300 shadow-sm group"
                >
                  <Link to={`/products/${item._id}`}>
                    <img
                      alt={item.title}
                      src={item.img}
                      className="object-cover w-full transition-transform duration-300 h-72 sm:h-80 md:h-72 lg:h-80 xl:h-72"
                    />
                    <div>
                      <h3 className="mt-3 ml-3 text-sm font-semibold text-gray-900 transition-colors mb- line-clamp-2 group-hover:text-blue-600">
                        {item.title}
                      </h3>
                      <div className="mt-3 ml-3 text-lg font-bold text-red-600">
                        {Number(item.price).toLocaleString()} VND
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p className="text-gray-500">Không có sản phẩm nào để hiển thị.</p>
      )}
    </div>
  );
}

export default ProductCategory;
