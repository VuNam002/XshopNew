const Invoice = require("../models/Invoice");

module.exports.index = async (req, res) => {
    try {
        const loggedInUser = req.user;
        let query = {};

        // Admin có thể xem tất cả hóa đơn.
        // User/nhanvien chỉ xem được hóa đơn của chính mình.
        if (loggedInUser.role !== 'admin') {
            query.user = loggedInUser._id;
        }

        const invoices = await Invoice.find(query)
            .populate('user', 'userName email') // Lấy thêm thông tin người tạo
            .sort({ createdAt: -1 }); // Sắp xếp mới nhất

        res.status(200).json({
            success: true,
            message: "Lấy danh sách hóa đơn thành công.",
            data: invoices
        });

    } catch (error) {
        console.error("Lỗi khi lấy danh sách hóa đơn:", error);
        res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra từ server.",
            error: error.message
        });
    }
}

//[POST]/invoices/create
module.exports.create = async (req, res) => {
    try {
        const loggedInUser = req.user;

        // Tạo hóa đơn mới và gán user ID của người đang đăng nhập
        const invoice = new Invoice({
            ...req.body,
            user: loggedInUser._id // Quan trọng: Gán người tạo hóa đơn
        });

        await invoice.save();

        res.status(201).json({
            success: true,
            message: "Tạo hóa đơn thành công.",
            data: invoice
        });
    } catch (error) {
        console.error("Lỗi khi tạo hóa đơn:", error);
        res.status(400).json({
            success: false,
            message: "Tạo hóa đơn thất bại.",
            error: error.message
        });
    }
}

//[PATCH]/invoices/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedInvoice = await Invoice.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedInvoice) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy hóa đơn để cập nhật."
            });
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật hóa đơn thành công.",
            data: updatedInvoice
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật hóa đơn:", error);
        res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra khi cập nhật hóa đơn.",
            error: error.message
        });
    }
};

//[DELETE]/invoices/delete/:id
module.exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Invoice.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy hóa đơn để xóa."
            });
        }

        res.status(200).json({
            success: true,
            message: "Xóa hóa đơn thành công."
        });
    } catch (error) {
        console.error("Lỗi khi xóa hóa đơn:", error);
        res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra khi xóa hóa đơn.",
            error: error.message
        });
    }
}
