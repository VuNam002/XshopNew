import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { FaSave, FaSpinner } from "react-icons/fa";

function EditCategoryBlog() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [category, setCategory] = useState({
    title: "",
    description: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_CATEGORIES_BASE = "http://localhost:3000/category-blog";

  const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const finalHeaders = { ...options.headers };
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
    if (!(options.body instanceof FormData) && !finalHeaders["Content-Type"]) {
      finalHeaders["Content-Type"] = "application/json";
    }

    const response = await fetch(url, { ...options, headers: finalHeaders });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error! Status: ${response.status}`,
      }));
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        // Sửa lại đường dẫn API để lấy chi tiết danh mục
        const data = await apiRequest(`${API_CATEGORIES_BASE}/detail/${id}`);
        setCategory({
          title: data.title || "",
          description: data.description || "",
          status: data.status || "active",
        });
      } catch (err) {
        setError("Không thể tải dữ liệu danh mục: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = (content) => {
    setCategory((prev) => ({
      ...prev,
      description: content,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category.title.trim()) {
      alert("Vui lòng nhập tiêu đề danh mục");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await apiRequest(`${API_CATEGORIES_BASE}/edit/${id}`, {
        method: "PATCH",
        body: JSON.stringify(category),
      });

      alert("Cập nhật danh mục thành công!");
      navigate("/admin/categoryBlog");
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi cập nhật");
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
          <div
            className="relative px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded"
            role="alert"
          >
            <strong className="font-bold">Lỗi!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {loading && !category.title ? ( 
          <div className="flex items-center justify-center p-10">
            <FaSpinner className="text-2xl text-blue-600 animate-spin" />
            <span className="ml-2">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block mb-2 font-medium text-gray-700"
              >
                Tiêu đề danh mục
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={category.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Mô tả
              </label>
              <Editor
                apiKey="uqfddx0q46sq2wk7lb10d2e19dvy6uvmji190dlkn87uv6ee"
                value={category.description}
                onEditorChange={handleEditorChange}
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
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block mb-2 font-medium text-gray-700"
              >
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={category.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Kích hoạt</option>
                <option value="inactive">Ẩn</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FaSave className="mr-2" />
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditCategoryBlog;
