import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  books: [],
  currentBook: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    count: 0
  },
  filters: {
    search: '',
    category: '',
    featured: false,
    sort: 'newest'
  },
  stats: {
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    categories: []
  }
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setBooks: (state, action) => {
      state.books = action.payload.books;
      state.pagination = action.payload.pagination;
      state.isLoading = false;
      state.error = null;
    },
    setCurrentBook: (state, action) => {
      state.currentBook = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addBook: (state, action) => {
      state.books.unshift(action.payload);
      state.stats.totalBooks += 1;
      state.stats.availableBooks += 1;
    },
    updateBook: (state, action) => {
      const index = state.books.findIndex(book => book._id === action.payload._id);
      if (index !== -1) {
        state.books[index] = action.payload;
      }
      if (state.currentBook && state.currentBook._id === action.payload._id) {
        state.currentBook = action.payload;
      }
    },
    deleteBook: (state, action) => {
      const bookId = action.payload;
      const book = state.books.find(b => b._id === bookId);
      if (book) {
        state.stats.totalBooks -= 1;
        state.stats.availableBooks -= book.availableCopies;
        state.books = state.books.filter(b => b._id !== bookId);
        if (state.currentBook && state.currentBook._id === bookId) {
          state.currentBook = null;
        }
      }
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
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
  setBooks,
  setCurrentBook,
  addBook,
  updateBook,
  deleteBook,
  setStats,
  setFilters,
  clearFilters,
  setError,
  clearError
} = booksSlice.actions;

export default booksSlice.reducer;