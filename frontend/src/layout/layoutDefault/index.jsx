import React, { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../../assets/3xshop-light.png";
import { MdOutlinePhoneAndroid } from "react-icons/md";
import { BiLogoGmail } from "react-icons/bi";
import { LuMapPinCheckInside } from "react-icons/lu";
import { IoTime } from "react-icons/io5";
import { FaFacebook } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { Menu, X } from "lucide-react";
import HeaderSearch from "@/helpers/search";
import { FaTiktok } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa";

function LayoutDefault() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const cartItems = useSelector((state) => state.cart);
  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Bar */}
      <div className="text-white bg-slate-800">
        <div className="flex items-center justify-center px-4 py-3 mx-auto max-w-7xl">
          <div className="flex items-center space-x-6 text-sm">
            <span className="flex items-center gap-2">
              <MdOutlinePhoneAndroid />
              0986067214
            </span>
            <span className="flex items-center gap-2">
              <BiLogoGmail />
              namvu7702@gmail.com
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Company Logo"
                  className="object-contain w-auto h-12"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="items-center hidden space-x-2 lg:flex">
              <Link
                to="/"
                className="px-4 py-2.5 text-sm font-medium hover:text-blue-500"
              >
                Trang chủ
              </Link>
              <Link
                to="/products"
                className="px-4 py-2.5 text-sm font-medium hover:text-blue-500"
              >
                Sản phẩm
              </Link>

              <Link
                to="/about"
                className="px-4 py-2.5 text-sm font-medium hover:text-blue-500"
              >
                Giới thiệu
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <NavLink
                  to="/blog"
                  className="flex items-center px-4 py-2.5 text-sm font-medium hover:text-blue-600"
                >
                  Blog
                </NavLink>
              </div>
              <div>
                <HeaderSearch />
              </div>
              <NavLink
                to="/cart"
                className="relative flex items-center gap-2 px-5 py-4 text-base font-semibold text-gray-700 transition duration-200 hover:text-blue-600"
              >
                <FaCartPlus className="text-2xl" />
                {totalQuantity > 0 && (
                  <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full top-1 right-1">
                    {totalQuantity}
                  </span>
                )}
              </NavLink>
            </nav>
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-700 rounded-md hover:text-blue-600 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="bg-white border-t lg:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  to="/"
                  className="block px-3 py-3 text-base font-medium text-gray-700 rounded-md hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Trang chủ
                </Link>
                <Link
                  to="/about"
                  className="block px-3 py-3 text-base font-medium text-gray-700 rounded-md hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Giới thiệu
                </Link>
                <div className="px-3 py-2">
                  <div className="mb-2 text-sm font-medium text-gray-700 rounded-md">
                    Blog
                  </div>
                  <NavLink
                    to="/blog"
                    className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tất cả bài viết
                  </NavLink>
                  <NavLink
                    to="/blog/news"
                    className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tin tức
                  </NavLink>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>

      <footer className="bg-[#1D293D]">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6 space-x-3">
                <div className="flex items-center justify-center w-[175px] h-[48px] bg-white ">
                  <span className="text-xl font-bold text-white">
                    <img src={logo} />
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Thời trang</h3>
                  <p className="text-sm text-white">Thời trang hiện đại</p>
                </div>
              </div>
              <p className="max-w-md mb-4 text-sm leading-relaxed text-white">
                Chúng tôi cam kết mang đến những sản phẩm tốt nhất
                <br />
                đến với mọi người cùng với sự phát triển của đất nước.
              </p>
              <div className="flex mt-6 space-x-3">
                <a
                  href="#"
                  className="flex items-center justify-center w-10 h-10 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <span className="text-sm font-semibold">
                    <FaFacebook />
                  </span>
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center w-10 h-10 text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  <span className="text-sm font-semibold">
                    <FaYoutube />
                  </span>
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center w-10 h-10 text-white bg-black rounded-lg hover:bg-black"
                >
                  <span className="text-sm font-semibold">
                    <FaTiktok />
                  </span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-6 text-lg font-semibold text-white">
                Liên kết
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/"
                    className="text-sm text-white hover:text-blue-600"
                  >
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-sm text-white hover:text-blue-600"
                  >
                    Giới thiệu
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-sm text-white hover:text-blue-600"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-sm text-white hover:text-blue-600"
                  >
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="mb-6 text-lg font-semibold text-white">Liên hệ</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-white mt-0.5">
                    <LuMapPinCheckInside />
                  </span>
                  <p className="text-sm text-white">
                    Đường Lê Công Thanh
                    <br />
                    Phủ Lý, Việt Nam
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <MdOutlinePhoneAndroid />
                  <p className="text-sm text-white">0986067214</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-white">
                    <BiLogoGmail />
                  </span>
                  <p className="text-sm text-white">namvu7702@gmail.com</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-white">
                    <IoTime />
                  </span>
                  <p className="text-sm text-white">T2-T6: 8:00 - 17:30</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between pt-8 mt-8 border-t border-gray-200 md:flex-row">
            <p className="text-sm text-gray-500">
              © 2025 Company. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex mt-4 space-x-6 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Chính sách bảo mật
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Điều khoản sử dụng
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LayoutDefault;
