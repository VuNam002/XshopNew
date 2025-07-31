import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaRegFolder,
  FaUsers,
  FaBoxOpen,
  FaSignOutAlt,
  FaPlus,
} from "react-icons/fa";
import { PiArticle } from "react-icons/pi";
import { BiCategory } from "react-icons/bi";

function LayoutAdmin() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Kiểm tra token và lấy role
  useEffect(() => {
    if (!token) {
      navigate("/auth/login");
      return;
    }

    const getCurrentUserRole = () => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserRole(payload.role);
      } catch (error) {
        console.log("Error parsing token:", error);
        setCurrentUserRole('customer');
      }
    };

    getCurrentUserRole();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const activeLink =
    "group relative flex items-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-lg shadow-md transition-all duration-200 hover:scale-[1.02] overflow-hidden";

  const normalLink =
    "group relative flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-700 hover:text-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98]";

  // Loading state
  if (currentUserRole === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 shadow-xl bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800">
        {/* Header */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-700 shadow-lg bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900">
          <Link
            to="/admin"
            className="text-xl font-bold tracking-wide text-white transition-colors duration-200 transform hover:scale-105"
          >
            Luttte Admin
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2"> 
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => (isActive ? activeLink : normalLink)}
          >
            <FaTachometerAlt className="mr-3 transition-transform duration-200 group-hover:scale-105" /> 
            <span className="relative z-10">Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            end
            className={({ isActive }) => (isActive ? activeLink : normalLink)}
          >
            <FaBoxOpen className="mr-3 transition-transform duration-200 group-hover:scale-105" /> 
            <span className="relative z-10">Sản phẩm</span>
          </NavLink>

          <NavLink
            to="/admin/products/create"
            className={({ isActive }) => (isActive ? activeLink : normalLink)}
          >
            <FaPlus className="mr-3 transition-transform duration-200 group-hover:scale-105" /> 
            <span className="relative z-10">Tạo sản phẩm</span>
          </NavLink>

          <NavLink
            to="/admin/category"
            end
            className={({ isActive }) => (isActive ? activeLink : normalLink)}
          >
            <FaRegFolder className="mr-3 transition-transform duration-200 group-hover:scale-105" /> 
            <span className="relative z-10">Danh mục sản phẩm</span>
          </NavLink>

          <NavLink
            to="/admin/category/create"
            className={({ isActive }) => (isActive ? activeLink : normalLink)}
          >
            <FaPlus className="mr-3 transition-transform duration-200 group-hover:scale-105" /> 
            <span className="relative z-10">Tạo danh mục</span>
          </NavLink>

          <NavLink
            to="/admin/blog"
            end
            className={({ isActive }) => (isActive ? activeLink : normalLink)}
          >
            <PiArticle className="mr-3 transition-transform duration-200 group-hover:scale-105" />
            <span className="relative z-10">Bài viết</span>
          </NavLink>
          <NavLink
            to="/admin/categoryBlog"
            className={({ isActive }) => (isActive ? activeLink : normalLink)}
          >
            <BiCategory className="mr-3 transition-transform duration-200 group-hover:scale-105" />
            <span className="relative z-10">Danh mục bài viết</span>
          </NavLink>

          {/* Chỉ admin mới thấy menu Người dùng  phần chính*/}
          {currentUserRole === "admin" && (    
            <NavLink
              to="/admin/users"
              className={({ isActive }) => (isActive ? activeLink : normalLink)}
            >
              <FaUsers className="mr-3 transition-transform duration-200 group-hover:scale-105" />
              <span className="relative z-10">Người dùng</span>
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="group relative flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 transition-all duration-200 rounded-lg hover:bg-red-700 hover:text-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <FaSignOutAlt className="mr-3 transition-transform duration-200 group-hover:scale-105" /> 
            <span className="relative z-10">Đăng xuất</span>

            <div className="absolute inset-0 transition-opacity duration-200 rounded-lg opacity-0 group-hover:opacity-100">
              <div className="absolute w-full h-full transition-transform duration-300 scale-0 -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 bg-white/10 group-hover:scale-100"></div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header bar */}
        <header className="border-b border-gray-200 shadow-sm bg-gradient-to-r from-white via-blue-50 to-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800 transition-colors duration-200 hover:text-blue-700">
              Quản lý hệ thống
            </h1>
            <p className="mt-1 text-sm text-gray-600 transition-colors duration-200 hover:text-gray-800">
              Chào mừng bạn đến với trang quản trị - Role: {currentUserRole}
            </p>
          </div>
        </header>

        {/* Content Area */}
        <div className="min-h-full p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default LayoutAdmin;