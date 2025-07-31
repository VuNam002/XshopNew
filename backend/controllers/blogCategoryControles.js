const Category = require("../models/CategoryBlog")
const mongoose = require("mongoose")

module.exports.index = async (req, res) => {
    try {
        const category = await Category.find().lean();
        res.status(200).json({
            success: true,
            data: category
        });
    }catch(error) {
        console.error("Lỗi khi lấy danh sách danh mục bài viết:", error);
        res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra từ server"
        });
    }
}
module.exports.create = async (req, res) => {
    try {
        const newCategory = new Category(req.body);
        await newCategory.save();
        res.status(200).json({
            success:true,
            message:"Thêm mới danh mục bài viết thành công",
            data: newCategory
        })
    } catch(error) {
        console.error("Lỗi khi thêm danh mục bài viết", error);
        res.status(500).json({
            success: false,
            message:"Có lỗi xảy ra từ server"
        })
    }
}
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id.trim();
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID không hợp lệ"
            });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id, 
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục"
            });
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật danh mục bài viết thành công",
            data: updatedCategory
        });

    } catch (error) {
        console.error("Lỗi khi cập nhật danh mục bài viết", error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra từ server"
        });
    }
};

module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id.trim();
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID không hợp lệ"
            });
        }
        const result = await Category.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục"
            });
        }
        res.status(200).json({
            success: true,
            message: "Xóa danh mục bài viết thành công"
        });
    } catch (error) {
        console.error("Lỗi khi xóa danh mục bài viết", error);
        res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra từ server"
        });
    }
};
module.exports.changeStatus = async (req, res) => {
    try {
        const {id, status} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message:"ID không hợp lệ"
            })
        }
        if(!['active', 'inactive'].includes(status)){
            return res.status(400).json({
                success: false,
                message: "Trạng thái không hợp lệ"
            })
        }
        const updatedCategory = await Category.findByIdAndUpdate(
            id, {status: status},
            {new: true, runValidators: true}
        );
        if(!updatedCategory) {
            return res.status(404).json({
                success:false,
                message: "Không tìm thấy danh mục"
            })
        }
        res.status(200).json({
            success: true, 
            message:"Cập nhật trạng thái thành công",
            data: updatedCategory,
        })
    }catch(error) {
        console.error("Lỗi khi cập nhật trạng thái", error)
        res.status(500).json({
            success: false,
            message:"Có lỗi xảy ra từ server"
        })
    }
}
module.exports.detail = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID danh mục không hợp lệ."
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục."
            });
        }

        res.status(200).json({
            success: true,
            message: "Lấy chi tiết danh mục thành công.",
            data: category
        });
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết danh mục bài viết:", error);
        res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra từ server."
        });
    }
};