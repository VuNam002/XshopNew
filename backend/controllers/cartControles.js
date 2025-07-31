const Cart = require("../models/Cart");
const Product = require("../models/Product");


// Helper chung
const handleError = (res, error, message = "Lỗi hệ thống", statusCode = 500) => {
  console.error(message, error);
  res.status(statusCode).json({
    success: false,
    message,
    error: error.message || "Unknown error"
  });
};

// GET /api/cart
module.exports.index = async (req, res) => {
  try {
    const { cartId } = res.locals;
    const cart = await Cart.findById(cartId);

    if (!cart || cart.products.length === 0) {
      return res.json({
        success: true,
        data: {
          products: [],
          totalPrice: 0
        }
      });
    }

    let totalPrice = 0;

    const enrichedProducts = await Promise.all(
      cart.products.map(async (item) => {
        const product = await Product.findOne({
          _id: item.product_id,
          deleted: false,
          status: "active"
        });

        if (!product) return null;

        const [productWithPrice] = productHelper.calcNewPrice([product]);
        const priceNew = productWithPrice.priceNew;

        return {
          product: productWithPrice,
          quantity: item.quantity,
          totalPrice: item.quantity * priceNew
        };
      })
    );

    const validProducts = enrichedProducts.filter(p => p !== null);
    totalPrice = validProducts.reduce((sum, item) => sum + item.totalPrice, 0);

    res.json({
      success: true,
      data: {
        products: validProducts,
        totalPrice
      }
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi lấy giỏ hàng");
  }
};

// POST /api/cart/add/:productId
module.exports.addPost = async (req, res) => {
  try {
    const { cartId } = res.locals;
    const { productId } = req.params;
    const quantity = parseInt(req.body.quantity, 10) || 1;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Số lượng không hợp lệ"
      });
    }

    const [product, cart] = await Promise.all([
      Product.findOne({ _id: productId, deleted: false, status: "active" }),
      Cart.findById(cartId)
    ]);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại"
      });
    }

    if (!cart) {
      return handleError(res, new Error("Cart không tồn tại"), "Không tìm thấy giỏ hàng", 404);
    }

    const exist = cart.products.find(p => p.product_id.toString() === productId);

    if (exist) {
      exist.quantity += quantity;
    } else {
      cart.products.push({ product_id: productId, quantity });
    }

    await cart.save();

    res.json({ success: true, message: "Thêm vào giỏ hàng thành công" });
  } catch (error) {
    handleError(res, error, "Lỗi khi thêm vào giỏ hàng");
  }
};

// PUT /api/cart/update/:productId
module.exports.update = async (req, res) => {
  try {
    const { cartId } = res.locals;
    const { productId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: "Số lượng không hợp lệ" });
    }

    const result = await Cart.updateOne(
      { _id: cartId, "products.product_id": productId },
      { $set: { "products.$.quantity": qty } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại trong giỏ hàng" });
    }

    res.json({ success: true, message: "Cập nhật số lượng thành công" });
  } catch (error) {
    handleError(res, error, "Lỗi khi cập nhật giỏ hàng");
  }
};

// DELETE /api/cart/delete/:productId
module.exports.delete = async (req, res) => {
  try {
    const { cartId } = res.locals;
    const { productId } = req.params;

    await Cart.updateOne(
      { _id: cartId },
      { $pull: { products: { product_id: productId } } }
    );

    res.json({ success: true, message: "Xóa sản phẩm khỏi giỏ hàng thành công" });
  } catch (error) {
    handleError(res, error, "Lỗi khi xóa sản phẩm");
  }
};
