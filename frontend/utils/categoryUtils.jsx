export const getCategoryIcon = (category) => {
  const icons = {
    'food': '🍕',
    'Đồ ăn nhanh': '🍔',
    'Đồ uống': '🥤',
    'Pizza': '🍕',
    'Cơm': '🍚',
    'Bánh mì': '🥖',
    'Đặc sản': '🥘',
  };
  return icons[category] || '🍽️';
};

export const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);