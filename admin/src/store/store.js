import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/usersSlice';
import newsReducer from './slices/newsSlice';
import borrowsReducer from './slices/borrowsSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    news: newsReducer,
    borrows: borrowsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For easier handling of dates and complex objects from API
    }),
});

export default store;
