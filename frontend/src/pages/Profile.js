import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Avatar,
  Grid,
  Paper,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Stack,
  alpha
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Phone,
  Email,
  Work,
  BookmarkAdded,
  MenuBook,
  VerifiedUser,
  Badge
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useNotification } from '../contexts/NotificationContext';
import borrowService from '../services/borrowService';

const StatCard = ({ title, value, icon, color, delay }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay, duration: 0.5 }}
    style={{ height: '100%' }}
  >
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        textAlign: 'center',
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: '50%',
          bgcolor: (theme) => alpha(color || theme.palette.primary.main, 0.1),
          color: color || 'primary.main',
          mb: 1.5,
          display: 'flex'
        }}
      >
        {icon}
      </Box>
      <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {title}
      </Typography>
    </Paper>
  </motion.div>
);

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalBorrows: 0,
    activeBorrows: 0,
    returnedBorrows: 0
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    job: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
        email: user.email || '',
        phone: user.phone || '',
        job: user.job || user.department || ''
      });
    }
    fetchBorrowsCount();
  }, [user]);

  const fetchBorrowsCount = async () => {
    try {
      const response = await borrowService.getUserBorrows();
      const borrowsList = response?.data?.data?.borrows || response?.data?.borrows || [];
      const active = borrowsList.filter((b) => ['borrowed', 'approved', 'active'].includes(b.status)).length;
      const returned = borrowsList.filter((b) => b.status === 'returned').length;

      setStats({
        totalBorrows: borrowsList.length,
        activeBorrows: active,
        returnedBorrows: returned
      });
    } catch (err) {
      console.error('Error loading borrow stats:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await updateProfile(formData);
      if (result?.success || result?.data) {
        setEditing(false);
        showSuccess('تم تحديث بيانات الملف الشخصي بنجاح!');
      } else {
        showError(result?.message || 'حدث خطأ في تحديث البيانات');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      job: user?.job || ''
    });
    setErrors({});
    setEditing(false);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'مدير النظام';
      case 'librarian':
        return 'أمين مكتبة';
      default:
        return 'عضو / قارئ';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary" gutterBottom>
          الملف الشخصي
        </Typography>
        <Typography variant="body1" color="text.secondary">
          إدارة بياناتك الشخصية ومتابعة إحصائيات استعارة الكتب
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="إجمالي الاستعارات"
            value={stats.totalBorrows}
            icon={<MenuBook fontSize="medium" />}
            color="#3b82f6"
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="استعارات نشطة"
            value={stats.activeBorrows}
            icon={<BookmarkAdded fontSize="medium" />}
            color="#10b981"
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="كتب تم إرجاعها"
            value={stats.returnedBorrows}
            icon={<VerifiedUser fontSize="medium" />}
            color="#8b5cf6"
            delay={0.3}
          />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, sm: 3, xl: 4 }}>
        {/* Profile Details Form */}
        <Grid item xs={12} lg={8}>
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
                p: { xs: 2.5, sm: 4 }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  البيانات الشخصية
                </Typography>
                {!editing ? (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setEditing(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    تعديل البيانات
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Save />}
                      onClick={handleSubmit}
                      disabled={loading}
                      sx={{ borderRadius: 2 }}
                    >
                      حفظ التغييرات
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      disabled={loading}
                      sx={{ borderRadius: 2 }}
                    >
                      إلغاء
                    </Button>
                  </Stack>
                )}
              </Box>

              <form onSubmit={handleSubmit} noValidate>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="fullName"
                      label="الاسم الكامل"
                      value={formData.fullName}
                      onChange={handleChange}
                      error={!!errors.fullName}
                      helperText={errors.fullName}
                      disabled={!editing || loading}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="email"
                      label="البريد الإلكتروني"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      disabled={!editing || loading}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="phone"
                      label="رقم الهاتف"
                      value={formData.phone}
                      onChange={handleChange}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      disabled={!editing || loading}
                      inputProps={{ dir: 'ltr' }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="job"
                      label="المهنة / التخصص الدراسي"
                      placeholder="مثال: طالب، باحث، مهندس..."
                      value={formData.job}
                      onChange={handleChange}
                      disabled={!editing || loading}
                    />
                  </Grid>
                </Grid>
              </form>
            </Card>
          </motion.div>
        </Grid>

        {/* Profile Side Card */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                p: 3,
                textAlign: 'center'
              }}
            >
              <Avatar
                sx={{
                  width: 90,
                  height: 90,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontSize: '2.2rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
                }}
              >
                {formData.fullName?.charAt(0) || user?.fullName?.charAt(0) || 'م'}
              </Avatar>

              <Typography variant="h6" fontWeight="bold" color="text.primary">
                {formData.fullName || user?.fullName || 'مستخدم المكتبة'}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {formData.job || user?.job || 'عضو مسجل'}
              </Typography>

              <Chip
                label={getRoleLabel(user?.role)}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ mb: 3, fontWeight: 600 }}
              />

              <Divider sx={{ my: 2 }} />

              <List disablePadding>
                <ListItem disableGutters sx={{ py: 1 }}>
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Email sx={{ color: 'primary.main', fontSize: 20 }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="caption" color="text.secondary">البريد الإلكتروني</Typography>}
                    secondary={<Typography variant="body2" fontWeight={600} color="text.primary">{formData.email || user?.email || '—'}</Typography>}
                  />
                </ListItem>

                <ListItem disableGutters sx={{ py: 1 }}>
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Phone sx={{ color: 'primary.main', fontSize: 20 }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="caption" color="text.secondary">رقم الهاتف</Typography>}
                    secondary={<Typography variant="body2" fontWeight={600} color="text.primary" dir="ltr" sx={{ textAlign: 'right' }}>{formData.phone || user?.phone || 'غير مسجل'}</Typography>}
                  />
                </ListItem>

                <ListItem disableGutters sx={{ py: 1 }}>
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Work sx={{ color: 'primary.main', fontSize: 20 }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="caption" color="text.secondary">المهنة / التخصص</Typography>}
                    secondary={<Typography variant="body2" fontWeight={600} color="text.primary">{formData.job || user?.job || 'غير محدد'}</Typography>}
                  />
                </ListItem>
              </List>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;