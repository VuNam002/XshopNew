const Category = require("../models/Category");
const mongoose = require("mongoose");

module.exports.index = async (req, res) => {
    try {
        // Sử dụng .lean() để trả về plain JS objects, đảm bảo có _id
        const categories = await Category.find().lean();
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách danh mục:", error);
        res.status(500).json({ 
            success: false,
            message: "Có lỗi xảy ra từ server." 
        });
    }
}

//[POST]/create
module.exports.create = async (req, res) => {
    try {
        const newCategory = new Category(req.body);
        await newCategory.save();
        res.status(201).json({ 
            success: true,
            message: "Thêm danh mục thành công",
            data: newCategory 
        });
    } catch(error) {
        console.error("Lỗi khi tạo danh mục:", error);
        
        // Xử lý lỗi validation
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: "Có lỗi xảy ra khi tạo danh mục." 
        });
    }
}

//[GET]/category/detail/:id 
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id.trim(); // Loại bỏ khoảng trắng
        
        console.log("ID được gửi từ client:", id);
        console.log("Độ dài ID:", id.length);
        
        // Kiểm tra ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false,
                message: "ID danh mục không hợp lệ" 
            });
        }
        
        // Thử nhiều cách tìm kiếm
        let category = null;
        
        // Cách 1: Tìm bằng string ID
        category = await Category.findById(id);
        
        // Cách 2: Nếu không tìm thấy, thử convert sang ObjectId
        if (!category) {
            category = await Category.findById(new mongoose.Types.ObjectId(id));
        }
        
        // Cách 3: Nếu vẫn không tìm thấy, thử tìm bằng _id field
        if (!category) {
            category = await Category.findOne({ _id: id });
        }
        
        // Cách 4: Tìm tất cả và filter manually
        if (!category) {
            const allCategories = await Category.find();
            category = allCategories.find(cat => 
                cat._id.toString() === id || 
                cat._id.toString() === id.toString()
            );
        }
        
        console.log("Category tìm được:", category);
        
        if (!category) {
            // Debug thêm thông tin
            const allCategories = await Category.find();
            return res.status(404).json({ 
                success: false,
                message: "Không tìm thấy danh mục.",
                debug: {
                    searchId: id,
                    searchIdLength: id.length,
                    availableIds: allCategories.map(cat => ({
                        id: cat._id.toString(),
                        length: cat._id.toString().length,
                        match: cat._id.toString() === id
                    }))
                }
            });
        }
        
        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết danh mục:", error);
        res.status(500).json({ 
            success: false,
            message: "Có lỗi xảy ra khi lấy chi tiết danh mục.",
            error: error.message
        });
    }
}

//[PATCH]/category/edit/:id 
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id.trim(); // Loại bỏ khoảng trắng
        // Kiểm tra ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false,
                message: "ID danh mục không hợp lệ" 
            });
        }
        let updatedCategory = null;
        updatedCategory = await Category.findByIdAndUpdate(id, req.body, { 
            new: true,
            runValidators: true 
        });
        if (!updatedCategory) {
            updatedCategory = await Category.findByIdAndUpdate(
                new mongoose.Types.ObjectId(id), 
                req.body, 
                { new: true, runValidators: true }
            );
        }
        if (!updatedCategory) {
            updatedCategory = await Category.findOneAndUpdate(
                { _id: id }, 
                req.body, 
                { new: true, runValidators: true }
            );
        }

        if (!updatedCategory) {
            return res.status(404).json({ 
                success: false,
                message: "Không tìm thấy danh mục để cập nhật." 
            });
        }

        res.status(200).json({ 
            success: true,
            message: "Cập nhật danh mục thành công",
            data: updatedCategory
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật danh mục:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ 
            success: false,
            message: "Có lỗi xảy ra khi cập nhật danh mục.",
            error: error.message
        });
    }
}

module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id.trim(); 
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false,
                message: "ID danh mục không hợp lệ" 
            });
        }
        
        let result = null;
        result = await Category.findByIdAndDelete(id);
        if (!result) {
            result = await Category.findByIdAndDelete(new mongoose.Types.ObjectId(id));
        }
        if (!result) {
            result = await Category.findOneAndDelete({ _id: id });
        }
        
        console.log("Kết quả xóa:", result);

        if (!result) {
            return res.status(404).json({ 
                success: false,
                message: "Không tìm thấy danh mục để xóa." 
            });
        }

        res.status(200).json({ 
            success: true,
            message: "Xóa danh mục thành công." 
        });
    } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
        res.status(500).json({ 
            success: false,
            message: "Có lỗi xảy ra khi xóa danh mục.",
            error: error.message
        });
    }
}

//[PATCH]/category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const { id, status } = req.params;

        // Kiểm tra ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID danh mục không hợp lệ",
            });
        }

        // Kiểm tra trạng thái hợp lệ
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Trạng thái không hợp lệ. Chỉ chấp nhận 'active' hoặc 'inactive'.",
            });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { status: status },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục để cập nhật.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái thành công.",
            data: updatedCategory,
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra khi cập nhật trạng thái.",
        });
    }
// Alternative approach - Tìm bằng aggregate
module.exports.detailAlternative = async (req, res) => {
    try {
        const id = req.params.id.trim();
        const categories = await Category.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            }
        ]);
        
        if (categories.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: "Không tìm thấy danh mục." 
            });
        }
        
        res.status(200).json({
            success: true,
            data: categories[0]
        });
    } catch (error) {
        console.error("Lỗi:", error);
        res.status(500).json({ 
            success: false,
            message: "Có lỗi xảy ra.",
            error: error.message
        });
    }
};
}