const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // Thông tin khách hàng tại thời điểm đặt hàng (để lưu trữ lịch sử)
    customerInfo: { 
        name: String,
        phone: String,
        email: String,
        address: { // Snapshot địa chỉ giao hàng
            street: String,
            city: String,
            district: String,
            ward: String
        }
    },
    orderNumber: { // Số đơn hàng duy nhất
        type: String,
        unique: true,
        required: true 
    },
    items: [{ // Chi tiết từng sản phẩm tại thời điểm đặt hàng
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productInfo: { // Snapshot thông tin sản phẩm
            title: String,
            price: Number,
            img: String
        },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true }, // Giá bán tại thời điểm đặt hàng
        totalPrice: { type: Number, required: true } // Tổng tiền cho từng item
    }],
    subTotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"], // Tùy chỉnh trạng thái
        default: "pending"
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "card", "transfer", "ewallet"],
        required: true
    },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Người tạo đơn (có thể là admin/staff)
}, {
    timestamps: true 
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;