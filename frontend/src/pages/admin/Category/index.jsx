import React, { useState, useEffect } from 'react';
import { Edit, Eye, Trash2, Plus } from 'lucide-react';

function CategoryListPage() {
  const [category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');

  const [selectAll, setSelectAll] = useState(false);
  const [positions, setPositions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost:3000/category';

  // API request helper
  const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  // Fetch category
  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiRequest(API_BASE);
        // API bây giờ đã nhất quán, chỉ cần lấy result.data
        const categoryData = result.data || [];

        setCategory(categoryData);
        
        // Initialize positions safely
        const initialPositions = {};
        categoryData.forEach((cat) => {
          if (cat._id) {
            initialPositions[cat._id] = cat.position || 0;
          }
        });
        setPositions(initialPositions);
        
      } catch (error) {
        console.log('Fetch error:', error);
        setError('Không thể tải dữ liệu danh mục');
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, []);

  // Filter  category
  const filteredCategory = category
    .filter(cat => {
      const matchesStatus = !filterStatus || cat.status === filterStatus;
      return matchesStatus
    })

  // Selection handlers
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedCategory(checked ? filteredCategory.map(p => p._id) : []);
  };

  const handleSelectCategory = (categoryId, checked) => {
    setSelectedCategory(prev => 
      checked ? [...prev, categoryId] : prev.filter(id => id !== categoryId)
    );
    if (!checked) setSelectAll(false);
  };

  // Status change
  const handleStatusChange = async (categoryId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await apiRequest(`${API_BASE}/change-status/${newStatus}/${categoryId}`, {
        method: 'PATCH'
      });
      
      setCategory(prev => prev.map(cat => 
        cat._id === categoryId ? { ...cat, status: newStatus } : cat
      ));

    } catch (error) {
      alert('Lỗi khi cập nhật trạng thái!');
      console.log(error);
    }
  };

  // Position handlers
  const handlePositionChange = (categoryId, newPosition) => {
    setPositions(prev => ({ ...prev, [categoryId]: parseInt(newPosition) }));
  };

  const handleSavePositions = async () => {
    if (Object.keys(positions).length === 0) {
      alert('Không có thay đổi vị trí để lưu.');
      return;
    }

    const positionsToUpdate = Object.keys(positions).map(categoryId => ({
      _id: categoryId,
      position: positions[categoryId],
    }));

    try {
      await apiRequest(`${API_BASE}/update-positions`, {
        method: 'PATCH',
        body: JSON.stringify({ positions: positionsToUpdate })
      });
      
      const result = await apiRequest(API_BASE);
      const categoryData = result.data || result;
      setCategory(categoryData);
      const updatedPositions = {};
      categoryData.forEach(cat => {
        updatedPositions[cat._id] = cat.position;
      });
      setPositions(updatedPositions);
      alert('Cập nhật vị trí thành công!');
    } catch (error) {
      alert('Lỗi khi lưu vị trí!');
      console.log(error);
    }
  };

  // Delete single category
  const handleDeleteSingle = async (categoryId, categoryName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa "${categoryName}"?`)) return;
    
    try {
      await apiRequest(`${API_BASE}/delete/${categoryId}`, { method: 'DELETE' });
      setCategory(prev => prev.filter(cat => cat._id !== categoryId));
      setSelectedCategory(prev => prev.filter(id => id !== categoryId));
    } catch (error) {
      alert('Lỗi khi xóa danh mục!');
      console.log(error);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (selectedCategory.length === 0) {
      alert('Vui lòng chọn ít nhất một danh mục.');
      return;
    }

    const actions = {
      active: { endpoint: 'bulk-status', method: 'PATCH', status: 'active', text: 'kích hoạt' },
      inactive: { endpoint: 'bulk-status', method: 'PATCH', status: 'inactive', text: 'tạm dừng' },
      delete: { endpoint: 'bulk-delete', method: 'DELETE', text: 'xóa' }
    };

    const config = actions[action];
    if (!config) return;

    const confirmMessage = `Bạn có chắc muốn ${config.text} ${selectedCategory.length} danh mục đã chọn?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const body = action === 'delete' 
        ? { categoryIds: selectedCategory }
        : { categoryIds: selectedCategory, status: config.status };

      await apiRequest(`${API_BASE}/${config.endpoint}`, {
        method: config.method,
        body: JSON.stringify(body)
      });

      if (action === 'delete') {
        setCategory(prev => prev.filter(p => !selectedCategory.includes(p._id)));
      } else {
        setCategory(prev => prev.map(p => 
          selectedCategory.includes(p._id) ? { ...p, status: action } : p
        ));
      }
      
      setSelectedCategory([]);
      setSelectAll(false);
      alert(`${config.text} thành công!`);
    } catch (error) {
      alert(`Lỗi khi ${config.text}!`);
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Danh sách danh mục</h1>
          <p className="mt-1 text-gray-600">Quản lý danh mục của cửa hàng</p>
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
              <button
                onClick={() => window.location.href = '/admin/category/create'}
                className="inline-flex items-center px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm danh mục
              </button>
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
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Tên danh mục</th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Vị trí</th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Trạng thái</th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCategory.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          Không có danh mục nào
                        </td>
                      </tr>
                    ) : (
                      filteredCategory.map((cat, index) => (
                        <tr key={cat._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedCategory.includes(cat._id)}
                              onChange={(e) => handleSelectCategory(cat._id, e.target.checked)}
                              className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4">
                            {cat.img ? (
                              <img
                                src={cat.img}
                                alt={cat.title || 'Category'}
                                className="object-cover w-12 h-12 rounded-lg"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-lg">
                                <span className="text-xs text-gray-400">No img</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs text-sm font-medium text-gray-900 truncate">
                              {cat.title || cat.name || 'Không có tên'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={positions[cat._id] ?? cat.position ?? 0}
                              onChange={(e) => handlePositionChange(cat._id, e.target.value)}
                              className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              min="0"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleStatusChange(cat._id, cat.status)}
                              className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                                cat.status === 'active'
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {cat.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => window.location.href = `/admin/category/edit/${cat._id}`}
                                className="p-1 text-blue-600 rounded hover:bg-blue-50"
                                title="Sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => window.location.href = `/admin/category/detail/${cat._id}`}
                                className="p-1 text-gray-600 rounded hover:bg-gray-50"
                                title="Xem"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSingle(cat._id, cat.title || cat.name || 'danh mục')}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryListPage;