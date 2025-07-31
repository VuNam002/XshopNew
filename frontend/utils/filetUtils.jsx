export const filterProductsByKeywordAndCategory = (products, keyword, category) => {
  let filtered = [...products];

  // Lọc theo từ khóa (không phân biệt hoa thường, bỏ qua khoảng trắng thừa)
  if (keyword && keyword.trim()) {
    const lowercasedKeyword = keyword.toLowerCase().trim();
    filtered = filtered.filter(product =>
      product.title && product.title.toLowerCase().includes(lowercasedKeyword)
    );
  }

  // Lọc theo danh mục
  return category ? filtered.filter(product => product.category === category) : filtered;
};