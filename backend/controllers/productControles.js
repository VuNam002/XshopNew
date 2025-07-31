const Product = require("../models/Product");
const Category = require("../models/Category");
const paginationHelper = require("../helpers/pagination");
const searchHelper = require("../helpers/search");

// Hàm tiện ích tái sử dụng
const buildSearchFilter = async (objectSearch) => {
  const filter = {
    status: "active", 
    deleted: { $ne: true },
  };

  if (objectSearch.keyword) {
    const keywordRegex = new RegExp(
      objectSearch.keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );
    const matchingCategories = await Category.find({ name: keywordRegex }).select('_id');
    const categoryIds = matchingCategories.map(cat => cat._id);
    const orConditions = [{ title: keywordRegex }];
    if (categoryIds.length > 0) {
      orConditions.push({ category: { $in: categoryIds } });
    }
    filter.$or = orConditions;
  }
  return filter;
};

const buildSortObject = (req) => {
  const sortKey = req.query.sortKey || "createdAt";
  const sortValue = req.query.sortValue === "asc" ? 1 : -1;
  const sort = {};
  sort[sortKey] = sortValue;
  return sort;
};

const buildPagination = async (req, filter) => {
  const initPagination = {
    currentPage: 1,
    limitItems: parseInt(req.query.limit) || await Product.countDocuments(filter), 
  };
  const totalItems = await Product.countDocuments(filter);
  return paginationHelper(initPagination, req.query, totalItems);
};

const handleError = (res, error, message = "Đã có lỗi xảy ra") => {
  console.error(message, error);
  res.status(500).json({ 
    success: false, 
    message, 
    error: error.message 
  });
};

module.exports.index = async (req, res) => {
  try {
    const objectSearch = searchHelper(req.query);
    const filter = await buildSearchFilter(objectSearch);
    const sort = buildSortObject(req);
    const pagination = await buildPagination(req, filter);

    const products = await Product.find(filter)
      .populate("category", "name")
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limitItems);

    if (products.length === 0) {
      return res.status(200).json({
        message: "Không tìm thấy sản phẩm nào.",
        data: [],
        pagination,
      });
    }

    res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      data: products,
      pagination,
    });
  } catch (error) {
    handleError(res, error);
  }
};

//[POST]/create
module.exports.create = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({
      success: true,
      message: "Thêm sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    res.status(400).json({
      success: false,
      message: "Thêm sản phẩm thất bại. Vui lòng kiểm tra lại dữ liệu.",
      error: error.message,
    });
  }
};

//[PATCH]/update/:id
module.exports.update = async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm để cập nhật.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: updatedProduct,
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi cập nhật sản phẩm:");
  }
};

//[DELETE]/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ _id: req.params.id });
    if (!deletedProduct) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy sản phẩm để xóa." 
      });
    }
    res.status(200).json({ 
      success: true, 
      message: "Xóa sản phẩm thành công" 
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi xóa sản phẩm:");
  }
};

//[GET]/products/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy sản phẩm." 
      });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ 
      message: "Lỗi server", 
      error: error.message 
    });
  }
};

//[PATCH]/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const { id, status } = req.params;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ. Chỉ chấp nhận 'active' hoặc 'inactive'."
      });
    }

    const product = await Product.findOne({ _id: id });

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy sản phẩm." 
      });
    }

    product.status = status;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi cập nhật trạng thái sản phẩm:");
  }
};

//[GET]/product/search
module.exports.search = async (req, res) => {
  try {
    const keyword = req.query.keyword ? decodeURIComponent(req.query.keyword).trim() : '';

    if (!keyword) {
      return res.status(400).json({ 
        success: false,
        message: "Vui lòng cung cấp từ khóa tìm kiếm." 
      });
    }

    const keywordRegex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    // Tìm các danh mục khớp với từ khóa
    const matchingCategories = await Category.find({ name: keywordRegex }).select('_id');
    const categoryIds = matchingCategories.map(cat => cat._id);

    const orConditions = [{ title: keywordRegex }];
    if (categoryIds.length > 0) {
      orConditions.push({ category: { $in: categoryIds } });
    }

    const products = await Product.find({
      $or: orConditions,
      status: "active",
      deleted: { $ne: true },
    })
      .populate("category", "name")
      .limit(100);

    res.status(200).json({
      success: true,
      message: `Kết quả tìm kiếm cho từ khóa "${keyword}"`,
      data: products,
    });
  } catch (error) {
    console.error('Lỗi khi tìm kiếm sản phẩm:', error);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server",
      details: error.message 
    });
  }
};

//[GET]/products/new
module.exports.new = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const products = await Product.find({
      status: "active",
      deleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("category", "name");
      
    res.status(200).json({
      success: true,
      message: "Lấy sản phẩm mới nhất thành công.",
      data: products,
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi lấy sản phẩm mới:");
  }
};

//[GET]/products/category/:categoryId
module.exports.getByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const objectSearch = searchHelper(req.query);

    const filter = {
      category: categoryId,
      status: "active",
      deleted: { $ne: true },
    };

    if (objectSearch.regex) {
      filter.title = { $regex: objectSearch.regex, $options: "i" };
    }

    const sort = buildSortObject(req);
    const pagination = await buildPagination(req, filter);

    const products = await Product.find(filter)
      .populate("category", "name")
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limitItems);

    res.status(200).json({
      message: `Lấy danh sách sản phẩm cho danh mục thành công`,
      data: products,
      pagination,
    });
  } catch (error) {
    handleError(res, error);
  }
};

//[GET]/product/featured
module.exports.featured = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const type = req.query.type;

    const filter = {
      status: "active",
      deleted: { $ne: true },
    };
    let sort = {};
    let message = "";

    if (type === 'featured') {
      filter.isFeatured = true;
      sort = { createdAt: -1 }; 
      message = "Lấy danh sách sản phẩm nổi bật thành công.";
    } else if (type === 'new') {
      sort = { createdAt: -1 };
      message = "Lấy danh sách sản phẩm mới thành công.";
    } else {
      sort = { isFeatured: -1, createdAt: -1 };
      message = "Lấy danh sách sản phẩm nổi bật và mới thành công.";
    }

    const products = await Product.find(filter)
      .populate("category", "name")
      .sort(sort)
      .limit(limit);

    if (!products || products.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Không có sản phẩm nào phù hợp.",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message,
      data: products,
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi lấy sản phẩm nổi bật và mới");
  }
};