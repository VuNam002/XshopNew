import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import moment from "moment";

function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    fetch(`http://localhost:3000/blog/detail/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Không thể tải tin tức. Vui lòng thử lại sau.");
        }
        return res.json();
      })
      .then((result) => {
        const blogData = result.data || result;
        setBlog(blogData);
        document.title = blogData?.title || "Chi tiết bài viết";
        
        fetchRelatedBlogs(blogData.category?.id || blogData.categoryId);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const fetchRelatedBlogs = async (categoryId) => {
    if (!categoryId) return;
    
    setRelatedLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/blog?category=${categoryId}&limit=4&exclude=${id}`);
      if (response.ok) {
        const result = await response.json();
        setRelatedBlogs(result.data || result.blogs || []);
      }
    } catch (error) {
      console.error("Error fetching related blogs:", error);
    } finally {
      setRelatedLoading(false);
    }
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(blog?.title || '');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // Simple notification
      const notification = document.createElement('div');
      notification.className = 'fixed z-50 px-4 py-2 text-white transition-opacity bg-green-500 rounded-lg shadow-lg top-4 right-4';
      notification.textContent = 'Đã sao chép liên kết!';
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 2000);
    } catch (err) {
      alert('Đã sao chép liên kết!', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header skeleton */}
        <div className="bg-white border-b">
          <div className="max-w-4xl px-4 py-6 mx-auto">
            <div className="animate-pulse">
              <div className="w-24 h-3 mb-4 bg-gray-200 rounded"></div>
              <div className="h-8 mb-2 bg-gray-300 rounded"></div>
              <div className="w-3/4 h-8 mb-4 bg-gray-300 rounded"></div>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="max-w-4xl px-4 py-8 mx-auto">
          <div className="animate-pulse">
            <div className="mb-8 bg-gray-300 rounded-lg h-80"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md px-4 mx-auto text-center">
          <div className="p-8 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Có lỗi xảy ra</h3>
            <p className="mb-6 text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md px-4 mx-auto text-center">
          <div className="p-8 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Không tìm thấy bài viết</h3>
            <p className="mb-6 text-gray-600">Bài viết bạn yêu cầu không tồn tại hoặc đã bị xóa.</p>
            <Link 
              to="/"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl px-0 py-1 mx-auto">
          <nav className="mb-4 text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
            <span className="mx-1">/</span>
            {blog.category && (
              <>
                <span className="text-blue-600">{blog.category.name || blog.category}</span>
                <span className="mx-2">/</span>
              </>
            )}
            <span className="text-gray-900 truncate">{blog.title}</span>
          </nav>

          {/* Category badge */}
          {blog.category && (
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md">
                {blog.category.name || blog.category}
              </span>
            </div>
          )}
          <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 lg:text-4xl">
            {blog.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <span className="font-medium text-gray-900">{blog.author || "Tác giả"}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>
                {blog.createdAt
                  ? moment(blog.createdAt).format("DD/MM/YYYY, HH:mm")
                  : "Đang cập nhật"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <article className="max-w-5xl px-4 py-8 mx-auto">
        {/* Featured image */}
        {blog.thumbnail && (
          <figure className="mb-8">
            <img
              src={blog.thumbnail}
              alt={blog.title}
              className="object-cover w-full h-64 rounded-lg shadow-sm lg:h-96"
            />
          </figure>
        )}

        {/* Lead/Description */}
        {blog.description && blog.description !== blog.content && (
          <div className="mb-8">
            <p className="py-2 pl-6 text-xl italic font-light leading-relaxed text-gray-700 border-l-4 border-blue-500">
              {blog.description}
            </p>
          </div>
        )}

        {/* Article content */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-sm lg:p-8">
          <div className="prose prose-lg max-w-none">
            <div
              className="leading-relaxed text-gray-800 article-content"
              dangerouslySetInnerHTML={{ 
                __html: blog.content || blog.description || "<p class='text-gray-500 italic'>Nội dung đang được cập nhật.</p>" 
              }}
              style={{
                fontSize: '18px',
                lineHeight: '1.8',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            />
          </div>
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="p-6 mb-8 bg-white rounded-lg shadow-sm">
            <h5 className="mb-4 text-sm font-semibold tracking-wide text-gray-700 uppercase">Từ khóa</h5>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share buttons */}
        <div className="p-6 mb-12 bg-white rounded-lg shadow-sm">
          <h5 className="mb-4 text-sm font-semibold tracking-wide text-gray-700 uppercase">Chia sẻ bài viết</h5>
          <div className="flex items-center gap-3">
            <button 
              onClick={shareOnFacebook}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="font-medium">Facebook</span>
            </button>
            
            <button 
              onClick={shareOnTwitter}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span className="font-medium">Twitter</span>
            </button>
            
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              <span className="font-medium">Sao chép</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

export default BlogDetail;