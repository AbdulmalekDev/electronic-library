import React from 'react';
import { Container, Typography, Box, Paper, Grid, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategoriesSection = () => {
    const navigate = useNavigate();

    const categories = [
        { name: 'روايات', icon: '📚', color: '#1E3A8A', count: 156 },
        { name: 'تكنولوجيا', icon: '💻', color: '#16A34A', count: 92 },
        { name: 'علوم', icon: '🧬', color: '#3B82F6', count: 64 },
        { name: 'تاريخ', icon: '🏛️', color: '#F59E0B', count: 85 },
        { name: 'أدب', icon: '📖', color: '#EF4444', count: 120 },
        { name: 'فلسفة', icon: '🧠', color: '#6B7280', count: 45 },
    ];

    return (
        <Container maxWidth="lg" sx={{ mb: 15 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
                    تصفح حسب الفئة
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    اختر مجالك المفضل وابدأ رحلة الاستكشاف
                </Typography>
            </Box>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
                {categories.map((cat, index) => (
                    <Grid item xs={6} sm={4} md={2} key={index}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        borderColor: cat.color,
                                        boxShadow: `0 10px 20px ${cat.color}20`
                                    }
                                }}
                                onClick={() => navigate(`/books?category=${cat.name}`)}
                            >
                                <Avatar
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        mx: 'auto',
                                        mb: 2,
                                        fontSize: '2rem',
                                        bgcolor: `${cat.color}15`,
                                        color: cat.color
                                    }}
                                >
                                    {cat.icon}
                                </Avatar>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {cat.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {cat.count} كتاب
                                </Typography>
                            </Paper>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default CategoriesSection;
