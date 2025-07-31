const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema (
    {
        title: {type: String, required: true},
        img: {type: String, required: true},
        price: {type: Number, required: true},
        category: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Category", 
            required: true
        },
        status: { 
            type: String, 
            enum: ["active", "inactive"], 
            default: "inactive" 
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        description: {type: String} 
    },
    {
        timestamps: true
    }
);
const Product = mongoose.model("products", ProductSchema);

module.exports = Product;