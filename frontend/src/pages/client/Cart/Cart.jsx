import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, Heart, ShoppingBag, Truck, Shield, RotateCcw } from "lucide-react";

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  return (
    <div className="p-6 transition-all duration-300 border group bg-white/70 backdrop-blur-sm rounded-3xl border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg hover:shadow-gray-200/50">
      <div className="flex items-start space-x-6">
        <div className="relative flex-shrink-0">
          <div className="overflow-hidden bg-gray-100 w-28 h-28 rounded-2xl ring-1 ring-gray-200/50">
            <img src={item.image} alt={item.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
          </div>
          <button className="absolute flex items-center justify-center w-8 h-8 transition-all duration-300 bg-white border border-gray-200 rounded-full shadow-lg opacity-0 -top-2 -right-2 group-hover:opacity-100 hover:scale-110">
            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
          </button>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="mb-1 text-lg font-semibold leading-tight text-gray-900">{item.title}</h3>
            <button onClick={() => onRemove(item)} className="p-2 text-gray-400 transition-all duration-200 opacity-0 hover:text-red-500 hover:bg-red-50 rounded-xl group-hover:opacity-100">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center mb-4 space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 rounded-full shadow-sm ring-2 ring-white" style={{backgroundColor: item.color.toLowerCase()}} />
              <span className="text-sm font-medium text-gray-600">{item.color}</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <span className="text-sm font-medium text-gray-600">Size {item.size}</span>
          </div>
          
          <div className="flex items-end justify-between">
            <div className="flex items-center border border-gray-200 bg-gray-50 rounded-2xl">
              <button
                onClick={() => onQuantityChange(item, item.quantity - 1)}
                className="p-3 transition-colors hover:bg-white rounded-l-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={item.quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="px-4 py-3 min-w-[60px] text-center font-semibold bg-white">{item.quantity}</div>
              <button
                onClick={() => onQuantityChange(item, item.quantity + 1)}
                className="p-3 transition-colors hover:bg-white rounded-r-2xl"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
                {(item.price * item.quantity).toLocaleString()}₫
              </p>
              {item.quantity > 1 && (
                <p className="text-sm text-gray-500">
                  {item.price.toLocaleString()}₫ × {item.quantity}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyCart = () => (
  <div className="py-16 text-center">
    <div className="relative w-32 h-32 mx-auto mb-8">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse"></div>
      <div className="absolute flex items-center justify-center bg-white rounded-full inset-4">
        <ShoppingBag className="w-12 h-12 text-gray-400" />
      </div>
    </div>
    <h3 className="mb-3 text-2xl font-bold text-gray-900">Giỏ hàng của bạn đang trống</h3>
    <p className="max-w-md mx-auto mb-8 text-gray-600">
      Khám phá bộ sưu tập thời trang mới nhất và thêm những món đồ yêu thích vào giỏ hàng
    </p>
    <Link
      to="/"
      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-black to-gray-800 text-white font-semibold rounded-2xl hover:from-gray-800 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    >
      <ShoppingBag className="w-5 h-5 mr-2" />
      Khám phá ngay
    </Link>
  </div>
);

const OrderSummary = ({ cartItems, subtotal, shippingFee, discount, total }) => (
  <div className="p-8 border shadow-xl bg-white/70 backdrop-blur-sm rounded-3xl border-gray-200/50 shadow-gray-200/20">
    <h2 className="flex items-center mb-6 text-xl font-bold text-gray-900">
      <div className="w-2 h-6 mr-3 rounded-full bg-gradient-to-b from-black to-gray-600"></div>
      Tóm tắt đơn hàng
    </h2>
    
    <div className="mb-6 space-y-4">
      <div className="flex justify-between text-gray-700">
        <span>Tạm tính ({cartItems.length} sản phẩm)</span>
        <span className="font-semibold">{subtotal.toLocaleString()}₫</span>
      </div>
      
      <div className="flex justify-between text-gray-700">
        <span>Phí vận chuyển</span>
        <span className={`font-semibold ${shippingFee === 0 ? 'text-green-600' : ''}`}>
          {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()}₫`}
        </span>
      </div>
      
      {discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Giảm giá (10%)</span>
          <span className="font-semibold">-{discount.toLocaleString()}₫</span>
        </div>
      )}
      
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between text-xl font-bold text-gray-900">
          <span>Tổng cộng</span>
          <span className="text-transparent bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
            {total.toLocaleString()}₫
          </span>
        </div>
      </div>
    </div>
    
    <button className="w-full bg-gradient-to-r from-black to-gray-800 text-white font-bold py-4 rounded-2xl hover:from-gray-800 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-4">
      Thanh toán ngay
    </button>
    
    <Link
      to="/"
      className="block w-full py-4 font-semibold text-center text-gray-700 transition-all duration-200 border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50"
    >
      Tiếp tục mua sắm
    </Link>
  </div>
);

const Benefits = () => (
  <div className="p-6 border bg-gradient-to-br from-gray-50 to-white rounded-3xl border-gray-200/50">
    <h3 className="mb-4 font-semibold text-gray-900">Quyền lợi của bạn</h3>
    <div className="space-y-3">
      <div className="flex items-center text-sm text-gray-600">
        <div className="flex items-center justify-center w-8 h-8 mr-3 bg-green-100 rounded-full">
          <Truck className="w-4 h-4 text-green-600" />
        </div>
        <span>Miễn phí vận chuyển đơn hàng từ 500.000₫</span>
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <div className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-full">
          <RotateCcw className="w-4 h-4 text-blue-600" />
        </div>
        <span>Đổi trả miễn phí trong 30 ngày</span>
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <div className="flex items-center justify-center w-8 h-8 mr-3 bg-purple-100 rounded-full">
          <Shield className="w-4 h-4 text-purple-600" />
        </div>
        <span>Bảo hành chính hãng toàn quốc</span>
      </div>
    </div>
  </div>
);

function Cart() {
  const cartItems = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const handleQuantityChange = (item, newQuantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { ...item, quantity: newQuantity } });
  };

  const handleRemoveItem = (item) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: { ...item } });
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const discount = subtotal > 1000000 ? subtotal * 0.1 : 0;
  const total = subtotal + shippingFee - discount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm border-gray-200/50">
        <div className="px-4 py-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-black to-gray-800">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">Giỏ hàng</h1>
                <p className="text-sm text-gray-500">{cartItems.length} sản phẩm</p>
              </div>
            </div>
            <Link to="/" className="text-sm font-medium text-gray-600 transition-colors hover:text-black">
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl">
        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <div className="space-y-6">
                {cartItems.map((item, index) => (
                  <CartItem 
                    key={`${item.id}-${item.color}-${item.size}`} 
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            </div>

            <div className="xl:col-span-4">
              <div className="sticky space-y-6 top-24">
                <OrderSummary 
                  cartItems={cartItems} 
                  subtotal={subtotal} 
                  shippingFee={shippingFee} 
                  discount={discount} 
                  total={total} 
                />
                <Benefits />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;