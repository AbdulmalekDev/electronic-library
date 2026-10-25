import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
  School
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        pt: 6,
        pb: 4,
        mt: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 2, sm: 3, xl: 4 }}>
          {/* معلومات المكتبة */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <School sx={{ fontSize: 32, color: 'primary.light' }} />
              <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                مكتبة عبد الملك الإلكترونية
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.9, color: 'rgba(255,255,255,0.75)' }}>
              مكتبة رقمية متكاملة تهدف إلى توفير أفضل المصادر المعرفية
              والثقافية للباحثين والطلاب والقراء في جميع المجالات مع تجربة استعارة وقراءة حديثة وسلسة.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                component="a"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="صفحتنا على فيسبوك"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                }}
                size="small"
              >
                <Facebook fontSize="small" />
              </IconButton>
              <IconButton
                component="a"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="حسابنا على تويتر"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                }}
                size="small"
              >
                <Twitter fontSize="small" />
              </IconButton>
              <IconButton
                component="a"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="حسابنا على إنستغرام"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                }}
                size="small"
              >
                <Instagram fontSize="small" />
              </IconButton>
              <IconButton
                component="a"
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="حسابنا على لينكد إن"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                }}
                size="small"
              >
                <LinkedIn fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          {/* روابط سريعة */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ color: 'white', mb: 2 }}>
              روابط سريعة
            </Typography>
            <Stack spacing={1.2}>
              <Link component={RouterLink} to="/" color="inherit" underline="hover" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                الصفحة الرئيسية
              </Link>
              <Link component={RouterLink} to="/books" color="inherit" underline="hover" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                فهرس الكتب
              </Link>
              <Link component={RouterLink} to="/about" color="inherit" underline="hover" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                عن المكتبة
              </Link>
              <Link component={RouterLink} to="/contact" color="inherit" underline="hover" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                اتصل بنا
              </Link>
              <Link component={RouterLink} to="/login" color="inherit" underline="hover" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                تسجيل الدخول
              </Link>
            </Stack>
          </Grid>

          {/* الخدمات */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ color: 'white', mb: 2 }}>
              خدماتنا
            </Typography>
            <Stack spacing={1.2}>
              <Link component={RouterLink} to="/books" color="inherit" underline="hover" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                استعارة وقراءة الكتب
              </Link>
              <Link component={RouterLink} to="/books" color="inherit" underline="hover" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                البحث والتصفية
              </Link>
              <Link component={RouterLink} to="/my-borrows" color="inherit" underline="hover" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                سجل الاستعارات
              </Link>
              <Link component={RouterLink} to="/profile" color="inherit" underline="hover" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                الملف الشخصي
              </Link>
              <Link component={RouterLink} to="/about" color="inherit" underline="hover" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
                أهداف ورؤية المكتبة
              </Link>
            </Stack>
          </Grid>

          {/* معلومات التواصل */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ color: 'white', mb: 2 }}>
              تواصل معنا
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocationOn sx={{ color: 'primary.light', fontSize: 20 }} />
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  المملكة العربية السعودية / مصر
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Phone sx={{ color: 'primary.light', fontSize: 20 }} />
                <Typography variant="body2" dir="ltr" sx={{ opacity: 0.85, textAlign: 'right' }}>
                  +966 11 123 4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Email sx={{ color: 'primary.light', fontSize: 20 }} />
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  support@almalek-library.com
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: { xs: 'center', md: 'right' } }}>
              © {new Date().getFullYear()} مكتبة عبد الملك الإلكترونية. جميع الحقوق محفوظة.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, gap: 3 }}>
              <Link component={RouterLink} to="/about" color="inherit" underline="hover" variant="body2" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                عن المكتبة
              </Link>
              <Link component={RouterLink} to="/contact" color="inherit" underline="hover" variant="body2" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                الدعم الفني
              </Link>
              <Link component={RouterLink} to="/books" color="inherit" underline="hover" variant="body2" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
                الكتب
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;