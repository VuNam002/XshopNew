import React, { useState, useEffect } from 'react';
import { Edit, Eye, Trash2, Plus } from 'lucide-react';
import Pagination from '../../../helpers/pagination';

function ProductsListPage() {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState('position');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectAll, setSelectAll] = useState(false);
  const [positions, setPositions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const API_BASE = 'http://localhost:3000/products';

  // API request helper
  const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiRequest(API_BASE);
        setProducts(result.data);
        const initialPositions = {};
        result.data.forEach(product => {
          initialPositions[product._id] = product.position;
        });
        setPositions(initialPositions);
      } catch (error) {
        console.log(error)
        setError('Không thể tải dữ liệu sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesStatus = !filterStatus || product.status === filterStatus;
      const matchesKeyword = !keyword || product.title.toLowerCase().includes(keyword.toLowerCase());
      return matchesStatus && matchesKeyword;
    })
    .sort((a, b) => {
      const getValue = (product, field) => {
        switch(field) {
          case 'title': return product.title.toLowerCase();
          case 'price': return product.price;
          case 'position': return positions[product._id] ?? product.position;
          case 'createdAt': return new Date(product.createdBy?.createdAt || product.createdAt);
          default: return positions[product._id] ?? product.position;
        }
      };
      
      const aValue = getValue(a, sortBy);
      const bValue = getValue(b, sortBy);
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      
      return aValue < bValue ? -1 * multiplier : aValue > bValue ? 1 * multiplier : 0;
    });

  // Pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedProducts([]);
    setSelectAll(false);
  }, [filterStatus, keyword, sortBy, sortOrder]);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedProducts([]);
    setSelectAll(false);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Selection handlers
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedProducts(checked ? paginatedProducts.map(p => p._id) : []);
  };

  const handleSelectProduct = (productId, checked) => {
    setSelectedProducts(prev => 
      checked ? [...prev, productId] : prev.filter(id => id !== productId)
    );
    if (!checked) setSelectAll(false);
  };

  // Update selectAll state when page changes or products change
  useEffect(() => {
    const currentPageProductIds = paginatedProducts.map(p => p._id);
    const allCurrentPageSelected = currentPageProductIds.length > 0 && 
      currentPageProductIds.every(id => selectedProducts.includes(id));
    setSelectAll(allCurrentPageSelected);
  }, [paginatedProducts, selectedProducts]);

  // Status change
  const handleStatusChange = async (productId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await apiRequest(`${API_BASE}/change-status/${newStatus}/${productId}`, {
        method: 'PATCH'
      });
      
      setProducts(prev => prev.map(product => 
        product._id === productId ? { ...product, status: newStatus } : product
      ));
    } catch (error) {
      alert('Lỗi khi cập nhật trạng thái!');
      console.log(error)
    }
  };

  // Position handlers
  const handlePositionChange = (productId, newPosition) => {
    setPositions(prev => ({ ...prev, [productId]: parseInt(newPosition) }));
  };

  const handleSavePositions = async () => {
    if (Object.keys(positions).length === 0) {
      alert('Không có thay đổi vị trí để lưu.');
      return;
    }

    const positionsToUpdate = Object.keys(positions).map(productId => ({
      _id: productId,
      position: positions[productId],
    }));

    try {
      await apiRequest(`${API_BASE}/update-positions`, {
        method: 'PATCH',
        body: JSON.stringify({ positions: positionsToUpdate })
      });
      
      const result = await apiRequest(API_BASE);
      setProducts(result.data);
      const updatedPositions = {};
      result.data.forEach(product => {
        updatedPositions[product._id] = product.position;
      });
      setPositions(updatedPositions);
      alert('Cập nhật vị trí thành công!');
    } catch (error) {
      alert('Lỗi khi lưu vị trí!');
      console.log(error)
    }
  };

  // Delete single product
  const handleDeleteSingle = async (productId, productName) => {
    if (!confirm(`Bạn có chắc muốn xóa "${productName}"?`)) return;
    
    try {
      await apiRequest(`${API_BASE}/delete/${productId}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(product => product._id !== productId));
      setSelectedProducts(prev => prev.filter(id => id !== productId));
      
      // Adjust current page if needed after deletion
      const newTotal = totalItems - 1;
      const newTotalPages = Math.ceil(newTotal / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      alert('Lỗi khi xóa sản phẩm!');
      console.log(error)
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (selectedProducts.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm.');
      return;
    }

    const actions = {
      active: { endpoint: 'bulk-status', method: 'PATCH', status: 'active', text: 'kích hoạt' },
      inactive: { endpoint: 'bulk-status', method: 'PATCH', status: 'inactive', text: 'tạm dừng' },
      delete: { endpoint: 'bulk-delete', method: 'DELETE', text: 'xóa' }
    };

    const config = actions[action];
    if (!config) return;

    const confirmMessage = `Bạn có chắc muốn ${config.text} ${selectedProducts.length} sản phẩm đã chọn?`;
    if (!confirm(confirmMessage)) return;

    try {
      const body = action === 'delete' 
        ? { productIds: selectedProducts }
        : { productIds: selectedProducts, status: config.status };

      await apiRequest(`${API_BASE}/${config.endpoint}`, {
        method: config.method,
        body: JSON.stringify(body)
      });

      if (action === 'delete') {
        setProducts(prev => prev.filter(p => !selectedProducts.includes(p._id)));
        const newTotal = totalItems - selectedProducts.length;
        const newTotalPages = Math.ceil(newTotal / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } else {
        setProducts(prev => prev.map(p => 
          selectedProducts.includes(p._id) ? { ...p, status: action } : p
        ));
      }
      
      setSelectedProducts([]);
      setSelectAll(false);
      alert(`${config.text} thành công!`);
    } catch (error) {
      alert(`Lỗi khi ${config.text}!`);
      console.log(error)
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Danh sách sản phẩm</h1>
          <p className="mt-1 text-gray-600">Quản lý sản phẩm của cửa hàng</p>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Bộ lọc</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Trạng thái</label>
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
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Tìm kiếm</label>
                <input
                  type="text"
                  placeholder="Nhập tên sản phẩm..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Sắp xếp</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="position">Vị trí</option>
                    <option value="title">Tên</option>
                    <option value="price">Giá</option>
                    <option value="createdAt">Ngày tạo</option>
                  </select>
                  <select 
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="asc">Tăng</option>
                    <option value="desc">Giảm</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions & Table */}
        <div className="bg-white border border-gray-200 rounded-lg">
          {/* Action bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <select 
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => e.target.value && handleBulkAction(e.target.value)}
                  value=""
                >
                  <option value="">Hành động</option>
                  <option value="active">Kích hoạt</option>
                  <option value="inactive">Tạm dừng</option>
                  <option value="delete">Xóa</option>
                </select>
                <button
                  onClick={handleSavePositions}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Lưu vị trí
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} trong tổng {totalItems} sản phẩm
                </span>
                <button
                  onClick={() => window.location.href = '/admin/products/create'}
                  className="inline-flex items-center px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm sản phẩm
                </button>
              </div>
            </div>
          </div>

          {/* Loading & Error */}
          {loading && (
            <div className="p-8 text-center text-gray-600">Đang tải...</div>
          )}
          
          {error && (
            <div className="p-8 text-center text-red-600">{error}</div>
          )}

          {/* Table */}
          {!loading && !error && (
            <>
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
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">STT</th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Ảnh</th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Tên sản phẩm</th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Giá</th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Vị trí</th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Trạng thái</th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                          Không có sản phẩm nào
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((product, index) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product._id)}
                              onChange={(e) => handleSelectProduct(product._id, e.target.checked)}
                              className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{startIndex + index + 1}</td>
                          <td className="px-6 py-4">
                            <img
                              src={product.img}
                              alt={product.title}
                              className="object-cover w-12 h-12 rounded-lg"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs text-sm font-medium text-gray-900 truncate">
                              {product.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {product.price} VNĐ
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={positions[product._id] ?? product.position}
                              onChange={(e) => handlePositionChange(product._id, e.target.value)}
                              className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              min="1"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleStatusChange(product._id, product.status)}
                              className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                                product.status === 'active'
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {product.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => window.location.href = `/admin/products/update/${product._id}`}
                                className="p-1 text-blue-600 rounded hover:bg-blue-50"
                                title="Sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => window.location.href = `/admin/products/detail/${product._id}`}
                                className="p-1 text-gray-600 rounded hover:bg-gray-50"
                                title="Xem"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSingle(product._id, product.title)}
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
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onPrevPage={handlePrevPage}
                  onNextPage={handleNextPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductsListPage;