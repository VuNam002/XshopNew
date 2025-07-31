import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { FaSave, FaUpload, FaImage, FaTimes, FaStar } from "react-icons/fa";

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    title: "",
    description: "",
    img: "",
    price: "",
    category: "",
    status: "active",
    isFeatured: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadMethod, setUploadMethod] = useState("file");
  const [uploading, setUploading] = useState(false);

  const API_BASE = "http://localhost:3000";

  // API helper
  const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryRes, productRes] = await Promise.all([
          apiCall("/category"),
          id ? apiCall(`/products/detail/${id}`) : Promise.resolve(null)
        ]);

        setCategories(Array.isArray(categoryRes) ? categoryRes : categoryRes.data || []);
        
        if (productRes) {
          const data = productRes.data || productRes;
          setProduct({
            title: data.title || "",
            description: data.description || "",
            img: data.img || "",
            price: data.price ?? "",
            category: data.category || "",
            status: data.status || "active",
            isFeatured: data.isFeatured || false,
          });
        }
      } catch (err) {
        setError("Không thể tải dữ liệu: " + err.message);
      }
    };
    loadData();
  }, [id]);

  // Handle changes
  const handleChange = (field, value) => {
    setProduct(prev => ({
      ...prev,
      [field]: field === "price" ? parseFloat(value) || 0 : value
    }));
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      handleChange("img", e.target.result);
      setUploading(false);
    };
    reader.onerror = () => {
      setError("Lỗi đọc file ảnh");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.title || !product.category) {
      alert("Vui lòng điền tên sản phẩm và danh mục");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await apiCall(`/products/update/${id}`, {
        method: "PATCH",
        body: JSON.stringify(product),
      });
      alert("Sửa sản phẩm thành công!");
      navigate("/admin/products");
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi sửa sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  // Clear image
  const clearImage = () => {
    handleChange("img", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl p-8 mx-auto bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Chỉnh sửa sản phẩm</h1>

        {error && (
          <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
            <strong>Lỗi!</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên sản phẩm */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Tên sản phẩm</label>
            <input
              type="text"
              value={product.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Mô tả</label>
            <Editor
              apiKey="uqfddx0q46sq2wk7lb10d2e19dvy6uvmji190dlkn87uv6ee"
              init={{
                height: 400,
                menubar: false,
                plugins: ["advlist", "autolink", "lists", "link", "image", "code", "table", "wordcount"],
                toolbar: "undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist | removeformat",
              }}
              value={product.description}
              onEditorChange={(content) => handleChange("description", content)}
            />
          </div>

          {/* Sản phẩm nổi bật */}
          <div>
            <label className="block mb-3 text-sm font-medium text-gray-700">Sản phẩm nổi bật</label>
            <div className="flex mb-4 space-x-4">
              {[
                { value: true, label: "Nổi bật", icon: "text-yellow-500" },
                { value: false, label: "Không nổi bật", icon: "text-gray-400" }
              ].map(({ value, label, icon }) => (
                <label key={value.toString()} className="flex items-center">
                  <input
                    type="radio"
                    checked={product.isFeatured === value}
                    onChange={() => handleChange("isFeatured", value)}
                    className="mr-2"
                  />
                  <FaStar className={`mr-1 ${icon}`} /> {label}
                </label>
              ))}
            </div>
            {product.isFeatured && (
              <div className="p-3 border border-yellow-200 rounded-md bg-yellow-50">
                <p className="text-sm text-yellow-800">
                  <FaStar className="inline mr-1 text-yellow-500" />
                  Sản phẩm này sẽ được hiển thị trong danh sách sản phẩm nổi bật
                </p>
              </div>
            )}
          </div>

          {/* Hình ảnh */}
          <div>
            <label className="block mb-3 text-sm font-medium text-gray-700">Hình ảnh sản phẩm</label>
            <div className="flex mb-4 space-x-4">
              {[
                { value: "file", label: "Upload từ máy", icon: FaUpload },
                { value: "url", label: "Nhập URL", icon: FaImage }
              ].map(({ value, label, icon: Icon }) => (
                <label key={value} className="flex items-center">
                  <input
                    type="radio"
                    value={value}
                    checked={uploadMethod === value}
                    onChange={(e) => setUploadMethod(e.target.value)}
                    className="mr-2"
                  />
                  <Icon className="mr-1" /> {label}
                </label>
              ))}
            </div>

            {uploadMethod === "file" ? (
              <div>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {product.img && (
                    <button type="button" onClick={clearImage} className="p-2 text-red-600 hover:text-red-800">
                      <FaTimes />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">Chấp nhận: JPEG, PNG, GIF, WebP. Tối đa 2MB.</p>
              </div>
            ) : (
              <input
                type="url"
                value={product.img}
                onChange={(e) => handleChange("img", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            )}

            {/* Preview */}
            {product.img && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-gray-600">Xem trước:</p>
                <img
                  src={product.img}
                  alt="Preview"
                  className="object-cover w-32 h-32 border border-gray-300 rounded-lg"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            )}

            {uploading && (
              <div className="flex items-center mt-2 text-blue-600">
                <div className="w-4 h-4 mr-2 border-2 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                Đang xử lý ảnh...
              </div>
            )}
          </div>

          {/* Giá, Danh mục, Trạng thái */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Giá (VND)</label>
              <input
                type="number"
                value={product.price}
                onChange={(e) => handleChange("price", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Danh mục</label>
              <select
                value={product.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="" disabled>Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat._id} value={cat.id || cat._id}>
                    {cat.name || cat.title || cat.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                value={product.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Kích hoạt</option>
                <option value="inactive">Ẩn</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex items-center px-4 py-2 font-semibold text-white bg-blue-600 rounded shadow hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <FaSave className="mr-2" />
              {loading ? "Đang lưu..." : uploading ? "Đang xử lý ảnh..." : "Lưu sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;