import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Editor } from '@tinymce/tinymce-react';
import { FaUpload, FaImage, FaTimes, FaSave } from 'react-icons/fa';

function CreateCategoryBlog() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [newCategory, setNewCategory] = useState({
        title: '',
        description: '',
        img: '',
        status: 'active'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMethod, setUploadMethod] = useState('file');

    const API_CATEGORIES_BASE = "http://localhost:3000/category-blog";

    const apiRequest = async (url, options = {}) => {
        const token = localStorage.getItem('token');
        const finalHeaders = { ...options.headers };
        if (token) {
            finalHeaders['Authorization'] = `Bearer ${token}`;
        }
        if (!(options.body instanceof FormData) && !finalHeaders['Content-Type']) {
            finalHeaders['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, { ...options, headers: finalHeaders });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: `HTTP error! Status: ${response.status}`
            }));
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCategory(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // validate
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)');
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // Fixed: was 102*1024, should be 1024
            alert('File ảnh không được vượt quá 2MB');
            return;
        }
        
        setUploading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            setNewCategory(prev => ({ ...prev, img: e.target.result }));
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        setNewCategory(prev => ({ ...prev, img: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCategory.title) {
            alert('Vui lòng nhập tiêu đề');
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            await apiRequest(`${API_CATEGORIES_BASE}/create`, {
                method: 'POST',
                body: JSON.stringify(newCategory)
            });
            alert('Tạo danh mục thành công!');
            navigate('/admin/categoryBlog');
        } catch (err) {
            setError(err.message || 'Đã xảy ra lỗi khi tạo danh mục');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <div className="max-w-4xl p-8 mx-auto bg-white rounded-lg shadow-md">
                <h1 className="mb-6 text-2xl font-bold text-gray-800">Tạo danh mục mới</h1>

                {error && (
                    <div className="relative px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400">
                        <strong className="font-bold">Lỗi!</strong> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tên danh mục - Fixed: name should be title */}
                    <div>
                        <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-700">Tên danh mục</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={newCategory.title}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required 
                        />
                    </div>
                    
                    {/* Mô tả */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Mô tả</label>
                        <Editor
                            apiKey="uqfddx0q46sq2wk7lb10d2e19dvy6uvmji190dlkn87uv6ee"
                            init={{
                                height: 600,
                                menubar: false,
                                plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'code', 'table', 'wordcount'],
                                toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist | removeformat',
                            }}
                            value={newCategory.description}
                            onEditorChange={(content) => setNewCategory(prev => ({...prev, description: content}))}  
                        />
                    </div>
                    
                    {/* Hình ảnh */}
                    <div>
                        <label className="block mb-3 text-sm font-medium text-gray-700">Hình ảnh danh mục</label>
                        <div className="flex mb-4 space-x-4">
                            <label className="flex items-center">
                                <input 
                                    type="radio" 
                                    value="file" 
                                    checked={uploadMethod === 'file'} 
                                    onChange={(e) => setUploadMethod(e.target.value)} 
                                    className="mr-2" 
                                />
                                <FaUpload className="mr-1" /> Upload từ máy
                            </label>
                            <label className="flex items-center">
                                <input 
                                    type="radio" 
                                    value="url" 
                                    checked={uploadMethod === 'url'} 
                                    onChange={(e) => setUploadMethod(e.target.value)} 
                                    className="mr-2" 
                                />
                                <FaImage className="mr-1" /> Nhập URL
                            </label>
                        </div>

                        {uploadMethod === 'file' ? (
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
                                <p className="mt-1 text-xs text-gray-500">Chấp nhận: JPEG, PNG, GIF, WebP. Tối đa 2MB.</p>
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
                                    onError={(e) => e.target.style.display = 'none'}
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
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div>
                            <label htmlFor="status" className="block mb-1 text-sm font-medium text-gray-700">Trạng thái</label>
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
                    </div>

                    {/* Submit button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="flex items-center px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading || uploading}
                        >
                            <FaSave className="mr-2"/>
                            {loading ? "Đang lưu..." : uploading ? "Đang xử lý ảnh..." : "Lưu danh mục"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateCategoryBlog;