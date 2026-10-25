import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  myReviews: [],
  bookReviews: [],
  allReviews: [],
  currentReview: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    count: 0
  },
  ratingStats: [],
  filters: {
    rating: '',
    isApproved: '',
    book: ''
  }
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setMyReviews: (state, action) => {
      state.myReviews = action.payload.reviews;
      state.pagination = action.payload.pagination;
      state.isLoading = false;
      state.error = null;
    },
    setBookReviews: (state, action) => {
      state.bookReviews = action.payload.reviews;
      state.ratingStats = action.payload.ratingStats;
      state.pagination = action.payload.pagination;
      state.isLoading = false;
      state.error = null;
    },
    setAllReviews: (state, action) => {
      state.allReviews = action.payload.reviews;
      state.pagination = action.payload.pagination;
      state.isLoading = false;
      state.error = null;
    },
    setCurrentReview: (state, action) => {
      state.currentReview = action.payload;
      state.isLoading = false;
    },
    addReview: (state, action) => {
      state.myReviews.unshift(action.payload);
    },
    updateReview: (state, action) => {
      const updatedReview = action.payload;
      // Update in myReviews
      const myIndex = state.myReviews.findIndex(rev => rev._id === updatedReview._id);
      if (myIndex !== -1) {
        state.myReviews[myIndex] = updatedReview;
      }
      // Update in bookReviews
      const bookIndex = state.bookReviews.findIndex(rev => rev._id === updatedReview._id);
      if (bookIndex !== -1) {
        state.bookReviews[bookIndex] = updatedReview;
      }
      // Update in allReviews
      const allIndex = state.allReviews.findIndex(rev => rev._id === updatedReview._id);
      if (allIndex !== -1) {
        state.allReviews[allIndex] = updatedReview;
      }
      // Update currentReview
      if (state.currentReview && state.currentReview._id === updatedReview._id) {
        state.currentReview = updatedReview;
      }
    },
    removeReview: (state, action) => {
      const reviewId = action.payload;
      state.myReviews = state.myReviews.filter(rev => rev._id !== reviewId);
      state.bookReviews = state.bookReviews.filter(rev => rev._id !== reviewId);
      state.allReviews = state.allReviews.filter(rev => rev._id !== reviewId);
      if (state.currentReview && state.currentReview._id === reviewId) {
        state.currentReview = null;
      }
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setLoading,
  setMyReviews,
  setBookReviews,
  setAllReviews,
  setCurrentReview,
  addReview,
  updateReview,
  removeReview,
  setFilters,
  clearFilters,
  setError,
  clearError
} = reviewsSlice.actions;

export default reviewsSlice.reducer;