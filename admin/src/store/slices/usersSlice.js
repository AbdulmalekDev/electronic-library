import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api';

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.getAllUsers(params);
      console.log('[DEBUG] fetchUsers response:', response.data);
      const data = response.data?.data;
      return data?.users || data || response.data || [];
    } catch (error) {
      console.error('[DEBUG] fetchUsers error:', error.response?.status, error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const removeUser = createAsyncThunk(
  'users/remove',
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.items = state.items.filter(user => user._id !== action.payload);
      });
  },
});

export default usersSlice.reducer;
