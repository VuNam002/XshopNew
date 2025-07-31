const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const paginationHelper = require("../helpers/pagination");
const CategoryBlog = require("../models/CategoryBlog");



const buildPagination = async (req, filter) => {
    const initPagination = {
        currentPage: 1,
        limitItems: parseInt(req.query.limit) || 10,
    };
    const totalItems = await Blog.countDocuments(filter);
    return paginationHelper(initPagination, req.query, totalItems);
}

const handleError = (res, error, message = "Đã có lỗi xảy ra") => {
    console.error(message, error);
    res.status(500).json({
        success: false,
        message,
        error: error.message
    })
}

module.exports.index = async (req, res) => {
    try {
      const filter = {
        status: "active" 
      };

      const pagination = await buildPagination(req, filter);  
      const blogs = await Blog.find(filter)
        .select("-content") // Tối ưu: Loại bỏ trường 'content' khỏi danh sách
        .populate("category_id", "title slug") 
        .sort({ createdAt: -1 }) 
        .skip(pagination.skip)
        .limit(pagination.limitItems);

      if(blogs.length === 0) {
        return res.status(200).json({
            success: true,
            message: "Không tìm thấy bài viết nào",
            data: [],
            pagination,
        });
      }
      
      res.status(200).json({
        success: true,
        message:"Lấy danh sách thành công",
        data: blogs,
        pagination,
      })
    } catch(error){
        handleError(res, error);
    }
}

module.exports.detail = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate("category_id", "title slug");

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bài viết."
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Lấy chi tiết bài viết thành công.",
            data: blog
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy chi tiết bài viết");
    }
};

//[POST]/blog/create
module.exports.create = async (req, res) => {
    try {
        if (req.body.category_id && !mongoose.Types.ObjectId.isValid(req.body.category_id)) {
            const category = await CategoryBlog.findOne({ title: req.body.category_id });
            if (category) {
                req.body.category_id = category._id;
            } else {
                return res.status(400).json({
                    success: false,
                    message: `Danh mục với tiêu đề "${req.body.category_id}" không tồn tại.`,
                });
            }
        }

        const blog = new Blog(req.body);
        await blog.save();
        res.status(201).json({
            success: true,
            message:"Thêm mới bài viết thành công",
            data: blog,
        });
    }catch(error) {
        handleError(res, error, "Lỗi khi tạo mới bài viết");
    }
}

//[DELETE]/blog/delete/:id 
module.exports.delete = async (req, res) => {
    try{
        const deletedBlog = await Blog.findOneAndDelete({ _id: req.params.id });
        if(!deletedBlog) {
            return res.status(404).json({
                success: false,
                message:"Không tìm thấy bài viết để xóa",
            });
        }
        res.status(200).json({
            success: true,
            message:"Xóa bài viết thành công"
        });
    } catch(error) {
        handleError(res, error, "Lỗi khi xóa bài viết");
    }
}

//[PATCH]/blog/edit/:id
module.exports.edit = async (req, res) => {
    try {
        if (req.body.category_id && !mongoose.Types.ObjectId.isValid(req.body.category_id)) {
            const category = await CategoryBlog.findOne({ title: req.body.category_id });

            if (category) {
                req.body.category_id = category._id;
            } else {
                // Handle case where category title doesn't exist.
                return res.status(400).json({
                    success: false,
                    message: `Danh mục với tiêu đề "${req.body.category_id}" không tồn tại.`,
                });
            }
        }

        const updatedBlog = await Blog.findOneAndUpdate({
            _id: req.params.id
        }, req.body, {
            new: true,
            runValidators: true
        });
        if(!updatedBlog) {
            return res.status(404).json({
                success: false,
                message:"Không tìm thấy bài viết để cập nhật",
            });
        }
        res.status(200).json({
            success: true,
            message:"Cập nhật bài viết thành công",
            data: updatedBlog,
        })
    } catch(error) {
        if (error.name === 'CastError' && error.path === 'category_id') {
             return res.status(400).json({
                success: false,
                message: "ID danh mục không hợp lệ.",
                error: error.message
            });
       }
        handleError(res, error, "Lỗi khi cập nhật bài viết");
    }
}
//[PATCH]/blog/change-status/status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const {id, status} = req.params;
        if(!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Trạng thái không hợp lệ"
            });
        }
        const updatedBlog = await Blog.findByIdAndUpdate(id, { status: status }, { new: true });

        if(!updatedBlog) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bài viết để cập nhật trạng thái"
            })
        }

        res.status(200).json({
            success: true,
            message:"Cập nhật trạng thái thành công",
        })
    } catch(error) {
        handleError(res, error, "Lỗi khi cập nhật trạng thái bài viết");
    }
}
//[GET]/product/featured
module.exports.featured = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const type = req.query.type;
        let sort = {};
        let message = "";

        if(type ==='featured') {
            sort = { isFeatured: -1, createdAt: -1 };
            message = "Lấy danh sách sản phẩm nổi bật thành công";
        }else if(type === 'new') {
            sort = { createdAt: -1 };
            message = "Lấy danh sách sản phẩm mới thành công";
        }else {
            sort = { isFeatured: -1, createdAt: -1 };
            message = "Lấy danh sách sản phẩm nổi bật và mới thành công";
        }
        const blogs = await Blog.find({
            status: "active",
            deleted: { $ne: true },
        })
            .populate("category_id", "title slug")
            .sort(sort)
            .limit(limit);

        if(!blogs || blogs.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Không có bài viết nào",
                data: [],
            });
        }
        res.status(200).json({
            success: true,
            message,
            data: blogs,
        });
    } catch(error) {
        handleError(res, error, "Lỗi khi lấy bài viết nổi bật và bài viết mới");
    }
}