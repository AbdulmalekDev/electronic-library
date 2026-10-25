import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/authService';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false
      };

    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from token
  const loadUser = useCallback(async () => {
    try {
      const response = await authService.getMe();
      const userData = response.data.data ? response.data.data.user : response.data.user;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: userData,
          token: localStorage.getItem('token')
        }
      });
    } catch (error) {
      console.error('Error loading user:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  // Load user on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.setAuthToken(token);
      loadUser();
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, [loadUser]);

  // Login
  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login({
        username: email,
        password
      });

      const responseData = response.data.data || response.data;
      const token = responseData.token;

      authService.setAuthToken(token);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: responseData.user,
          token: token
        }
      });

      return { success: true, data: responseData };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'حدث خطأ أثناء تسجيل الدخول'
      };
    }
  }, []);

  // Register
  const register = useCallback(async (userData) => {
    try {
      const response = await authService.register(userData);
      const responseData = response.data.data || response.data;
      const token = responseData.token;

      authService.setAuthToken(token);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: responseData.user,
          token: token
        }
      });

      return { success: true, data: responseData };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'حدث خطأ أثناء إنشاء الحساب'
      };
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    authService.removeAuthToken();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  // Update profile
  const updateProfile = useCallback(async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data.user
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'حدث خطأ أثناء تحديث الملف الشخصي'
      };
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (passwordData) => {
    try {
      await authService.changePassword(passwordData);
      return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'حدث خطأ أثناء تغيير كلمة المرور'
      };
    }
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      loadUser
    }),
    [state, login, register, logout, updateProfile, changePassword, loadUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;






















