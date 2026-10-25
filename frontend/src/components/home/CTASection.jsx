import React from 'react';
import { Container, Typography, Box, Paper, Grid, Button } from '@mui/material';
import { PersonAdd, RocketLaunch } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const CTASection = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) return null;

    return (
        <Container maxWidth="lg" sx={{ mb: 15 }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <Paper
                    sx={{
                        p: { xs: 4, md: 8 },
                        borderRadius: { xs: 4, md: 8 },
                        background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                        color: 'white',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Decoration icons */}
                    <RocketLaunch
                        sx={{
                            position: 'absolute',
                            top: -20,
                            right: 40,
                            fontSize: { xs: 80, md: 120 },
                            opacity: 0.1,
                            transform: 'rotate(45deg)'
                        }}
                    />

                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, position: 'relative', fontSize: { xs: '1.8rem', md: '3rem' } }}>
                        ابدأ رحلتك المعرفية اليوم
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 6, opacity: 0.9, maxWidth: 600, mx: 'auto', fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        انضم إلى آلاف القراء والمستكشفين. احصل على حساب مجاني وابدأ في استعارة الكتب وإنشاء مكتبتك الخاصة.
                    </Typography>

                    <Grid container spacing={2} justifyContent="center" sx={{ position: 'relative' }}>
                        <Grid item xs={12} sm="auto">
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<PersonAdd />}
                                onClick={() => navigate('/register')}
                                sx={{
                                    bgcolor: 'white',
                                    color: 'secondary.main',
                                    px: { xs: 3, sm: 6 },
                                    py: 1.5,
                                    fontSize: { xs: '1rem', sm: '1.15rem' },
                                    fontWeight: 'bold',
                                    borderRadius: 3,
                                    width: { xs: '100%', sm: 'auto' },
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.95)',
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                انضم إلينا مجاناً
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm="auto">
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/login')}
                                sx={{
                                    borderColor: 'white',
                                    color: 'white',
                                    px: { xs: 3, sm: 6 },
                                    py: 1.5,
                                    fontSize: { xs: '1rem', sm: '1.15rem' },
                                    borderRadius: 3,
                                    width: { xs: '100%', sm: 'auto' },
                                    '&:hover': {
                                        borderColor: 'white',
                                        bgcolor: 'rgba(255,255,255,0.1)'
                                    }
                                }}
                            >
                                تسجيل الدخول
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default CTASection;
