import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import booksSlice from './slices/booksSlice';
import borrowsSlice from './slices/borrowsSlice';
import reviewsSlice from './slices/reviewsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    books: booksSlice,
    borrows: borrowsSlice,
    reviews: reviewsSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;