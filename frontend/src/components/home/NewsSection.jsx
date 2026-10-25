import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Button, Stack, Paper, Link, Chip } from '@mui/material';
import { Newspaper, Visibility, CalendarMonth } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const NewsSection = () => {
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await api.get('/news', { params: { limit: 3 } });
                setNews(response.data?.data?.news || []);
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (!loading && news.length === 0) return null;

    return (
        <Container maxWidth="lg" sx={{ mb: { xs: 8, md: 15 } }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '1.8rem', md: '2.125rem' } }}>
                    أخبار المكتبة
                </Typography>
                <Box sx={{ width: 60, height: 4, bgcolor: 'primary.main', mx: 'auto', borderRadius: 2 }} />
            </Box>

            <Grid container spacing={{ xs: 2, sm: 3, xl: 4 }}>
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Grid item xs={12} md={4} key={i}>
                            <Paper sx={{ height: 400, borderRadius: 4, overflow: 'hidden' }}>
                                <Box sx={{ height: 200, bgcolor: 'rgba(0,0,0,0.05)' }} />
                                <Box sx={{ p: 3 }}>
                                    <Box sx={{ width: '100%', height: 20, bgcolor: 'rgba(0,0,0,0.05)', mb: 2 }} />
                                    <Box sx={{ width: '60%', height: 16, bgcolor: 'rgba(0,0,0,0.05)' }} />
                                </Box>
                            </Paper>
                        </Grid>
                    ))
                ) : (
                    news.map((item) => (
                        <Grid item xs={12} md={4} key={item._id}>
                            <Paper
                                elevation={0}
                                sx={{
                                    height: '100%',
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                                    }
                                }}
                            >
                                <Box sx={{ position: 'relative', height: 220 }}>
                                    <Box
                                        component="img"
                                        src={getImageUrl(item.image)}
                                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <Chip
                                        label={item.category}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            bottom: 12,
                                            right: 12,
                                            bgcolor: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            backdropFilter: 'blur(4px)',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Box>
                                <Box sx={{ p: 3 }}>
                                    <Stack direction="row" spacing={2} sx={{ mb: 1.5, color: 'text.secondary' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CalendarMonth sx={{ fontSize: 16, mr: 0.5 }} />
                                            <Typography variant="caption">
                                                {item.publishedDate ? format(new Date(item.publishedDate), 'dd MMMM yyyy', { locale: ar }) : ''}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                                            <Typography variant="caption">{item.viewCount || 0}</Typography>
                                        </Box>
                                    </Stack>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 'bold',
                                            mb: 1.5,
                                            lineHeight: 1.3,
                                            cursor: 'pointer',
                                            '&:hover': { color: 'primary.main' }
                                        }}
                                        onClick={() => navigate(`/news/${item._id}`)}
                                    >
                                        {item.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mb: 3,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxDirection: 'vertical',
                                            minHeight: '4.5em'
                                        }}
                                    >
                                        {item.summary}
                                    </Typography>
                                    <Link
                                        component="button"
                                        onClick={() => navigate(`/news/${item._id}`)}
                                        sx={{
                                            fontWeight: 'bold',
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            '&:hover': { textDecoration: 'underline' }
                                        }}
                                    >
                                        اقرأ المزيد
                                    </Link>
                                </Box>
                            </Paper>
                        </Grid>
                    ))
                )}
            </Grid>
        </Container>
    );
};


export default NewsSection;
