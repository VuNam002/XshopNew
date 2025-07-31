const mongoose = require("mongoose");

const CartSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true, min: 1 },
        addedAt: { type: Date, default: Date.now }
    }],
    totalAmount: Number,
    updatedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;