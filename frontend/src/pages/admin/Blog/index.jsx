import React, { useState, useEffect } from "react";
import { Edit, Eye, Trash2, Plus } from "lucide-react";
import Pagination from "../../../helpers/pagination";

function Blog() {
  const [blog, setBlog] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");

  const [selectAll, setSelectAll] = useState(false);
  const [positions, setPositions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const API_BASE = "http://localhost:3000/blog";

  const apiRequest = async (URL, options = {}) => {
    const response = await fetch(URL, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiRequest(API_BASE);
        const blogData = result.data || [];
        setBlog(blogData);

        const initialPositions = {};
        blogData.forEach((item) => {
          if (item._id) {
            initialPositions[item._id] = item.position || 0;
          }
        });
        setPositions(initialPositions);
      } catch (error) {
        console.log("Fetch error", error);
        setError("Không thể tải dữ liệu bài viết");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, []);

  // Filter blog by status
  const filteredBlog = blog.filter((item) => {
    if (!filterStatus) return true;
    return item.status === filterStatus;
  });

  // Pagination
  const totalItems = filteredBlog.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBlog = filteredBlog.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedBlog([]);
    setSelectAll(false);
  }, [filterStatus]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedBlog([]);
    setSelectAll(false);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedBlog(checked ? paginatedBlog.map((p) => p._id) : []);
  };

  const handleSelectBlog = (blogId, checked) => {
    setSelectedBlog((prev) =>
      checked ? [...prev, blogId] : prev.filter((id) => id !== blogId)
    );
    if (!checked) setSelectAll(false);
  };

  useEffect(() => {
    const currentPageBlogIds = paginatedBlog.map((p) => p._id);
    const allCurrentPageSelected =
      currentPageBlogIds.length > 0 &&
      currentPageBlogIds.every((id) => selectedBlog.includes(id));
    setSelectAll(allCurrentPageSelected);
  }, [paginatedBlog, selectedBlog]);

  // Status change
  const handleStatusChange = async (blogId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await apiRequest(`${API_BASE}/change-status/${newStatus}/${blogId}`, {
        method: "PATCH",
      });
      setBlog((prev) =>
        prev.map((blog) =>
          blog._id === blogId ? { ...blog, status: newStatus } : blog
        )
      );
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái!");
      console.log(error);
    }
  };

  // Delete single blog
  const handleDeleteSingle = async (blogId, blogName) => {
    if (!confirm(`Bạn có chắc muốn xóa "${blogName}"?`)) return;
    try {
      await apiRequest(`${API_BASE}/delete/${blogId}`, { method: "DELETE" });
      setBlog((prev) => prev.filter((blog) => blog._id !== blogId));
      setSelectedBlog((prev) => prev.filter((id) => id !== blogId));

      // Adjust current page if needed after deletion
      const newTotal = totalItems - 1;
      const newTotalPages = Math.ceil(newTotal / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      alert("Lỗi khi xóa bài viết!");
      console.log(error);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedBlog.length === 0) {
      alert("Vui lòng chọn ít nhất một bài viết");
      return;
    }

    const actions = {
      active: {
        endpoint: "bulk-status",
        method: "PATCH",
        status: "active",
        text: "kích hoạt",
      },
      inactive: {
        endpoint: "bulk-status",
        method: "PATCH",
        status: "inactive",
        text: "tạm dừng",
      },
      delete: { endpoint: "bulk-delete", method: "DELETE", text: "xóa" },
    };

    const config = actions[action]; // Fixed: was actions[action]
    if (!config) return;

    const confirmMessage = `Bạn có chắc muốn ${config.text} ${selectedBlog.length} bài viết đã chọn?`;
    if (!confirm(confirmMessage)) return;

    try {
      const body =
        action === "delete"
          ? { blogIds: selectedBlog }
          : { blogIds: selectedBlog, status: config.status };

      await apiRequest(`${API_BASE}/${config.endpoint}`, {
        method: config.method,
        body: JSON.stringify(body),
      });

      if (action === "delete") {
        setBlog((prev) => prev.filter((p) => !selectedBlog.includes(p._id)));
        const newTotal = totalItems - selectedBlog.length;
        const newTotalPages = Math.ceil(newTotal / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } else {
        setBlog((prev) =>
          prev.map((p) =>
            selectedBlog.includes(p._id) ? { ...p, status: action } : p
          )
        );
      }

      setSelectedBlog([]);
      setSelectAll(false);
      alert(`${config.text} thành công!`);
    } catch (error) {
      alert(`Lỗi khi ${config.text}!`);
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Danh sách bài viết
        </h1>
        <p className="mt-1 text-gray-600">Quản lý bài viết của bạn</p>
      </div>

      {/* Filter Section */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Bộ lọc</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Trạng thái
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Dừng hoạt động</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <select
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={(e) =>
                  e.target.value && handleBulkAction(e.target.value)
                }
                value=""
              >
                <option value="">Hành động</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
                <option value="delete">Xóa</option>
              </select>
              <button
                onClick={() => (window.location.href = "/admin/blog/create")}
                className="inline-flex items-center px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm bài viết
              </button>
            </div>
            <span className="text-sm text-gray-600">
              Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} trong{" "}
              {totalItems} bài viết
            </span>
          </div>
        </div>

        {loading && (
          <div className="p-8 text-center text-gray-600">Đang tải...</div>
        )}

        {error && <div className="p-8 text-center text-red-600">{error}</div>}

        {!loading && !error && (
          <>
            {/* Table */}
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Hình ảnh
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Tiêu đề
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Danh mục
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedBlog.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedBlog.includes(item._id)}
                          onChange={(e) =>
                            handleSelectBlog(item._id, e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="object-cover w-16 h-16 border border-gray-200 rounded-lg"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg">
                              <span className="text-xs text-gray-400">
                                No image
                              </span>
                            </div>
                          )}
                          <div className="items-center justify-center hidden w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg">
                            <span className="text-xs text-gray-400">
                              No image
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.title}
                        </div>
                        <div className="max-w-xs text-sm text-gray-500 truncate">
                          {item.description || item.excerpt || "Không có mô tả"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {item.category_id?.title || "Chưa phân loại"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            handleStatusChange(item._id, item.status)
                          }
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === "active"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {item.status === "active" ? "Hoạt động" : "Tạm dừng"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              (window.location.href = `/admin/blog/view/${item._id}`)
                            }
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Xem"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              (window.location.href = `/admin/blog/edit/${item._id}`)
                            }
                            className="p-1 text-yellow-600 hover:text-yellow-800"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteSingle(item._id, item.title)
                            }
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  onPrevPage={handlePrevPage}
                  onNextPage={handleNextPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Blog;
