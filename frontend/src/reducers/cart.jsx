const cartReducer = (state = [], action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { item: newItem } = action.payload;
      const existingItem = state.find(
        (item) =>
          item.id === newItem.id &&
          item.size === newItem.size &&
          item.color === newItem.color
      );

      if (existingItem) {
        return state.map((item) =>
          item.id === newItem.id &&
          item.size === newItem.size &&
          item.color === newItem.color
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        return [...state, { ...newItem }];
      }
    }
    case "UPDATE_QUANTITY": {
      const { id, color, size, quantity } = action.payload;
      return state.map((item) =>
        item.id === id && item.color === color && item.size === size
          ? { ...item, quantity: Math.max(1, quantity) } // Đảm bảo số lượng luôn >= 1
          : item
      );
    }
    case "REMOVE_FROM_CART": {
      const { id, color, size } = action.payload;
      return state.filter(
        (item) =>
          !(item.id === id && item.color === color && item.size === size)
      );
    }
    default:
      return state;
  }
};

export default cartReducer;