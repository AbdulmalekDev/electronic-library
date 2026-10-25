import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Paper,
  Rating,
  Avatar,
  Divider,
  TextField,
  Alert,
  Chip,
  Tab,
  Tabs,
  IconButton,
  CircularProgress,
  Stack,
  Tooltip,
  alpha
} from '@mui/material';
import {
  ArrowBack,
  BookmarkAdd,
  BookmarkRemove,
  Share,
  Favorite,
  FavoriteBorder,
  AccessTime,
  Person,
  Category,
  Description,
  MenuBook,
  CloudDownload,
  CheckCircle,
  Visibility
} from '@mui/icons-material';
import bookService from '../services/bookService';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { getImageUrl } from '../utils/imageUtils';
import { useNotification } from '../contexts/NotificationContext';
import useBookAccess from '../hooks/useBookAccess';

const ReviewCard = ({ review }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      mb: 2,
      borderRadius: 3,
      border: (theme) => `1px solid ${theme.palette.divider}`,
      bgcolor: 'background.paper'
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1.5 }}>
      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, fontWeight: 'bold' }}>
        {review.user?.fullName?.charAt(0) || 'م'}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
          {review.user?.fullName || 'قارئ مجهول'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(review.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>
      <Rating value={review.rating} readOnly size="small" precision={0.5} />
    </Box>
    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
      {review.comment}
    </Typography>
  </Paper>
);

const BookDetails = () => {
  const { id: bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookId) {
      fetchBookDetails();
      fetchReviews();
    }
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookService.getBook(bookId);
      const bookData = response?.data?.data?.book || response?.data?.book;
      if (!bookData) throw new Error('Not found');
      setBook(bookData);

      if (user) {
        setIsBookmarked(Boolean(bookData.isBookmarked));
        setIsFavorite(Boolean(bookData.isFavorite));
      }
    } catch (err) {
      console.error('Error fetching book details:', err);
      setError('لم يتم العثور على الكتاب المطلوب أو حدث خطأ في التحميل');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await bookService.getBookReviews(bookId);
      setReviews(response.data?.data?.reviews || response.data?.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleBorrowRequest = async () => {
    if (!user) {
      showError('يرجى تسجيل الدخول أولاً لطلب استعارة الكتاب');
      navigate('/login');
      return;
    }

    try {
      await bookService.requestBorrow(bookId);
      showSuccess('تم إرسال طلب الاستعارة بنجاح! يمكنك متابعة الحالة من صفحة استعاراتي');
      fetchBookDetails();
    } catch (err) {
      console.error('Error requesting borrow:', err);
      showError(err?.response?.data?.message || 'حدث خطأ في إرسال طلب الاستعارة');
    }
  };

  const {
    handleRead: readBook,
    handleDownload: downloadBook,
    isLoading: readingLoading,
    isDownloading: downloadingLoading
  } = useBookAccess();

  const handleRead = () => {
    readBook(bookId);
  };

  const handleDownload = () => {
    downloadBook(bookId, book?.title);
  };

  const handleBookmark = async () => {
    if (!user) {
      showError('يرجى تسجيل الدخول أولاً لإدارة المحفظة');
      navigate('/login');
      return;
    }

    try {
      if (isBookmarked) {
        await bookService.removeFromBookmarks(bookId);
        setIsBookmarked(false);
        showSuccess('تمت إزالة الكتاب من المحفظة');
      } else {
        await bookService.addToBookmarks(bookId);
        setIsBookmarked(true);
        showSuccess('تمت إضافة الكتاب إلى المحفظة');
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      showError('حدث خطأ أثناء تحديث المحفظة');
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      showError('يرجى تسجيل الدخول أولاً لإضافة الكتاب للمفضلة');
      navigate('/login');
      return;
    }

    if (favoriteLoading) return;

    const previousFavorite = isFavorite;
    setIsFavorite(!previousFavorite);
    setFavoriteLoading(true);

    try {
      const response = await bookService.toggleFavorite(bookId);
      setIsFavorite(response.data.favorited);
      showSuccess(response.data.favorited ? 'تمت إضافة الكتاب للمفضلة' : 'تمت إزالة الكتاب من المفضلة');
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setIsFavorite(previousFavorite);
      showError('حدث خطأ أثناء تحديث المفضلة');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: book?.title,
          text: `شاهد هذا الكتاب في مكتبة عبد الملك: ${book?.title} للكاتب ${book?.author}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showSuccess('تم نسخ رابط الكتاب إلى الحافظة');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      showError('يرجى تسجيل الدخول أولاً لإضافة مراجعة');
      navigate('/login');
      return;
    }

    if (newReview.rating === 0 || !newReview.comment.trim()) {
      showError('يرجى اختيار التقييم بالنجوم وكتابة تعليق المراجعة');
      return;
    }

    try {
      setReviewLoading(true);
      await bookService.addReview(bookId, {
        rating: newReview.rating,
        comment: newReview.comment
      });

      fetchReviews();
      fetchBookDetails();
      setNewReview({ rating: 0, comment: '' });
      showSuccess('تمت إضافة مراجعتك بنجاح!');
    } catch (err) {
      console.error('Error submitting review:', err);
      showError('حدث خطأ في إرسال المراجعة');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            جاري تحميل تفاصيل الكتاب...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !book) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error || 'لم يتم العثور على الكتاب المطلوب'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ borderRadius: 2 }}
        >
          العودة للخلف
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Top Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="text"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ fontWeight: 'bold' }}
        >
          العودة للفهرس
        </Button>

        <Stack direction="row" spacing={1}>
          <Tooltip title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}>
            <IconButton
              onClick={handleFavorite}
              aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
              color={isFavorite ? 'error' : 'default'}
              sx={{ bgcolor: 'background.paper', border: (theme) => `1px solid ${theme.palette.divider}` }}
            >
              {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>
          <Tooltip title={isBookmarked ? 'إزالة من المحفظة' : 'حفظ في المحفظة'}>
            <IconButton
              onClick={handleBookmark}
              aria-label={isBookmarked ? 'إزالة من المحفظة' : 'حفظ في المحفظة'}
              color={isBookmarked ? 'primary' : 'default'}
              sx={{ bgcolor: 'background.paper', border: (theme) => `1px solid ${theme.palette.divider}` }}
            >
              {isBookmarked ? <BookmarkRemove color="primary" /> : <BookmarkAdd />}
            </IconButton>
          </Tooltip>
          <Tooltip title="مشاركة رابط الكتاب">
            <IconButton
              onClick={handleShare}
              aria-label="مشاركة رابط الكتاب"
              sx={{ bgcolor: 'background.paper', border: (theme) => `1px solid ${theme.palette.divider}` }}
            >
              <Share />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Main Grid */}
      <Grid container spacing={{ xs: 2, sm: 3, xl: 4 }}>
        {/* Left Column: Cover & Actions */}
        <Grid item xs={12} md={4}>
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
                p: { xs: 2, sm: 3 }
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  pt: '135%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  mb: 3,
                  bgcolor: 'action.hover'
                }}
              >
                <img
                  src={getImageUrl(book.coverImage)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder.png';
                  }}
                  alt={book.title}
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

              {/* Action Buttons */}
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={book.availableCopies === 0}
                  onClick={handleBorrowRequest}
                  sx={{
                    borderRadius: 2.5,
                    py: 1.4,
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  {book.availableCopies > 0 ? 'طلب استعارة الكتاب' : 'غير متوفر حالياً'}
                </Button>

                {(book.fileUrl || book.pdfPath || book.hasPdf) && (
                  <>
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      startIcon={<MenuBook />}
                      onClick={handleRead}
                      disabled={readingLoading}
                      sx={{ borderRadius: 2.5, py: 1.2, fontWeight: 600 }}
                    >
                      {readingLoading ? 'جاري فتح الكتاب...' : 'قراءة مباشرة'}
                    </Button>
                    <Button
                      variant="text"
                      size="medium"
                      fullWidth
                      startIcon={<CloudDownload />}
                      onClick={handleDownload}
                      disabled={downloadingLoading}
                      sx={{ borderRadius: 2.5, fontWeight: 600 }}
                    >
                      {downloadingLoading ? 'جاري التحميل...' : 'تحميل نسخة PDF'}
                    </Button>
                  </>
                )}
              </Stack>

              <Divider sx={{ my: 2.5 }} />

              {/* Quick Specs */}
              <Stack spacing={1.2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">النسخ المتاحة:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {book.availableCopies} من {book.totalCopies}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">مدة الاستعارة:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {book.borrowPeriod || 14} يوم
                  </Typography>
                </Box>
                {book.isbn && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">الرقم الدولي (ISBN):</Typography>
                    <Typography variant="body2" fontWeight="bold" dir="ltr">
                      {book.isbn}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Card>
          </motion.div>
        </Grid>

        {/* Right Column: Book Details & Tabs */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 4 },
                borderRadius: 4,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                mb: 4
              }}
            >
              {book.category && (
                <Chip
                  label={book.category}
                  color="primary"
                  size="small"
                  sx={{ mb: 1.5, fontWeight: 600 }}
                />
              )}

              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom color="text.primary">
                {book.title}
              </Typography>

              <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                تأليف: {book.author}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Rating value={Number(book.averageRating || book.rating) || 0} readOnly precision={0.5} />
                  <Typography variant="body2" fontWeight="bold" color="text.primary">
                    ({book.reviewsCount || book.ratingCount || 0} تقييم)
                  </Typography>
                </Box>
                <Chip
                  label={book.availableCopies > 0 ? 'متاح للاستعارة' : 'مستعار بالكامل'}
                  color={book.availableCopies > 0 ? 'success' : 'default'}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                نبذة عن الكتاب
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, mb: 3 }}>
                {book.description || 'لا يوجد وصف متوفر لهذا الكتاب حالياً.'}
              </Typography>
            </Paper>

            {/* Tabs Section */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                overflow: 'hidden'
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="fullWidth"
                sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
              >
                <Tab label={`المراجعات والتقييمات (${reviews?.length || 0})`} sx={{ fontWeight: 'bold' }} />
                <Tab label="تفاصيل النشر والطباعة" sx={{ fontWeight: 'bold' }} />
              </Tabs>

              <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
                {activeTab === 0 && (
                  <Box>
                    {/* Add Review Box */}
                    {user ? (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          mb: 4,
                          borderRadius: 3,
                          bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04),
                          border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="text.primary">
                          أضف رأيك وتقييمك
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 1.5 }}>
                          <Typography variant="body2" color="text.secondary">تقييمك:</Typography>
                          <Rating
                            value={newReview.rating}
                            onChange={(_, val) => setNewReview({ ...newReview, rating: val })}
                            size="large"
                          />
                        </Box>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="اكتب انطباعك عن الكتاب ومحتواه..."
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          sx={{ mb: 2, bgcolor: 'background.paper', borderRadius: 2 }}
                        />
                        <Button
                          variant="contained"
                          onClick={handleSubmitReview}
                          disabled={reviewLoading || newReview.rating === 0 || !newReview.comment.trim()}
                          sx={{ borderRadius: 2, px: 3 }}
                        >
                          {reviewLoading ? 'جاري النشر...' : 'نشر التقييم'}
                        </Button>
                      </Paper>
                    ) : (
                      <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
                        يرجى{' '}
                        <Button color="inherit" size="small" onClick={() => navigate('/login')} sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                          تسجيل الدخول
                        </Button>{' '}
                        لإضافة تقييم ومراجعة لهذا الكتاب.
                      </Alert>
                    )}

                    {/* Review list */}
                    {reviews.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          لا توجد مراجعات حتى الآن. كن أول من يقيّم هذا الكتاب!
                        </Typography>
                      </Box>
                    ) : (
                      reviews.map((rev) => <ReviewCard key={rev._id || rev.id} review={rev} />)
                    )}
                  </Box>
                )}

                {activeTab === 1 && (
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">عدد الصفحات:</Typography>
                      <Typography variant="body1" fontWeight={600}>{book.pages || 'غير محدد'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">دار النشر:</Typography>
                      <Typography variant="body1" fontWeight={600}>{book.publisher || 'غير محدد'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">سنة النشر:</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {book.publishDate ? new Date(book.publishDate).getFullYear() : 'غير محدد'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">اللغة:</Typography>
                      <Typography variant="body1" fontWeight={600}>{book.language || 'العربية'}</Typography>
                    </Grid>
                  </Grid>
                )}
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookDetails;