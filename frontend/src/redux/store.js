import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

// Import your reducers here
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';

const rootReducer = combineReducers({
  // Add your reducers here
  auth: authReducer,
  cart: cartReducer,
});

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
