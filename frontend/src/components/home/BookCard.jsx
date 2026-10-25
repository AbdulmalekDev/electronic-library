import React, { useState, useEffect } from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Rating,
    Tooltip,
    IconButton,
    Chip,
    Button,
    CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getImageUrl } from '../../utils/imageUtils';
import { Favorite, FavoriteBorder, Visibility, AutoStories } from '@mui/icons-material';
import bookService from '../../services/bookService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const BookCard = React.memo(({
    book,
    catalogMode = false,
    isFavoriteProp,
    onToggleFavorite,
    index = 0
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [localFavorite, setLocalFavorite] = useState(book.isFavorite || false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isFavoriteProp !== undefined) {
            setLocalFavorite(isFavoriteProp);
        } else if (book.isFavorite !== undefined) {
            setLocalFavorite(book.isFavorite);
        }
    }, [isFavoriteProp, book.isFavorite]);

    const isFavorite = isFavoriteProp !== undefined ? isFavoriteProp : localFavorite;

    const handleFavoriteClick = async (e) => {
        e.stopPropagation(); // Prevent navigating to book details

        if (onToggleFavorite) {
            onToggleFavorite(book._id);
            return;
        }

        if (!user) {
            showError('يرجى تسجيل الدخول أولاً لإضافة الكتاب للمفضلة');
            navigate('/login');
            return;
        }

        if (loading) return;

        const previousState = localFavorite;
        setLocalFavorite(!previousState);
        setLoading(true);

        try {
            const response = await bookService.toggleFavorite(book._id);
            const favState = response.data.favorited;
            setLocalFavorite(favState);
            showSuccess(favState ? 'تمت الإضافة للمفضلة' : 'تمت الإزالة من المفضلة');
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setLocalFavorite(previousState);
            showError('حدث خطأ في تحديث المفضلة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={catalogMode ? { y: 30, opacity: 0 } : undefined}
            animate={catalogMode ? { y: 0, opacity: 1 } : undefined}
            transition={catalogMode ? { delay: Math.min(index * 0.05, 0.4), duration: 0.4 } : undefined}
            whileHover={{ y: -6 }}
            style={{ height: '100%' }}
        >
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: (theme) =>
                            theme.palette.mode === 'dark'
                                ? '0 12px 30px rgba(0,0,0,0.5)'
                                : '0 12px 30px rgba(0,0,0,0.12)',
                    },
                    cursor: 'pointer',
                    position: 'relative'
                }}
                onClick={() => navigate(`/books/${book._id}`)}
            >
                {book.featured && (
                    <Chip
                        label="مميز"
                        color="primary"
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            zIndex: 1,
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                    />
                )}

                {!book.featured && book.category && (
                    <Chip
                        label={book.category}
                        size="small"
                        color="primary"
                        sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            zIndex: 1,
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        }}
                    />
                )}

                <Tooltip title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}>
                    <IconButton
                        aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                        onClick={handleFavoriteClick}
                        disabled={loading}
                        sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            zIndex: 2,
                           
                            // backgroundColor: 'background.paper',
                            // boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                            // '&:hover': {
                            //     backgroundColor: 'background.paper',
                            // }
                        }}
                        size="small"
                    >
                        {loading ? (
                            <CircularProgress size={18} color="error" />
                        ) : (
                            <motion.div
                                whileTap={{ scale: 0.8 }}
                                whileHover={{ scale: 1.1 }}
                            >
                                {isFavorite ? (
                                    <Favorite sx={{ color: '#ef4444', fontSize: 18 }} />
                                ) : (
                                    <FavoriteBorder sx={{ fontSize: 18 }} />
                                )}
                            </motion.div>
                        )}
                    </IconButton>
                </Tooltip>

                <Box sx={{ position: 'relative', pt: '135%', overflow: 'hidden', bgcolor: 'action.hover' }}>
                    <CardMedia
                        component="img"
                        image={getImageUrl(book.coverImage)}
                        alt={book.title || 'غلاف الكتاب'}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder.png';
                        }}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                            }
                        }}
                    />
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
                    <Typography
                        variant="subtitle1"
                        component="h2"
                        sx={{
                            fontWeight: 'bold',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: catalogMode ? 1 : 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.3
                        }}
                    >
                        {book.title}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 1.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical'
                        }}
                    >
                        بقلم: {book.author || 'مؤلف غير محدد'}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 0.5 }}>
                        <Rating
                            value={Number(book.averageRating || book.rating) || 0}
                            readOnly
                            size="small"
                            precision={0.5}
                        />
                        <Typography variant="caption" color="text.secondary">
                            ({book.reviewsCount || book.ratingCount || 0})
                        </Typography>
                    </Box>

                    {catalogMode ? (
                        <Box sx={{ mt: 'auto', pt: 1 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 1.5,
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    النسخ المتاحة:
                                </Typography>
                                <Chip
                                    label={book.availableCopies > 0 ? `${book.availableCopies} نسخة` : 'غير متوفر'}
                                    size="small"
                                    color={book.availableCopies > 0 ? 'success' : 'default'}
                                    variant={book.availableCopies > 0 ? 'filled' : 'outlined'}
                                    sx={{ height: 22, fontSize: '0.72rem', fontWeight: 'bold' }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/books/${book._id}`);
                                    }}
                                    startIcon={<AutoStories fontSize="small" />}
                                    sx={{
                                        borderRadius: 2,
                                        py: 0.8,
                                        fontWeight: 600,
                                        fontSize: '0.82rem',
                                    }}
                                >
                                    التفاصيل
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    fullWidth
                                    disabled={book.availableCopies === 0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/books/${book._id}`);
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        py: 0.8,
                                        fontWeight: 600,
                                        fontSize: '0.82rem',
                                    }}
                                >
                                    {book.availableCopies > 0 ? 'استعارة' : 'مستعار'}
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                <Visibility sx={{ fontSize: 16 }} />
                                <Typography variant="caption">{book.viewCount || 0}</Typography>
                            </Box>

                            <Tooltip title="عرض التفاصيل">
                                <IconButton
                                    size="small"
                                    color="primary"
                                    aria-label="عرض تفاصيل الكتاب"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/books/${book._id}`);
                                    }}
                                >
                                    <AutoStories fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
});

BookCard.displayName = 'BookCard';

export default BookCard;
