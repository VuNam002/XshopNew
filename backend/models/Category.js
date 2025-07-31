const mongoose = require("mongoose");

const CategorySchema = mongoose.Schema(
  {
    name: { type: String, required: true },           // Tên danh mục món ăn
    description: { type: String },                    // Mô tả chi tiết danh mục
    img: { type: String },                            // Ảnh đại diện cho danh mục
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  {
    timestamps: true
  }
);


const Category = mongoose.model("Category", CategorySchema, "Category");

module.exports = Category;