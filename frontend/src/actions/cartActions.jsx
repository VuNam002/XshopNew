import * as cartAPI from "../services/cartAPI";

// Action Types
export const SET_CART = "SET_CART";

// Action Creators
const setCart = (cart) => ({
  type: SET_CART,
  payload: cart,
});

// Thunks
export const fetchCart = () => async (dispatch) => {
  try {
    const response = await cartAPI.getCart();
    dispatch(setCart(response.data)); // Giả sử API trả về { data: [...] }
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
  }
};

export const addToCart = (item) => async (dispatch) => {
  try {
    const response = await cartAPI.addToCart(item);
    dispatch(setCart(response.data)); // Cập nhật lại toàn bộ giỏ hàng
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
  }
};

export const updateQuantity = (item, newQuantity) => async (dispatch) => {
  try {
    const response = await cartAPI.updateCartItem({ ...item, quantity: newQuantity });
    dispatch(setCart(response.data));
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng:", error);
  }
};

export const removeFromCart = (item) => async (dispatch) => {
  try {
    const response = await cartAPI.removeCartItem(item);
    dispatch(setCart(response.data));
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
  }
};

