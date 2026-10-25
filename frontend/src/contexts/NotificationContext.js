import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { authService } from '../services/authService';
import { useAuth } from './AuthContext';
import {
  CheckCircle,
  Error as ErrorIcon,
  Info,
  Warning,
  Close
} from '@mui/icons-material';
import { IconButton } from '@mui/material';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  // Unified Snackbar Helper
  const showNotification = (message, variant = 'info', options = {}) => {
    const icons = {
      success: <CheckCircle sx={{ ml: 1, fontSize: 20 }} />,
      error: <ErrorIcon sx={{ ml: 1, fontSize: 20 }} />,
      warning: <Warning sx={{ ml: 1, fontSize: 20 }} />,
      info: <Info sx={{ ml: 1, fontSize: 20 }} />,
    };

    return enqueueSnackbar(message, {
      variant,
      autoHideDuration: variant === 'error' ? 5000 : 3000,
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      iconVariant: {
        success: icons.success,
        error: icons.error,
        warning: icons.warning,
        info: icons.info,
      },
      action: (key) => (
        <IconButton size="small" color="inherit" onClick={() => closeSnackbar(key)}>
          <Close fontSize="small" />
        </IconButton>
      ),
      ...options,
    });
  };

  // Base methods
  const showSuccess = (msg) => showNotification(msg, 'success');
  const showError = (msg) => showNotification(msg, 'error');
  const showWarning = (msg) => showNotification(msg, 'warning');
  const showInfo = (msg) => showNotification(msg, 'info');

  // Specialized CRUD Helpers
  const notifyBook = {
    added: (title) => showSuccess(`تمت إضافة كتاب "${title}" بنجاح!`),
    updated: (title) => showSuccess(`تم تحديث بيانات كتاب "${title}"`),
    deleted: (title) => showWarning(`تم حذف كتاب "${title}"`),
    error: (op) => showError(`حدث خطأ أثناء ${op} الكتاب`),
  };

  const notifyUser = {
    added: (name) => showSuccess(`تم تسجيل المستخدم "${name}" بنجاح`),
    updated: () => showSuccess("تم تحديث بيانات الحساب"),
    deleted: () => showWarning("تم حذف المستخدم"),
    error: (op) => showError(`حدث خطأ أثناء ${op} المستخدم`),
  };

  const notifyBorrow = {
    requested: () => showSuccess("تم إرسال طلب الاستعارة بنجاح"),
    approved: () => showSuccess("تمت الموافقة على طلب الاستعارة"),
    rejected: () => showWarning("تم رفض طلب الاستعارة"),
    error: () => showError("حدث خطأ في معالجة طلب الاستعارة"),
  };

  // Optimistic UI Helper
  const showOptimistic = async (promise, { loading, success, error }) => {
    const key = showNotification(loading, 'info', { persist: true });
    try {
      const result = await promise;
      closeSnackbar(key);
      showSuccess(success);
      return result;
    } catch (err) {
      closeSnackbar(key);
      showError(error);
      throw err;
    }
  };

  // Legacy Notification logic (SSE/Database notifications)
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await authService.getNotifications();
      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated, fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await authService.markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showOptimistic,
      notifyBook,
      notifyUser,
      notifyBorrow,
      markAsRead,
      fetchNotifications,
    }),
    [notifications, unreadCount, isLoading, showSuccess, showError, showWarning, showInfo, showOptimistic, notifyBook, notifyUser, notifyBorrow, markAsRead, fetchNotifications]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
export default NotificationContext;