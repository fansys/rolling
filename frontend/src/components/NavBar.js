import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import UserProfileModal from "./UserProfileModal";

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white/90 shadow-lg z-50 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Logo */}
          <div className="flex items-center">
            <div className="font-bold text-lg sm:text-xl text-blue-700 truncate">
              <span className="hidden sm:inline">智能点名系统</span>
              <span className="sm:hidden">点名系统</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/rollcall"
                className={`hover:text-blue-600 px-3 py-2 rounded-md transition-colors font-medium ${
                  location.pathname === "/rollcall"
                    ? "text-blue-700 bg-blue-50"
                    : "text-gray-700"
                }`}
              >
                智能点名
              </Link>
              <Link
                to="/students"
                className={`hover:text-blue-600 px-3 py-2 rounded-md transition-colors font-medium ${
                  location.pathname === "/students"
                    ? "text-blue-700 bg-blue-50"
                    : "text-gray-700"
                }`}
              >
                学生管理
              </Link>
              {user?.userType === "admin" && (
                <Link
                  to="/users"
                  className={`hover:text-blue-600 px-3 py-2 rounded-md transition-colors font-medium ${
                    location.pathname === "/users"
                      ? "text-blue-700 bg-blue-50"
                      : "text-gray-700"
                  }`}
                >
                  用户管理
                </Link>
              )}
            </div>
          )}

          {/* Desktop User Info */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="font-medium truncate max-w-24">
                    {user?.username || "未登录"}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors font-medium"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span className="hidden lg:inline">退出登录</span>
                  <span className="lg:hidden">退出</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors font-medium"
              >
                登录
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          {isAuthenticated && (
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors mr-2"
              >
                <UserIcon className="w-4 h-4" />
                <span className="font-medium text-sm truncate max-w-16">
                  {user?.username || "未登录"}
                </span>
              </button>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          )}

          {/* Mobile Login Button */}
          {!isAuthenticated && (
            <div className="md:hidden">
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md transition-colors font-medium text-sm"
              >
                登录
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isAuthenticated && isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              <Link
                to="/rollcall"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block hover:text-blue-600 px-3 py-2 rounded-md transition-colors font-medium ${
                  location.pathname === "/rollcall"
                    ? "text-blue-700 bg-blue-50"
                    : "text-gray-700"
                }`}
              >
                点名
              </Link>
              <Link
                to="/students"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block hover:text-blue-600 px-3 py-2 rounded-md transition-colors font-medium ${
                  location.pathname === "/students"
                    ? "text-blue-700 bg-blue-50"
                    : "text-gray-700"
                }`}
              >
                学生管理
              </Link>
              {user?.userType === "admin" && (
                <Link
                  to="/users"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block hover:text-blue-600 px-3 py-2 rounded-md transition-colors font-medium ${
                    location.pathname === "/users"
                      ? "text-blue-700 bg-blue-50"
                      : "text-gray-700"
                  }`}
                >
                  用户管理
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md transition-colors font-medium mt-2"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                退出登录
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 个人资料弹窗 */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
}

export default NavBar;
