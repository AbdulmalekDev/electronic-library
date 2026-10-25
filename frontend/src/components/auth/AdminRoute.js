import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Lock } from '@mui/icons-material';

const AdminRoute = ({ children, roles = ['admin', 'librarian'] }) => {
  const { user, isLoading: loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          جاري التحقق من الصلاحيات...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    // حفظ المسار المطلوب للعودة إليه بعد تسجيل الدخول
    sessionStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  // التحقق من الصلاحيات الإدارية
  if (!roles.includes(user.role)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 3,
          textAlign: 'center',
          p: 4
        }}
      >
        <Lock sx={{ fontSize: 80, color: '#f44336' }} />
        <Typography variant="h4" color="error" gutterBottom>
          وصول غير مصرح
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          هذه الصفحة مخصصة للمديرين وأمناء المكتبات فقط
        </Typography>
        <Typography variant="body1" color="text.secondary">
          المطلب: {roles.join(' أو ')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          دورك الحالي: {user.role === 'user' ? 'مستخدم عادي' : user.role}
        </Typography>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            هل تحتاج إلى صلاحيات إضافية؟ تواصل مع مدير النظام.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography
            onClick={() => window.history.back()}
            sx={{
              color: '#1976d2',
              cursor: 'pointer',
              textDecoration: 'underline',
              '&:hover': { color: '#1565c0' }
            }}
          >
            العودة
          </Typography>
          <Typography
            onClick={() => window.location.href = '/'}
            sx={{
              color: '#1976d2',
              cursor: 'pointer',
              textDecoration: 'underline',
              '&:hover': { color: '#1565c0' }
            }}
          >
            الصفحة الرئيسية
          </Typography>
        </Box>
      </Box>
    );
  }

  return children;
};

export default AdminRoute;