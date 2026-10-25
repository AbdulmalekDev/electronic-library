import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  CircularProgress,
  Stack,
  alpha
} from '@mui/material';
import {
  Phone,
  Email,
  LocationOn,
  AccessTime,
  Send,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Message,
  Headset,
  CheckCircle
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNotification } from '../contexts/NotificationContext';

const Contact = () => {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

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

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'موضوع الرسالة مطلوب';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'نص الرسالة مطلوب';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'يجب أن تكون الرسالة على الأقل 10 أحرف';
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitted(true);
      showSuccess('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      showError('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Phone />,
      title: 'رقم الهاتف',
      content: '+966 11 123 4567',
      color: '#3b82f6'
    },
    {
      icon: <Email />,
      title: 'البريد الإلكتروني',
      content: 'support@almalek-library.com',
      color: '#10b981'
    },
    {
      icon: <LocationOn />,
      title: 'العنوان',
      content: 'الرياض، المملكة العربية السعودية',
      color: '#f59e0b'
    },
    {
      icon: <AccessTime />,
      title: 'ساعات العمل',
      content: 'الأحد - الخميس: 8:00 ص - 10:00 م',
      color: '#8b5cf6'
    }
  ];

  const faqItems = [
    {
      question: 'كيف يمكنني استعارة كتاب؟',
      answer: 'يمكنك تصفح الكتب والضغط على زر الاستعارة في صفحة الكتاب بعد تسجيل الدخول. يمكنك متابعة حالة طلبك من صفحة استعاراتي.'
    },
    {
      question: 'كم المدة المسموحة للاستعارة؟',
      answer: 'المدة الافتراضية للاستعارة هي 14 يوماً من تاريخ الاستلام، مع إمكانية التجديد قبل انتهاء المدة في حال توفر نسخ إضافية.'
    },
    {
      question: 'كيف يمكنني قراءة الكتاب رقمياً؟',
      answer: 'توفر المكتبة إمكانية قراءة الكتب الرقمية المتاحة بصيغة PDF مباشرة من المتصفح دون الحاجة لتنزيل تطبيقات إضافية.'
    },
    {
      question: 'هل توجد خاصية البحث المتقدم والتصفية؟',
      answer: 'نعم، يمكنك البحث بالعنوان والمؤلف والتصنيف والترتيب حسب التقييم أو الأحدث نشراً من خلال صفحة فهرس الكتب.'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              p: 2,
              borderRadius: '50%',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              mb: 2
            }}
          >
            <Headset sx={{ fontSize: 52 }} />
          </Box>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="text.primary">
            تواصل معنا
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 650, mx: 'auto', lineHeight: 1.8 }}>
            فريق خدمة القراء والباحثين جاهز للإجابة على جميع استفساراتكم وملاحظاتكم
          </Typography>
        </motion.div>
      </Box>

      {/* Success Alert */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Alert
            severity="success"
            icon={<CheckCircle />}
            onClose={() => setSubmitted(false)}
            sx={{ mb: 4, borderRadius: 2 }}
          >
            تم إرسال رسالتك بنجاح! سنقوم بالرد عليك عبر البريد الإلكتروني في أسرع وقت.
          </Alert>
        </motion.div>
      )}

      <Grid container spacing={{ xs: 2, sm: 3, xl: 4 }}>
        {/* Contact Form */}
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
                p: { xs: 2, sm: 3, md: 4 }
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
                  أرسل لنا رسالة
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  يرجى تعبئة النموذج وسيقوم فريق الدعم الفني بالرد خلال 24 ساعة
                </Typography>

                <form onSubmit={handleSubmit} noValidate>
                  <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="name"
                        label="الاسم الكامل"
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        disabled={loading}
                        size="medium"
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
                        disabled={loading}
                        size="medium"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="phone"
                        label="رقم الهاتف (اختياري)"
                        value={formData.phone}
                        onChange={handleChange}
                        error={!!errors.phone}
                        helperText={errors.phone}
                        disabled={loading}
                        size="medium"
                        inputProps={{ dir: 'ltr' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="subject"
                        label="موضوع الرسالة"
                        value={formData.subject}
                        onChange={handleChange}
                        error={!!errors.subject}
                        helperText={errors.subject}
                        disabled={loading}
                        size="medium"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={5}
                        name="message"
                        label="نص الرسالة"
                        value={formData.message}
                        onChange={handleChange}
                        error={!!errors.message}
                        helperText={errors.message}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                        sx={{
                          py: 1.5,
                          px: 4,
                          borderRadius: 2,
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        }}
                      >
                        {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Contact Info Sidebar */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Stack spacing={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  p: 2.5
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 2 }}>
                    معلومات التواصل
                  </Typography>
                  <List disablePadding>
                    {contactInfo.map((info, index) => (
                      <ListItem key={index} disableGutters sx={{ py: 1.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: info.color, color: 'white', width: 40, height: 40 }}>
                            {info.icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="body2" color="text.secondary">{info.title}</Typography>}
                          secondary={<Typography variant="body1" fontWeight={600} color="text.primary">{info.content}</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  p: 2.5
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 2 }}>
                    تابعنا على وسائل التواصل
                  </Typography>
                  <Stack direction="row" spacing={1.5}>
                    <IconButton
                      component="a"
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="صفحتنا على فيسبوك"
                      sx={{ bgcolor: 'action.hover', color: 'primary.main' }}
                    >
                      <Facebook fontSize="small" />
                    </IconButton>
                    <IconButton
                      component="a"
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="حسابنا على تويتر"
                      sx={{ bgcolor: 'action.hover', color: 'primary.main' }}
                    >
                      <Twitter fontSize="small" />
                    </IconButton>
                    <IconButton
                      component="a"
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="حسابنا على إنستغرام"
                      sx={{ bgcolor: 'action.hover', color: 'primary.main' }}
                    >
                      <Instagram fontSize="small" />
                    </IconButton>
                    <IconButton
                      component="a"
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="حسابنا على لينكد إن"
                      sx={{ bgcolor: 'action.hover', color: 'primary.main' }}
                    >
                      <LinkedIn fontSize="small" />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  p: 2.5,
                  bgcolor: (theme) => alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.12 : 0.08),
                  border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Message sx={{ color: 'warning.main' }} />
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                      دعم الحالات العاجلة
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    للاستفسارات التقنية والمساعدة الفورية المباشرة:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary.main" dir="ltr" sx={{ mt: 1, textAlign: 'right' }}>
                    +966 50 123 4567
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </motion.div>
        </Grid>
      </Grid>

      {/* FAQ Section */}
      <Box sx={{ mt: 10 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom fontWeight="bold" color="text.primary">
          الأسئلة الشائعة
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 5, maxWidth: 600, mx: 'auto' }}>
          إجابات سريعة على أهم الاستفسارات المتكررة من أعضاء وزوار المكتبة
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {faqItems.map((faq, index) => (
            <Grid item xs={12} md={6} key={index}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                style={{ height: '100%' }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="text.primary">
                    {faq.question}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {faq.answer}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Contact;