import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children, roles = [] }) => {
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
          جاري التحقق من الهوية...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    // حفظ المسار المطلوب للعودة إليه بعد تسجيل الدخول
    sessionStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  // التحقق من الأدوار المطلوبة
  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          textAlign: 'center',
          p: 4
        }}
      >
        <Typography variant="h4" color="error" gutterBottom>
          وصول غير مصرح
        </Typography>
        <Typography variant="h6" color="text.secondary">
          ليس لديك صلاحية للوصول إلى هذه الصفحة
        </Typography>
        <Typography variant="body1" color="text.secondary">
          المطلب: {roles.join(' أو ')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          دورك الحالي: {user.role}
        </Typography>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;