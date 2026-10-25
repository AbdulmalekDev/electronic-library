import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api';

export const fetchNews = createAsyncThunk(
  'news/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getAllNewsAdmin();
      console.log('[DEBUG] fetchNews response:', response.data);
      const data = response.data?.data;
      return data?.news || data || response.data || [];
    } catch (error) {
      console.error('[DEBUG] fetchNews error:', error.response?.status, error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch news');
    }
  }
);

export const removeNews = createAsyncThunk(
  'news/remove',
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteNews(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete news');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeNews.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      });
  },
});

export default newsSlice.reducer;
