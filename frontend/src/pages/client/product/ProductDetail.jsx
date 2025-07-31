import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Heart,
  Star,
  ShoppingCart,
  Truck,
  RotateCcw,
  Shield,
  Share2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";

const TAB_OPTIONS = [
  { id: "description", label: "Mô tả sản phẩm" },
  { id: "reviews", label: "Đánh giá" },
  { id: "care", label: "Hướng dẫn bảo quản" },
];

const DEFAULT_PRODUCT = {
  images: [],
  sizes: ["S", "M", "L", "XL", "XXL"],
  colors: [
    { name: "Đen", value: "#000000" },
    { name: "Trắng", value: "#FFFFFF" },
    { name: "Xám", value: "#6B7280" },
    { name: "Navy", value: "#1E3A8A" },
  ],
  category: "Thời trang",
  sku: "PRD001",
  care: "Giặt máy ở nhiệt độ thường, không tẩy, ủi nhiệt độ thấp",
};

const SHIPPING_INFO = [
  {
    icon: Truck,
    color: "text-green-600",
    text: "Miễn phí vận chuyển đơn hàng từ 500k",
  },
  { icon: RotateCcw, color: "text-blue-600", text: "Đổi trả trong 30 ngày" },
  { icon: Shield, color: "text-purple-600", text: "Bảo hành chính hãng" },
];

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interaction states
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:3000/products/detail/${id}`);
        if (!res.ok) throw new Error("Không thể tải sản phẩm");

        const result = await res.json();
        const productData = result.data || result;

        setProduct({
          ...DEFAULT_PRODUCT,
          ...productData,
          images: productData.images || [productData.img],
          originalPrice: productData.originalPrice || productData.price * 1.3,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (action) => {
    setQuantity((prev) =>
      action === "increase"
        ? Math.min(prev + 1, product?.stockCount || 10)
        : Math.max(prev - 1, 1)
    );
  };

  const handleAddToCart = () => {
    if (!selectedSize) return alert("Vui lòng chọn size!");
    if (!selectedColor) return alert("Vui lòng chọn màu sắc!");

    const itemToAdd = {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0] || product.img,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
    };

    dispatch({ type: "ADD_TO_CART", payload: { item: itemToAdd } });

    alert(`Đã thêm ${quantity} sản phẩm "${product.title}" vào giỏ hàng!`);
    // Tùy chọn: Bỏ comment dòng dưới nếu bạn muốn tự động chuyển đến trang giỏ hàng
    navigate("/cart");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-8 mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="bg-gray-200 rounded-lg aspect-square" />
              <div className="space-y-4">
                <div className="w-3/4 h-8 bg-gray-200 rounded" />
                <div className="w-1/2 h-6 bg-gray-200 rounded" />
                <div className="h-20 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-xl text-red-600">Lỗi: {error}</div>
          <button className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Thử lại
          </button>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-gray-600">
          <div className="mb-4 text-xl">Không tìm thấy sản phẩm</div>
          <button className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="px-4 py-3 mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Quay lại
            </button>
            <span className="text-gray-900">{product.title}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative overflow-hidden bg-white shadow-lg rounded-xl">
              <img
                src={product.images[selectedImage] || product.img}
                alt={product.title}
                className="object-cover w-full aspect-square"
              />
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`absolute top-4 right-4 p-2 rounded-full ${
                  isWishlisted
                    ? "bg-red-100 text-red-600"
                    : "bg-white text-gray-600"
                } hover:scale-110 transition-transform shadow-md`}
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
                />
              </button>
              {product.discount && (
                <div className="absolute px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-full top-4 left-4">
                  -{product.discount}%
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex pb-2 space-x-3 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-blue-600"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              <h1 className="mb-3 text-3xl font-bold text-gray-900">
                {product.title}
              </h1>

              <div className="flex items-center mb-6 space-x-3">
                <span className="text-3xl font-bold text-red-600">
                  {product.price.toLocaleString()}₫
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    {product.originalPrice.toLocaleString()}₫
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">
                Màu sắc: {selectedColor}
              </h3>
              <div className="flex space-x-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-12 h-12 rounded-full border-4 transition-all ${
                      selectedColor === color.name
                        ? "border-blue-600 scale-110"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {color.value === "#FFFFFF" && (
                      <div className="w-full h-full border border-gray-200 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">
                Kích thước: {selectedSize}
              </h3>
              <div className="flex space-x-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                      selectedSize === size
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                Hướng dẫn chọn size
              </button>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">Số lượng:</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange("decrease")}
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange("increase")}
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity >= product.stockCount}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center w-full py-4 space-x-2 text-lg font-semibold text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Thêm vào giỏ hàng</span>
              </button>
            </div>

            <div className="p-4 space-y-3 rounded-lg bg-gray-50">
              {SHIPPING_INFO.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {TAB_OPTIONS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="p-6 prose bg-white rounded-lg max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="p-6 bg-white rounded-lg">
                <div className="py-12 text-center">
                  <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-700">
                    Chưa có đánh giá nào
                  </h3>
                  <p className="text-gray-500">
                    Hãy là người đầu tiên đánh giá sản phẩm này!
                  </p>
                  <button className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    Viết đánh giá
                  </button>
                </div>
              </div>
            )}

            {activeTab === "care" && (
              <div className="p-6 bg-white rounded-lg">
                <h4 className="mb-4 font-semibold">Hướng dẫn bảo quản</h4>
                <p className="text-gray-700">{product.care}</p>
                <div className="mt-4 space-y-2">
                  {[
                    "Giặt riêng lần đầu để tránh lem màu",
                    "Không ngâm quá lâu trong nước",
                    "Phơi nơi thoáng mát, tránh ánh nắng trực tiếp",
                    "Bảo quản nơi khô ráo, thoáng mát",
                  ].map((item, i) => (
                    <p key={i} className="text-sm text-gray-600">
                      • {item}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
