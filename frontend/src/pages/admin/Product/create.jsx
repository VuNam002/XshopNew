import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSave, FaUpload, FaImage, FaTimes, FaStar } from "react-icons/fa";
import { Editor } from "@tinymce/tinymce-react";

function CreateProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
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

  const API_PRODUCTS_BASE = "http://localhost:3000/products";
  const API_CATEGORIES_BASE = "http://localhost:3000/category";

  // API request helper
  const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }
    return response.json();
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await apiRequest(API_CATEGORIES_BASE);
        const categoriesData = Array.isArray(result)
          ? result
          : result.data || result.categories || result.result || [];
        setCategories(categoriesData);
      } catch (err) {
        setError("Không thể tải danh mục: " + err.message);
      }
    };
    fetchCategories();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle featured change
  const handleFeaturedChange = (value) => {
    const isFeatured = value === "true";
    setNewProduct((prev) => ({
      ...prev,
      isFeatured: isFeatured,
    }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File ảnh không được vượt quá 5MB. Ảnh sẽ được tự động nén lại.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setNewProduct((prev) => ({ ...prev, img: dataUrl }));
        setUploading(false);
      };
      img.onerror = () => {
        setError("Lỗi xử lý file ảnh.");
        setUploading(false);
      };
    };
    reader.onerror = () => {
      setError("Lỗi đọc file ảnh");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Clear image
  const clearImage = () => {
    setNewProduct((prev) => ({ ...prev, img: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.category) {
      alert("Vui lòng điền tên sản phẩm và chọn danh mục.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Tạo sản phẩm với isFeatured trong dữ liệu
      const productData = {
        ...newProduct,
        isFeatured: newProduct.isFeatured
      };

      console.log("Sending product data:", productData);

      const response = await apiRequest(`${API_PRODUCTS_BASE}/create`, {
        method: "POST",
        body: JSON.stringify(productData),
      });

      console.log("Product created response:", response);

      alert("Tạo sản phẩm thành công!");
      navigate("/admin/products");
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err.message || "Đã xảy ra lỗi khi tạo sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl p-8 mx-auto bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Tạo sản phẩm mới
        </h1>

        {error && (
          <div className="relative px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
            <strong className="font-bold">Lỗi!</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên sản phẩm */}
          <div>
            <label
              htmlFor="title"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Tên sản phẩm
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={newProduct.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Mô tả
            </label>
            <Editor
              apiKey="uqfddx0q46sq2wk7lb10d2e19dvy6uvmji190dlkn87uv6ee"
              init={{
                height: 400,
                menubar: false,
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "code",
                  "table",
                  "wordcount",
                ],
                toolbar:
                  "undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist | removeformat",
              }}
              value={newProduct.description}
              onEditorChange={(content) =>
                setNewProduct((prev) => ({ ...prev, description: content }))
              }
            />
          </div>

          {/* Hình ảnh */}
          <div>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Hình ảnh sản phẩm
            </label>
            <div className="flex mb-4 space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="file"
                  checked={uploadMethod === "file"}
                  onChange={(e) => setUploadMethod(e.target.value)}
                  className="mr-2"
                />
                <FaUpload className="mr-1" /> Tải lên từ máy
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="url"
                  checked={uploadMethod === "url"}
                  onChange={(e) => setUploadMethod(e.target.value)}
                  className="mr-2"
                />
                <FaImage className="mr-1" /> Nhập URL
              </label>
            </div>

            {uploadMethod === "file" ? (
              <div>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {newProduct.img && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Xóa ảnh"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Chấp nhận: JPEG, PNG, GIF, WebP. Tối đa 5MB.
                </p>
              </div>
            ) : (
              <input
                type="url"
                value={newProduct.img}
                onChange={handleChange}
                name="img"
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            )}
            
            {/* Preview */}
            {newProduct.img && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-gray-600">Xem trước:</p>
                <img
                  src={newProduct.img}
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

          {/* Sản phẩm nổi bật */}
          <div>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Sản phẩm nổi bật
            </label>
            <div className="flex mb-4 space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="true"
                  checked={newProduct.isFeatured === true}
                  onChange={(e) => handleFeaturedChange(e.target.value)}
                  className="mr-2"
                />
                <FaStar className="mr-1 text-yellow-500" /> Nổi bật
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="false"
                  checked={newProduct.isFeatured === false}
                  onChange={(e) => handleFeaturedChange(e.target.value)}
                  className="mr-2"
                />
                <FaStar className="mr-1 text-gray-400" /> Không nổi bật
              </label>
            </div>
            {newProduct.isFeatured && (
              <div className="p-3 border border-yellow-200 rounded-md bg-yellow-50">
                <p className="text-sm text-yellow-800">
                  <FaStar className="inline mr-1 text-yellow-500" />
                  Sản phẩm này sẽ được hiển thị trong danh sách sản phẩm nổi bật
                </p>
              </div>
            )}
          </div>

          {/* Giá, Danh mục, Trạng thái */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label
                htmlFor="price"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Giá (VND)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={newProduct.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Danh mục
              </label>
              <select
                id="category"
                name="category"
                value={newProduct.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="" disabled>
                  Chọn danh mục
                </option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={newProduct.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Kích hoạt</option>
                <option value="inactive">Ẩn</option>
              </select>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center px-4 py-2 font-semibold text-white bg-blue-600 rounded shadow hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading || uploading}
            >
              <FaSave className="mr-2" />
              {loading
                ? "Đang lưu..."
                : uploading
                ? "Đang xử lý ảnh..."
                : "Lưu sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProduct;