import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { FaUpload, FaLink, FaTimes } from "react-icons/fa";


function CreateBlog() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [categories, setCategories] = useState([]);
    const [newBlog, setNewBlog] = useState({
        title: '', description: '', thumbnail: '', content: '', 
        status: 'active', isFeatured: false, slug: '', category_id: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadMethod, setUploadMethod] = useState('file');
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    const API_BASE = { blog: 'http://localhost:3000/blog', category: 'http://localhost:3000/category-blog' };

    // API helper
    const apiRequest = async (url, options = {}) => {
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        return response.json();
    };

    // Fetch categories
    useEffect(() => {
        apiRequest(API_BASE.category)
            .then(result => {
                const data = Array.isArray(result) ? result : result.data || result.categories || [];
                setCategories(data);
            })
            .catch(err => setError('Không thể tải danh mục: ' + err.message));
    }, []);

    // Handle form changes
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setNewBlog(prev => ({
            ...prev,
            [name]: type === 'radio' ? value === 'true' : value
        }));
    };

    // Process image (file or canvas)
    const processImage = (src, isFile = false) => {
        setUploading(true);
        const img = new Image();
        
        if (!isFile) img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            if (!isFile) {
                setNewBlog(prev => ({ ...prev, thumbnail: src }));
                setUploading(false);
                setImageUrl('');
                return;
            }

            // Resize for file uploads
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 1024;
            let { width, height } = img;
            
            if (width > height && width > MAX_SIZE) {
                height = (height * MAX_SIZE) / width;
                width = MAX_SIZE;
            } else if (height > MAX_SIZE) {
                width = (width * MAX_SIZE) / height;
                height = MAX_SIZE;
            }

            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            
            setNewBlog(prev => ({ ...prev, thumbnail: canvas.toDataURL('image/jpeg', 0.8) }));
            setUploading(false);
        };
        
        img.onerror = () => {
            setError(isFile ? 'Lỗi xử lý file ảnh' : 'Không thể tải ảnh từ URL');
            setUploading(false);
        };
        
        img.src = src;
    };

    // Handle file upload
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return alert('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)');
        }
        if (file.size > 5 * 1024 * 1024) {
            return alert('File không được vượt quá 5MB');
        }

        const reader = new FileReader();
        reader.onload = (e) => processImage(e.target.result, true);
        reader.onerror = () => setError('Lỗi đọc file');
        reader.readAsDataURL(file);
    };

    // Handle URL upload
    const handleImageUrl = () => {
        if (!imageUrl) return alert('Vui lòng nhập URL hình ảnh');
        processImage(imageUrl);
    };

    // Clear image
    const clearImage = () => {
        setNewBlog(prev => ({ ...prev, thumbnail: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
        setImageUrl('');
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newBlog.title || !newBlog.category_id) {
            return alert('Vui lòng điền tên bài viết và chọn danh mục.');
        }

        setLoading(true);
        setError(null);
        
        try {
            await apiRequest(`${API_BASE.blog}/create`, {
                method: 'POST',
                body: JSON.stringify(newBlog)
            });
            alert('Tạo bài viết thành công!');
            navigate('/admin/blog');
        } catch (err) {
            setError(err.message || 'Đã xảy ra lỗi khi tạo bài viết.');
        } finally {
            setLoading(false);
        }
    };

    // Editor config
    const editorConfig = (height = 300) => ({
        height,
        menubar: false,
        plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'code', 'table', 'wordcount'],
        toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist | removeformat'
    });

    // Form fields config
    const formFields = [
        { name: 'title', label: 'Tên bài viết *', type: 'text', required: true },
        { name: 'slug', label: 'Slug (URL thân thiện)', type: 'text', placeholder: 'vd: bai-viet-moi' },
    ];

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <div className="max-w-4xl p-8 mx-auto bg-white rounded-lg shadow-md">
                <h1 className="mb-6 text-2xl font-bold text-gray-800">Tạo bài viết mới</h1>
                
                {error && (
                    <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
                        <strong>Lỗi: </strong>{error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic fields */}
                    {formFields.map(field => (
                        <div key={field.name}>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={newBlog[field.name]}
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                required={field.required}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    ))}

                    {/* Category */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Danh mục *</label>
                        <select
                            name="category_id"
                            value={newBlog.category_id}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map(cat => (
                                <option key={cat._id || cat.id} value={cat._id || cat.id}>
                                    {cat.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description & Content Editors */}
                    {[
                        { field: 'description', label: 'Mô tả', height: 300 },
                        { field: 'content', label: 'Nội dung bài viết', height: 600 }
                    ].map(({ field, label, height }) => (
                        <div key={field}>
                            <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
                            <Editor
                                apiKey="uqfddx0q46sq2wk7lb10d2e19dvy6uvmji190dlkn87uv6ee"
                                init={editorConfig(height)}
                                value={newBlog[field]}
                               
                                onEditorChange={content => setNewBlog(prev => ({ ...prev, [field]: content }))}
                            />
                        </div>
                    ))}

                    {/* Image Upload */}
                    <div>
                        <label className="block mb-3 text-sm font-medium text-gray-700">Hình ảnh bài viết</label>
                        
                        <div className="flex mb-4 space-x-6">
                            {[
                                { value: 'file', icon: FaUpload, label: 'Tải lên từ máy' },
                                { value: 'url', icon: FaLink, label: 'Từ URL' }
                            ].map(({ value, icon: Icon, label }) => (
                                <label key={value} className="flex items-center">
                                    <input
                                        type="radio"
                                        value={value}
                                        checked={uploadMethod === value}
                                        onChange={(e) => setUploadMethod(e.target.value)}
                                        className="mr-2"
                                    />
                                    <Icon className="mr-1" /> {label}
                                </label>
                            ))}
                        </div>

                        {uploadMethod === 'file' ? (
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        ) : (
                            <div className="flex mb-4 space-x-2">
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="Nhập URL hình ảnh"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleImageUrl}
                                    disabled={uploading}
                                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {uploading ? 'Đang tải...' : 'Thêm'}
                                </button>
                            </div>
                        )}

                        {newBlog.thumbnail && (
                            <div className="relative inline-block">
                                <img 
                                    src={newBlog.thumbnail} 
                                    alt="Preview" 
                                    className="max-w-xs border border-gray-300 rounded-md max-h-48"
                                />
                                <button
                                    type="button"
                                    onClick={clearImage}
                                    className="absolute p-1 text-white bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
                                >
                                    <FaTimes size={12} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Status & Featured */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Trạng thái</label>
                            <select
                                name="status"
                                value={newBlog.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Không hoạt động</option>
                                <option value="draft">Bản nháp</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Bài viết nổi bật</label>
                            <div className="flex space-x-4">
                                {[
                                    { value: 'false', label: 'Không' },
                                    { value: 'true', label: 'Có' }
                                ].map(({ value, label }) => (
                                    <label key={value} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="isFeatured"
                                            value={value}
                                            checked={newBlog.isFeatured.toString() === value}
                                            onChange={handleChange}
                                            className="mr-2"
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end pt-4 space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/blogs')}
                            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Đang tạo...' : 'Tạo bài viết'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateBlog;