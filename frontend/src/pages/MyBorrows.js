import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField,
  Rating,
  Stack,
  alpha
} from '@mui/material';
import {
  BookmarkAdded,
  Schedule,
  CheckCircle,
  Warning,
  Info,
  Refresh,
  Star,
  RateReview,
  MenuBook,
  AutoStories
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import borrowService from '../services/borrowService';
import bookService from '../services/bookService';
import { getImageUrl } from '../utils/imageUtils';
import { useNotification } from '../contexts/NotificationContext';
import useBookAccess from '../hooks/useBookAccess';

const getStatusInfo = (borrow) => {
  const today = new Date();
  const dueDate = borrow?.dueDate ? new Date(borrow.dueDate) : today;
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  switch (borrow?.status) {
    case 'pending':
      return { label: 'طلب معلق', color: 'warning', icon: <Schedule fontSize="small" /> };
    case 'approved':
      return { label: 'جاهز للاستلام', color: 'info', icon: <CheckCircle fontSize="small" /> };
    case 'borrowed':
    case 'active':
      return {
        label: diffDays > 0 ? `متبقي ${diffDays} يوم` : 'ينتهي اليوم',
        color: diffDays > 3 ? 'success' : 'error',
        icon: <Schedule fontSize="small" />
      };
    case 'returned':
      return { label: 'تم الإرجاع', color: 'default', icon: <CheckCircle fontSize="small" /> };
    case 'overdue':
      return { label: 'متأخر عن الإرجاع', color: 'error', icon: <Warning fontSize="small" /> };
    case 'cancelled':
    case 'rejected':
      return { label: 'ملغي / مرفوض', color: 'default', icon: <Info fontSize="small" /> };
    default:
      return { label: borrow?.status || 'حالة غير محددة', color: 'default', icon: <Info fontSize="small" /> };
  }
};

const BorrowCardItem = ({ borrow, index, onReview, onViewBook, onRead, onDownload }) => {
  const statusInfo = getStatusInfo(borrow);

  return (
    <motion.div
      initial={{ y: 25, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: Math.min(index * 0.08, 0.4), duration: 0.5 }}
    >
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          p: { xs: 2, sm: 2.5 }
        }}
      >
        <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
          {/* Cover Image */}
          <Grid item xs={12} sm={3} md={2}>
            <Box
              sx={{
                width: { xs: 100, sm: '100%' },
                maxWidth: 140,
                pt: { xs: '130px', sm: '135%' },
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'action.hover',
                mx: { xs: 'auto', sm: 0 }
              }}
            >
              <img
                src={getImageUrl(borrow.book?.coverImage)}
                alt={borrow.book?.title || 'غلاف الكتاب'}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.png';
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
          </Grid>

          {/* Details */}
          <Grid item xs={12} sm={9} md={10}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  {borrow.book?.title || 'عنوان الكتاب غير متوفر'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  المؤلف: {borrow.book?.author || 'غير محدد'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip
                  icon={statusInfo.icon}
                  label={statusInfo.label}
                  color={statusInfo.color}
                  size="small"
                  variant="filled"
                  sx={{ fontWeight: 'bold' }}
                />
                {borrow.penalty > 0 && (
                  <Chip
                    label={`غرامة: ${borrow.penalty} ريال`}
                    color="error"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" color="text.secondary">تاريخ طلب الاستعارة:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {borrow.borrowDate ? new Date(borrow.borrowDate).toLocaleDateString('ar-EG') : '—'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" color="text.secondary">تاريخ الإرجاع المحدد:</Typography>
                <Typography variant="body2" fontWeight={600} color={statusInfo.color === 'error' ? 'error.main' : 'text.primary'}>
                  {borrow.dueDate ? new Date(borrow.dueDate).toLocaleDateString('ar-EG') : '—'}
                </Typography>
              </Grid>
              {borrow.returnDate && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="caption" color="text.secondary">تاريخ الإرجاع الفعلي:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {new Date(borrow.returnDate).toLocaleDateString('ar-EG')}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* Actions */}
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              {borrow.book?._id && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AutoStories fontSize="small" />}
                  onClick={() => onViewBook(borrow.book._id)}
                  sx={{ borderRadius: 2 }}
                >
                  صفحة الكتاب
                </Button>
              )}
              {(borrow.status === 'approved' || borrow.status === 'borrowed') && borrow.canRead && (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<MenuBook fontSize="small" />}
                  onClick={() => onRead(borrow.book?._id)}
                  sx={{ borderRadius: 2 }}
                >
                  قراءة مباشرة
                </Button>
              )}
              {(borrow.status === 'approved' || borrow.status === 'borrowed') && borrow.canDownload && (
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={() => onDownload(borrow.book?._id, borrow.book?.title)}
                  sx={{ borderRadius: 2 }}
                >
                  تحميل PDF
                </Button>
              )}
              {borrow.status === 'returned' && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<RateReview fontSize="small" />}
                  onClick={() => onReview(borrow)}
                  sx={{ borderRadius: 2 }}
                >
                  {borrow.review ? 'تعديل التقييم' : 'أضف تقييم ومراجعة'}
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </motion.div>
  );
};

const MyBorrows = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { handleRead, handleDownload } = useBookAccess();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBorrows();
  }, []);

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      const response = await borrowService.getMyBorrowRequests();
      setBorrows(response?.data?.data?.requests || response?.data?.requests || []);
    } catch (error) {
      console.error('Error fetching borrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (borrow) => {
    setSelectedBorrow(borrow);
    if (borrow.review) {
      setReviewData({
        rating: borrow.review.rating || 0,
        comment: borrow.review.comment || ''
      });
    } else {
      setReviewData({ rating: 0, comment: '' });
    }
    setReviewDialog(true);
  };

  const submitReview = async () => {
    if (!selectedBorrow?.book?._id) return;
    if (reviewData.rating === 0 || !reviewData.comment.trim()) {
      showError('يرجى تحديد التقييم بالنجوم وكتابة تعليق');
      return;
    }

    try {
      setSubmitting(true);
      await bookService.addReview(selectedBorrow.book._id, {
        rating: reviewData.rating,
        comment: reviewData.comment
      });

      setReviewDialog(false);
      showSuccess('تم إرسال مراجعتك بنجاح!');
      fetchBorrows();
    } catch (error) {
      showError('حدث خطأ أثناء حفظ المراجعة');
    } finally {
      setSubmitting(false);
    }
  };



  // Stats calculation
  const stats = useMemo(() => {
    const total = borrows.length;
    const active = borrows.filter((b) => ['borrowed', 'approved', 'active'].includes(b.status)).length;
    const pending = borrows.filter((b) => b.status === 'pending').length;
    const returned = borrows.filter((b) => b.status === 'returned').length;
    return { total, active, pending, returned };
  }, [borrows]);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <BookmarkAdded sx={{ fontSize: 36, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
            سجل استعاراتي
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          متابعة حالة الكتب المستعارة والطلبات المعلقة وتواريخ الإرجاع
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2.5, textAlign: 'center', borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}`, bgcolor: 'background.paper' }}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">{stats.total}</Typography>
            <Typography variant="body2" color="text.secondary">إجمالي الطلبات</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2.5, textAlign: 'center', borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}`, bgcolor: 'background.paper' }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">{stats.active}</Typography>
            <Typography variant="body2" color="text.secondary">استعارات جارية</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2.5, textAlign: 'center', borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}`, bgcolor: 'background.paper' }}>
            <Typography variant="h4" fontWeight="bold" color="warning.main">{stats.pending}</Typography>
            <Typography variant="body2" color="text.secondary">طلبات معلقة</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2.5, textAlign: 'center', borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}`, bgcolor: 'background.paper' }}>
            <Typography variant="h4" fontWeight="bold" color="text.primary">{stats.returned}</Typography>
            <Typography variant="body2" color="text.secondary">تم إرجاعها</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Borrows Content */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={44} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">جاري تحميل سجل الاستعارات...</Typography>
        </Box>
      ) : borrows.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            borderRadius: 4,
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            bgcolor: 'background.paper'
          }}
        >
          <MenuBook sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
            لا توجد استعارات سابقة
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mb: 3 }}>
            لم تقم بطلب استعارة أي كتاب حتى الآن. تصفح فهرس الكتب واختر كتابك التالي!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/books')}
            startIcon={<AutoStories />}
            sx={{ borderRadius: 2, px: 3 }}
          >
            تصفح فهرس الكتب
          </Button>
        </Paper>
      ) : (
        <Box>
          {borrows.map((borrow, index) => (
            <BorrowCardItem
              key={borrow._id || index}
              borrow={borrow}
              index={index}
              onReview={handleOpenReview}
              onViewBook={(id) => navigate(`/books/${id}`)}
              onRead={handleRead}
              onDownload={handleDownload}
            />
          ))}
        </Box>
      )}

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog}
        onClose={() => setReviewDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          تقييم كتاب: {selectedBorrow?.book?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              حدد تقييمك بالنجوم:
            </Typography>
            <Rating
              value={reviewData.rating}
              onChange={(_, val) => setReviewData({ ...reviewData, rating: val })}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="مراجعتك وانطباعك عن الكتاب"
            value={reviewData.comment}
            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
            placeholder="شاركنا رأيك في المحتوى وأسلوب الكاتب..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReviewDialog(false)} color="inherit">
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={submitReview}
            disabled={submitting || reviewData.rating === 0 || !reviewData.comment.trim()}
          >
            {submitting ? 'جاري الإرسال...' : 'حفظ التقييم'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyBorrows;