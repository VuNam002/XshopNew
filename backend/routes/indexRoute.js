const productRoutes = require("./productRoute");
const categoryRoutes = require("./categoryRoute");
const authRoutes = require("./authRoute");
const invoiceRoutes = require("./invoiceRoute");
const blogRoutes = require("./blogRoute");
const categoryBlog = require("./blogCategoryRoute")
const cartRoutes = require("./cartRoute");






module.exports = (app) => {
    app.use("/products", productRoutes);
    app.use("/category", categoryRoutes);
    app.use("/auth", authRoutes);
    app.use("/invoices", invoiceRoutes);
    app.use("/blog", blogRoutes)
    app.use("/category-blog", categoryBlog)
    app.use("/cart", cartRoutes);
}