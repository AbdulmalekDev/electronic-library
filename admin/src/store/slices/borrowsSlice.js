import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api';

export const fetchBorrows = createAsyncThunk(
  'borrows/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.getAllBorrows(params);
      console.log('[DEBUG] fetchBorrows response:', response.data);
      const data = response.data?.data;
      return {
        requests: data?.requests || data || [],
        pagination: data?.pagination || { pages: 1 }
      };
    } catch (error) {
      console.error('[DEBUG] fetchBorrows error:', error.response?.status, error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch borrows');
    }
  }
);

export const fetchBorrowStats = createAsyncThunk(
  'borrows/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getBorrowStats();
      console.log('[DEBUG] fetchBorrowStats response:', response.data);
      return response.data?.data || response.data || {};
    } catch (error) {
      console.error('[DEBUG] fetchBorrowStats error:', error.response?.status, error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const updateBorrowAction = createAsyncThunk(
  'borrows/updateAction',
  async ({ id, type, options }, { dispatch, rejectWithValue }) => {
    try {
      let response;
      if (type === 'approve') response = await api.approveBorrow(id, options);
      else if (type === 'reject') response = await api.rejectBorrow(id, options.notes);
      else if (type === 'return') response = await api.returnBook(id, options);

      if (response.data.success) {
        dispatch(fetchBorrows({ page: 1, limit: 10 }));
        dispatch(fetchBorrowStats());
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Action failed');
    }
  }
);

const borrowsSlice = createSlice({
  name: 'borrows',
  initialState: {
    items: [],
    stats: { pending: 0, borrowed: 0, overdue: 0, returned: 0 },
    pagination: { pages: 1 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBorrows.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBorrows.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.requests;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBorrows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBorrowStats.fulfilled, (state, action) => {
        const { statusStats, overdueBooks } = action.payload;
        const formatted = { pending: 0, borrowed: 0, overdue: 0, returned: 0 };
        if (Array.isArray(statusStats)) {
          statusStats.forEach(item => {
            if (item._id && formatted.hasOwnProperty(item._id)) {
              formatted[item._id] = item.count;
            }
          });
        }
        formatted.overdue = overdueBooks || 0;
        state.stats = formatted;
      });
  },
});

export default borrowsSlice.reducer;
