import {combineReducers} from "redux";
import cartReducer from "./cart";

const allReducers = combineReducers({
    cart: cartReducer,
});

export default allReducers;
