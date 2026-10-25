import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dashboardStats: {
    overview: {
      totalUsers: 0,
      totalBooks: 0,
      totalBorrows: 0,
      activeBorrowRequests: 0,
      overdueBooks: 0,
      newUsersThisWeek: 0,
      newBooksThisWeek: 0
    },
    recent: {
      users: [],
      borrows: []
    },
    monthlyStats: []
  },
  analytics: {
    categoryStats: [],
    popularBooks: [],
    userActivity: [],
    monthlyTrends: []
  },
  settings: [],
  news: [],
  isLoading: false,
  error: null,
  activeTab: 'dashboard'
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setDashboardStats: (state, action) => {
      state.dashboardStats = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setSettings: (state, action) => {
      state.settings = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    updateSetting: (state, action) => {
      const updatedSetting = action.payload;
      const index = state.settings.findIndex(setting => setting._id === updatedSetting._id);
      if (index !== -1) {
        state.settings[index] = updatedSetting;
      }
    },
    addSetting: (state, action) => {
      state.settings.push(action.payload);
    },
    setNews: (state, action) => {
      state.news = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addNews: (state, action) => {
      state.news.unshift(action.payload);
    },
    updateNews: (state, action) => {
      const updatedNews = action.payload;
      const index = state.news.findIndex(news => news._id === updatedNews._id);
      if (index !== -1) {
        state.news[index] = updatedNews;
      }
    },
    removeNews: (state, action) => {
      const newsId = action.payload;
      state.news = state.news.filter(news => news._id !== newsId);
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
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
  setDashboardStats,
  setAnalytics,
  setSettings,
  updateSetting,
  addSetting,
  setNews,
  addNews,
  updateNews,
  removeNews,
  setActiveTab,
  setError,
  clearError
} = adminSlice.actions;

export default adminSlice.reducer;