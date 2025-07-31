import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError("");
        if (success) setSuccess("");
    };

    const validateForm = () => {
        if (!formData.userName.trim()) {
            setError("Vui lòng nhập tên người dùng");
            return false;
        }
        
        if (!formData.email.trim()) {
            setError("Vui lòng nhập email");
            return false;
        }

        if (formData.password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userName: formData.userName,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                console.log("Đăng ký thành công:", result);
                setSuccess("Đăng ký thành công! Đang chuyển hướng...");
                
                setTimeout(() => {
                    if (result.token) {
                        localStorage.setItem("token", result.token);
                        navigate("/");
                    } else {
                        navigate("/auth/login");
                    }
                }, 1500);
            } else {
                setError(result.message || "Đăng ký thất bại");
            }
        } catch (error) {
            console.error("Register error:", error);
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                setError("Không thể kết nối đến server. Vui lòng kiểm tra server có đang chạy không.");
            } else {
                setError("Lỗi kết nối. Vui lòng thử lại sau.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-gray-900">
                Đăng ký tài khoản
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="p-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded-md">
                        {success}
                    </div>
                )}
                <div>
                    <label
                        htmlFor="userName"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Tên người dùng
                    </label>
                    <input
                        id="userName"
                        name="userName"
                        type="text"
                        autoComplete="username"
                        required
                        value={formData.userName}
                        onChange={handleOnChange}
                        className="w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Nhập tên người dùng"
                    />
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleOnChange}
                        className="w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Nhập địa chỉ email"
                    />
                </div>

                {/* Mật khẩu */}
                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Mật khẩu
                    </label>
                    <div className="relative mt-1">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={formData.password}
                            onChange={handleOnChange}
                            className="w-full px-3 py-2 pr-10 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                {/* Xác nhận mật khẩu */}
                <div>
                    <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Xác nhận mật khẩu
                    </label>
                    <div className="relative mt-1">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleOnChange}
                            className="w-full px-3 py-2 pr-10 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Nhập lại mật khẩu"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                {/* Submit button */}
                <div>
                    <button
                        type="submit"
                        disabled={isLoading || success}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {success ? "Đã đăng ký thành công!" : (isLoading ? "Đang đăng ký..." : "Đăng ký")}
                    </button>
                </div>
            </form>
            
            {/* Link to login */}
            <p className="text-sm text-center text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                    to="/auth/login"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                    Đăng nhập ngay
                </Link>
            </p>
        </div>
    );
}

export default Register;