import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  myRequests: [],
  allRequests: [],
  currentRequest: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    count: 0
  },
  stats: {
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    borrowedBooks: 0,
    overdueBooks: 0
  },
  filters: {
    status: '',
    dateRange: ''
  }
};

const borrowsSlice = createSlice({
  name: 'borrows',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setMyRequests: (state, action) => {
      state.myRequests = action.payload.requests;
      state.pagination = action.payload.pagination;
      state.isLoading = false;
      state.error = null;
    },
    setAllRequests: (state, action) => {
      state.allRequests = action.payload.requests;
      state.pagination = action.payload.pagination;
      state.isLoading = false;
      state.error = null;
    },
    setCurrentRequest: (state, action) => {
      state.currentRequest = action.payload;
      state.isLoading = false;
    },
    addRequest: (state, action) => {
      state.myRequests.unshift(action.payload);
    },
    updateRequest: (state, action) => {
      const updatedRequest = action.payload;
      // Update in myRequests
      const myIndex = state.myRequests.findIndex(req => req._id === updatedRequest._id);
      if (myIndex !== -1) {
        state.myRequests[myIndex] = updatedRequest;
      }
      // Update in allRequests
      const allIndex = state.allRequests.findIndex(req => req._id === updatedRequest._id);
      if (allIndex !== -1) {
        state.allRequests[allIndex] = updatedRequest;
      }
      // Update currentRequest
      if (state.currentRequest && state.currentRequest._id === updatedRequest._id) {
        state.currentRequest = updatedRequest;
      }
    },
    removeRequest: (state, action) => {
      const requestId = action.payload;
      state.myRequests = state.myRequests.filter(req => req._id !== requestId);
      state.allRequests = state.allRequests.filter(req => req._id !== requestId);
      if (state.currentRequest && state.currentRequest._id === requestId) {
        state.currentRequest = null;
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
  setMyRequests,
  setAllRequests,
  setCurrentRequest,
  addRequest,
  updateRequest,
  removeRequest,
  setStats,
  setFilters,
  clearFilters,
  setError,
  clearError
} = borrowsSlice.actions;

export default borrowsSlice.reducer;