import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { ArrowBack, CalendarMonth, Visibility, Newspaper } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getNewsById } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const NewsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getNewsById(id);
        const data = response?.data?.data || response?.data;
        if (!data) throw new Error('Not found');
        setArticle(data);
      } catch (err) {
        console.error('Error fetching news article:', err);
        setError('تعذر تحميل تفاصيل الخبر أو أن الرابط غير صحيح');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <CircularProgress size={44} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          جاري تحميل تفاصيل الخبر...
        </Typography>
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error || 'لم يتم العثور على الخبر المطلوب'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ borderRadius: 2 }}
        >
          العودة للرئيسية
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="text"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, fontWeight: 'bold' }}
        >
          العودة للخلف
        </Button>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: 4,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            overflow: 'hidden'
          }}
        >
          {article.category && (
            <Chip
              label={article.category}
              color="primary"
              size="small"
              sx={{ mb: 2, fontWeight: 'bold' }}
            />
          )}

          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
            color="text.primary"
            sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' }, lineHeight: 1.3 }}
          >
            {article.title}
          </Typography>

          <Stack direction="row" spacing={3} sx={{ my: 2, color: 'text.secondary' }}>
            {article.publishedDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <CalendarMonth fontSize="small" />
                <Typography variant="body2">
                  {format(new Date(article.publishedDate), 'dd MMMM yyyy', { locale: ar })}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Visibility fontSize="small" />
              <Typography variant="body2">{article.viewCount || 0} مشاهدة</Typography>
            </Box>
          </Stack>

          {article.image && (
            <Box
              sx={{
                width: '100%',
                maxHeight: 450,
                borderRadius: 3,
                overflow: 'hidden',
                my: 3,
                bgcolor: 'action.hover'
              }}
            >
              <Box
                component="img"
                src={getImageUrl(article.image)}
                alt={article.title}
                sx={{
                  width: '100%',
                  height: '100%',
                  maxHeight: 450,
                  objectFit: 'cover'
                }}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="body1"
            color="text.primary"
            sx={{
              lineHeight: 2,
              fontSize: '1.1rem',
              whiteSpace: 'pre-line'
            }}
          >
            {article.content || article.summary}
          </Typography>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default NewsDetails;

