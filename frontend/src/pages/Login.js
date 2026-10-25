import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  Divider,
  CircularProgress,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  School
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage] = useState(location.state?.message || '');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // إزالة رسالة الخطأ عند الكتابة
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // التحقق من البيانات
      if (!formData.email || !formData.password) {
        setError('يرجى ملء جميع الحقول المطلوبة');
        setLoading(false);
        return;
      }

      // محاولة تسجيل الدخول
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // توجيه المستخدم إلى الصفحة المطلوبة أو الصفحة الرئيسية
        const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/';
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectTo);
      } else {
        setError(result.message || 'حدث خطأ في تسجيل الدخول');
      }

    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0062D1 0%, #4FC3F7 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: 'white',
                p: 4,
                textAlign: 'center'
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
              >
                <School sx={{ fontSize: 64, mb: 2 }} />
              </motion.div>
              <Typography variant="h4" component="h1" fontWeight="bold">
                تسجيل الدخول
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                مرحباً بعودتك إلى مكتبة عبد الملك الرقمية
              </Typography>
            </Box>

            {/* Form */}
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                {infoMessage && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {infoMessage}
                  </Alert>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  </motion.div>
                )}

                <TextField
                  fullWidth
                  name="email"
                  label="البريد الإلكتروني أو اسم المستخدم"
                  type="text"
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                  required
                  autoComplete="username"
                  disabled={loading}
                />

                <TextField
                  fullWidth
                  name="password"
                  label="كلمة المرور"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 2,
                    mb: 3,
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)',
                    },
                    '&:disabled': {
                      background: '#ccc',
                    }
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={24} sx={{ mr: 2 }} color="inherit" />
                      جاري تسجيل الدخول...
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LoginIcon sx={{ mr: 2 }} />
                      تسجيل الدخول
                    </Box>
                  )}
                </Button>

                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    sx={{ textDecoration: 'none', color: '#0062D1' }}
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </Box>

                <Divider sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    أو
                  </Typography>
                </Divider>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    ليس لديك حساب؟
                  </Typography>
                  <Link
                    component={RouterLink}
                    to="/register"
                    variant="body1"
                    sx={{
                      textDecoration: 'none',
                      color: '#0062D1',
                      fontWeight: 'bold',
                      display: 'inline-block',
                      mt: 1,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    إنشاء حساب جديد
                  </Link>
                </Paper>


              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Link
              component={RouterLink}
              to="/"
              sx={{
                color: 'white',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              ← العودة إلى الصفحة الرئيسية
            </Link>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;