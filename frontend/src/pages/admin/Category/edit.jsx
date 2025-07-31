import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { FaSave, FaUpload, FaImage, FaTimes } from "react-icons/fa";

function EditCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [newCategory, setNewCategory] = useState({
    name: "",
    img: "",
    description: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadMethod, setUploadMethod] = useState("file");
  const [uploading, setUploading] = useState(false);

  const API_CATEGORIES_BASE = "http://localhost:3000/category";

  const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error! Status: ${response.status}`,
      }));
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }
    return response.json();
  };

  // Fetch category data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryResult = await apiRequest(
          `${API_CATEGORIES_BASE}/detail/${id}`
        );
        const categoryData = categoryResult.data || categoryResult;
        setNewCategory({
          name: categoryData.name || "",
          img: categoryData.img || "",
          description: categoryData.description || "",
          status: categoryData.status || "active",
        });
      } catch (err) {
        setError("Không thể tải dữ liệu: " + err.message);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // validate
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowed.includes(file.type)) {
      alert("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewCategory((prev) => ({ ...prev, img: e.target.result }));
      setUploading(false);
    };
    reader.onerror = () => {
      setError("Lỗi đọc file ảnh");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Clear img
  const clearImage = () => {
    setNewCategory((prev) => ({ ...prev, img: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.name) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await apiRequest(`${API_CATEGORIES_BASE}/edit/${id}`, {
        method: "PATCH",
        body: JSON.stringify(newCategory),
      });
      alert("Sửa danh mục thành công!");
      navigate("/admin/category");
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi sửa danh mục");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl p-8 mx-auto bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Chỉnh sửa danh mục
        </h1>

        {error && (
          <div className="relative px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400">
            <strong className="font-bold">Lỗi!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên danh mục */}
          <div>
            <label
              htmlFor="name"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Tên danh mục
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newCategory.name}
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
                height: 600,
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
              value={newCategory.description}
              onEditorChange={(content) =>
                setNewCategory((prev) => ({ ...prev, description: content }))
              }
            />
          </div>

          {/* Hình ảnh */}
          <div>
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Hình ảnh danh mục
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
                <FaImage className="mr-1" /> Tải file
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
                  {newCategory.img && (
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
                  Chấp nhận: JPEG, PNG, GIF, WebP. Tối đa 2MB.
                </p>
              </div>
            ) : (
              <input
                type="url"
                value={newCategory.img}
                onChange={handleChange}
                name="img"
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            )}

            {/* Preview */}
            {newCategory.img && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-gray-600">Xem trước:</p>
                <img
                  src={newCategory.img}
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

          {/* Trạng thái */}
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
              value={newCategory.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Kích hoạt</option>
              <option value="inactive">Ẩn</option>
            </select>
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
                : "Lưu danh mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCategory;
