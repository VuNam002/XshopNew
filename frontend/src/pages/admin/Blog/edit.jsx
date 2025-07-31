import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { decode } from "he";

function EditBlog() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [blog, setBlog] = useState({
    title: "", description: "", thumbnail: "", content: "",
    status: "active", isFeatured: false, slug: "", category_id: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadMethod, setUploadMethod] = useState("file");
  const [uploading, setUploading] = useState(false);

  const API_BASE = "http://localhost:3000";
  const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json" }, ...options
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryRes, blogRes] = await Promise.all([
          apiCall("/category-blog"),
          id ? apiCall(`/blog/detail/${id}`) : Promise.resolve(null)
        ]);
        setCategories(Array.isArray(categoryRes) ? categoryRes : categoryRes.data || []);
        if (blogRes) {
          const data = blogRes.data || blogRes;
          setBlog({
            title: data.title || "", description: data.description || "",
            thumbnail: data.thumbnail || "", content: data.content || "",
            status: data.status || "active", isFeatured: data.isFeatured || false,
            category_id: data.category_id || "", slug: data.slug || ""
          });
        }
      } catch (err) {
        setError("Không thể tải dữ liệu: " + err.message);
      }
    };
    loadData();
  }, [id]);

  const handleChange = (field, value) => setBlog(prev => ({
    ...prev, [field]: field === "price" ? parseFloat(value) || 0 : value
  }));

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
      handleChange("thumbnail", e.target.result);
      setUploading(false);
    };
    reader.onerror = () => {
      setError("Lỗi đọc file ảnh");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!blog.title || !blog.category_id) {
      alert("Vui lòng điền tên bài viết và danh mục");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiCall(`/blog/edit/${id}`, { method: "PATCH", body: JSON.stringify(blog) });
      alert("Sửa bài viết thành công");
      navigate("/admin/blog");
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi sửa bài viết");
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    handleChange("thumbnail", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block mb-2 text-sm font-medium text-gray-700";
  const buttonClass = "px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="max-w-4xl mx-auto">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa bài viết</h1>
            <button onClick={() => navigate("/admin/blog")} className="px-4 py-2 text-white transition-colors bg-gray-500 rounded hover:bg-gray-600">
              Quay lại
            </button>
          </div>

          {error && (
            <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={labelClass}>Tiêu đề bài viết *</label>
              <input type="text" value={blog.title} onChange={(e) => handleChange("title", e.target.value)}
                className={inputClass} placeholder="Nhập tiêu đề bài viết" required />
            </div>

            <div>
              <label className={labelClass}>Mô tả ngắn</label>
              <textarea value={decode(blog.description || "")} onChange={(e) => handleChange("description", e.target.value)}
                rows="3" className={inputClass} placeholder="Nhập mô tả ngắn cho bài viết" />
            </div>

            <div>
              <label className={labelClass}>Danh mục *</label>
              <select value={blog.category_id} onChange={(e) => handleChange("category_id", e.target.value)}
                className={inputClass} required>
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Ảnh đại diện</label>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  {["file", "url"].map(method => (
                    <label key={method} className="flex items-center">
                      <input type="radio" value={method} checked={uploadMethod === method}
                        onChange={(e) => setUploadMethod(e.target.value)} className="mr-2" />
                      {method === "file" ? "Upload file" : "URL ảnh"}
                    </label>
                  ))}
                </div>

                {uploadMethod === "file" ? (
                  <div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*"
                      className={inputClass} disabled={uploading} />
                    {uploading && <p className="mt-1 text-sm text-blue-600">Đang tải ảnh...</p>}
                  </div>
                ) : (
                  <input type="url" value={blog.thumbnail} onChange={(e) => handleChange("thumbnail", e.target.value)}
                    className={inputClass} placeholder="Nhập URL ảnh" />
                )}

                {blog.thumbnail && (
                  <div className="relative inline-block">
                    <img src={blog.thumbnail} alt="Preview" className="object-cover w-32 h-32 border rounded-md"
                      onError={() => setError("Không thể tải ảnh. Vui lòng kiểm tra URL hoặc chọn file khác.")} />
                    <button type="button" onClick={clearImage}
                      className="absolute flex items-center justify-center w-6 h-6 text-sm text-white bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600">
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>Nội dung bài viết</label>
              <Editor apiKey="uqfddx0q46sq2wk7lb10d2e19dvy6uvmji190dlkn87uv6ee"
                value={blog.content} onEditorChange={(content) => handleChange("content", content)}
                init={{
                  height: 600, menubar: false,
                  plugins: ["advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor", "searchreplace", "visualblocks", "code", "fullscreen", "insertdatetime", "media", "table", "help", "wordcount"],
                  toolbar: "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | link image media | code preview fullscreen | help",
                  content_style: "body { font-family: Helvetica, Arial, sans-serif; font-size: 14px; }",
                  branding: false, resize: false, statusbar: true, elementpath: false,
                  images_upload_handler: function (blobInfo, success, failure) {
                    const reader = new FileReader();
                    reader.onload = function () { success(reader.result); };
                    reader.readAsDataURL(blobInfo.blob());
                  },
                  paste_data_images: true
                }} />
            </div>

            <div>
              <label className={labelClass}>Slug (URL thân thiện)</label>
              <input type="text" value={blog.slug} onChange={(e) => handleChange("slug", e.target.value)}
                className={inputClass} placeholder="vi-du-slug-bai-viet" />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>Trạng thái</label>
                <select value={blog.status} onChange={(e) => handleChange("status", e.target.value)} className={inputClass}>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="draft">Bản nháp</option>
                </select>
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center">
                  <input type="checkbox" checked={blog.isFeatured}
                    onChange={(e) => handleChange("isFeatured", e.target.checked)} className="mr-2 rounded" />
                  Bài viết nổi bật
                </label>
              </div>
            </div>

            <div className="flex pt-6 space-x-4">
              <button type="submit" disabled={loading} className={buttonClass}>
                {loading ? "Đang lưu..." : "Cập nhật bài viết"}
              </button>
              <button type="button" onClick={() => navigate("/admin/blog")}
                className="px-6 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500">
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditBlog;