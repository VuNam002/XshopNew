import { Plus, Edit, Eye, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";

function UsersListPage() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState("admin"); // Thêm state để lưu role của user hiện tại

  const API_BASE = "http://localhost:3000/auth";

  // API request helper
  const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  // Lấy role từ JWT token (CÁCH CHUẨN NHẤT)
  useEffect(() => {
    const getCurrentUserRole = () => {
      try {
        // Cách 1: Từ JWT Token (khuyến nghị)
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUserRole(payload.role);
          return;
        }

        // Cách 2: Từ localStorage backup
        const savedRole = localStorage.getItem('userRole');
        if (savedRole) {
          setCurrentUserRole(savedRole);
          return;
        }

        // Cách 3: Default fallback
        setCurrentUserRole('customer');
        
      } catch (error) {
        console.log("Error parsing token:", error);
        setCurrentUserRole('customer');
      }
    };

    getCurrentUserRole();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiRequest(API_BASE);
        const userData = result.data || [];
        setUsers(userData);
      } catch (error) {
        console.log("Fetch error:", error);
        setError("Không thể tải dữ liệu tài khoản");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch current user role - SỬA LẠI HOÀN TOÀN
  useEffect(() => {
    // Đơn giản hóa - không gọi API trong này nữa
    setCurrentUserRole('admin');
    console.log("useEffect chạy - set role admin");
  }, []); // Empty dependency array - chỉ chạy 1 lần

  // Filter users by status
  const filteredUsers = users.filter((user) => {
    const matchesStatus = !filterStatus || user.status === filterStatus;
    return matchesStatus;
  });

  // Handle select all
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedUsers(checked ? filteredUsers.map((user) => user._id) : []);
  };

  // Handle select individual user
  const handleSelectUser = (userId, checked) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, userId] : prev.filter((id) => id !== userId)
    );
    if (!checked) setSelectAll(false);
  };

  // Update selectAll state when individual selections change
  useEffect(() => {
    if (filteredUsers.length > 0) {
      const allSelected = filteredUsers.every((user) =>
        selectedUsers.includes(user._id)
      );
      setSelectAll(allSelected);
    }
  }, [selectedUsers, filteredUsers]);

  // Handle status change - SỬA LẠI CHỈ 2 STATUS
  const handleStatusChange = async (userId, currentStatus) => {
    // Chỉ toggle giữa active và inactive
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    
    try {
      await apiRequest(`${API_BASE}/change-status/${newStatus}/${userId}`, {
        method: "PATCH",
      });

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái!");
      console.log(error);
    }
  };

  //Handle role change
  const handleRoleChange = async (userId, currentRole) => {
    // Cycle through roles: customer -> staff -> admin -> customer
    let newRole;
    switch (currentRole) {
      case "customer":
        newRole = "staff";
        break;
      case "staff":
        newRole = "admin";
        break;
      case "admin":
        newRole = "customer";
        break;
      default:
        newRole = "customer";
    }
    
    try {
      await apiRequest(`${API_BASE}/change-role/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      // Cập nhật lại state để UI thay đổi
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
    }catch(error){
        alert("Lỗi khi cập nhật vai trò!");
        console.log(error);
    }
  }

  // Delete single user
  const handleDeleteSingle = async (userId, userName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa "${userName}"?`)) return;
    try {
      await apiRequest(`${API_BASE}/delete/${userId}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    } catch (error) {
      alert("Lỗi khi xóa người dùng!");
      console.log(error);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert("Vui lòng chọn ít nhất một người dùng.");
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

    const config = actions[action];
    if (!config) return;

    const confirmMessage = `Bạn có chắc muốn ${config.text} ${selectedUsers.length} người dùng đã chọn?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const body =
        action === "delete"
          ? { userIds: selectedUsers }
          : { userIds: selectedUsers, status: config.status };

      await apiRequest(`${API_BASE}/${config.endpoint}`, {
        method: config.method,
        body: JSON.stringify(body),
      });

      if (action === "delete") {
        setUsers((prev) =>
          prev.filter((user) => !selectedUsers.includes(user._id))
        );
      } else {
        setUsers((prev) =>
          prev.map((user) =>
            selectedUsers.includes(user._id)
              ? { ...user, status: action }
              : user
          )
        );
      }
      setSelectedUsers([]);
      setSelectAll(false);
      alert(`${config.text} thành công!`);
    } catch (error) {
      alert(`Lỗi khi ${config.text}!`);
      console.log(error);
    }
  };

  // Kiểm tra quyền truy cập
  if (currentUserRole === null) {
    // Đang loading
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (currentUserRole !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-semibold text-gray-900">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600">
            Chỉ có quản trị viên mới được phép truy cập trang này. Role hiện tại: {currentUserRole}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Danh sách người dùng
          </h1>
          <p className="mt-1 text-gray-600">Quản lý danh sách người dùng</p>
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
                  <option value="inactive">Tạm dừng</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
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
                  <option value="active">Kích hoạt</option>
                  <option value="inactive">Tạm dừng</option>
                  <option value="delete">Xóa</option>
                </select>
                <button
                  onClick={() => (window.location.href = "/auth/register")}
                  className="inline-flex items-center px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm người dùng
                </button>
              </div>
            </div>
          </div>

          {/* Loading & Error States */}
          {loading && (
            <div className="p-8 text-center text-gray-600">Đang tải...</div>
          )}

          {error && <div className="p-8 text-center text-red-600">{error}</div>}

          {/* Table */}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                      STT
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                      Phân quyền
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Không có người dùng nào
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={(e) =>
                              handleSelectUser(user._id, e.target.checked)
                            }
                            className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.fullName || user.userName || "Không có tên"}
                        </td>

                        <td>
                          <button
                            onClick={() =>
                              handleRoleChange(user._id, user.role)
                            }
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              user.role === "admin"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                : user.role === "staff"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                          >
                            {user.role === "admin"
                              ? "Quản trị viên"
                              : user.role === "staff"
                              ? "Nhân viên"
                              : "Khách hàng"}
                          </button>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              handleStatusChange(user._id, user.status)
                            }
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                          >
                            {user.status === "active" ? "Hoạt động" : "Tạm dừng"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                (window.location.href = `/admin/users/edit/${user._id}`)
                              }
                              className="p-1 text-blue-600 rounded hover:bg-blue-50"
                              title="Sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                (window.location.href = `/admin/user/detail/${user._id}`)
                              }
                              className="p-1 text-gray-600 rounded hover:bg-gray-50"
                              title="Xem"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteSingle(
                                  user._id,
                                  user.name || user.title || "người dùng này"
                                )
                              }
                              className="p-1 text-red-600 rounded hover:bg-red-50"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UsersListPage;