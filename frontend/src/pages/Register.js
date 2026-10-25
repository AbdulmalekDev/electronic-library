import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Alert,
 
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton,
  Grid,

  alpha
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  PersonAdd,
  Phone,
  School,
  Work
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { motion } from 'framer-motion';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showSuccess } = useNotification();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    job: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('يرجى إدخال الاسم الأول');
      return false;
    }

    if (!formData.lastName.trim()) {
      setError('يرجى إدخال اسم العائلة');
      return false;
    }

    if (!formData.username.trim()) {
      setError('يرجى إدخال اسم المستخدم');
      return false;
    }

    if (!formData.email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('يرجى إدخال عنوان بريد إلكتروني صحيح');
      return false;
    }

    if (!formData.password) {
      setError('يرجى إدخال كلمة المرور');
      return false;
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return false;
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      setError('يرجى إدخال رقم هاتف صحيح');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || null,
        role: 'user',
        job: formData.job.trim() || null
      });

      if (result?.success || result?.data) {
        showSuccess('تم إنشاء الحساب وتسجيل الدخول بنجاح! مرحباً بك في مكتبة عبد الملك.');
        const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/';
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectTo);
      } else {
        setError(result?.message || 'حدث خطأ أثناء إنشاء الحساب');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err?.response?.data?.message || 'حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        py: 6
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              overflow: 'hidden',
              p: { xs: 2.5, sm: 4 }
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 1.5,
                  borderRadius: '50%',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  mb: 1.5
                }}
              >
                <School sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
                إنشاء حساب جديد
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                انضم إلى مكتبة عبد الملك الإلكترونية واستمتع بآلاف المصادر
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="firstName"
                    label="الاسم الأول"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="lastName"
                    label="اسم العائلة"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    name="username"
                    label="اسم المستخدم"
                    value={formData.username}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person fontSize="small" color="action" />
                        </InputAdornment>
                      )
                    }}
                    required
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    name="email"
                    label="البريد الإلكتروني"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email fontSize="small" color="action" />
                        </InputAdornment>
                      )
                    }}
                    required
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="phone"
                    label="رقم الهاتف (اختياري)"
                    value={formData.phone}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone fontSize="small" color="action" />
                        </InputAdornment>
                      )
                    }}
                    disabled={loading}
                    inputProps={{ dir: 'ltr' }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="job"
                    label="المهنة / التخصص الدراسي"
                    value={formData.job}
                    onChange={handleChange}
                    placeholder="طالب، باحث..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Work fontSize="small" color="action" />
                        </InputAdornment>
                      )
                    }}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="password"
                    label="كلمة المرور"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            aria-label="إظهار/إخفاء كلمة المرور"
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    helperText="6 أحرف على الأقل"
                    required
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="confirmPassword"
                    label="تأكيد كلمة المرور"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            aria-label="إظهار/إخفاء تأكيد كلمة المرور"
                          >
                            {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    required
                    disabled={loading}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
                sx={{
                  py: 1.4,
                  mt: 3,
                  mb: 2.5,
                  borderRadius: 2.5,
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
              </Button>

              <Divider sx={{ mb: 2.5 }}>
                <Typography variant="body2" color="text.secondary">
                  لديك حساب بالفعل؟
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  fullWidth
                  sx={{ borderRadius: 2.5, py: 1.2, fontWeight: 'bold' }}
                >
                  تسجيل الدخول
                </Button>
              </Box>
            </form>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Register;