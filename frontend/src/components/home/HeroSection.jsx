import React from 'react';
import { Box, Typography, Container, Button, Stack, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { AutoStories, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HeroSection = ({ onBrowseClick }) => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                pt: { xs: 8, md: 0 },
                pb: { xs: 8, md: 0 },
                textAlign: { xs: 'center', md: 'right' },
                maxWidth: '100%',
                width: '100%'
            }}
        >
            {/* Background Decoration */}
            <Box
                sx={{
                    position: 'absolute',
                    top: { xs: -50, md: -100 },
                    right: { xs: -50, md: -100 },
                    width: { xs: 200, md: 400 },
                    height: { xs: 200, md: 400 },
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: { xs: -30, md: -50 },
                    left: '5%',
                    width: { xs: 150, md: 300 },
                    height: { xs: 150, md: 300 },
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.03)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={7}>
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Typography
                                variant="h1"
                                sx={{
                                    fontWeight: 900,
                                    fontSize: { xs: '2.2rem', sm: '3.2rem', md: '4.2rem' },
                                    lineHeight: 1.15,
                                    mb: 2,
                                    textShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                }}
                            >
                                مكتبة عبد الملك الإلكترونية
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 4,
                                    opacity: 0.9,
                                    maxWidth: 600,
                                    mx: { xs: 'auto', md: 0 },
                                    lineHeight: { xs: 1.6, md: 1.8 },
                                    fontWeight: 400,
                                    fontSize: { xs: '1rem', md: '1.25rem' }
                                }}
                            >
                                بوابتك إلى عالم لا محدود من المعرفة والثقافة. استكشف آلاف الكتب والمصادر الرقمية في مختلف المجالات، مجمعة بعناية لتناسب شغفك العلمي والأدبي.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<AutoStories />}
                                    onClick={onBrowseClick}
                                    sx={{
                                        bgcolor: 'white',
                                        color: 'primary.main',
                                        px: { xs: 3, sm: 4 },
                                        py: 1.5,
                                        fontSize: '1.05rem',
                                        fontWeight: 'bold',
                                        borderRadius: 2,
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.95)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    تصفح الكتب
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    endIcon={<ArrowBack />}
                                    onClick={() => navigate('/about')}
                                    sx={{
                                        color: 'white',
                                        borderColor: 'rgba(255,255,255,0.8)',
                                        px: { xs: 3, sm: 4 },
                                        py: 1.5,
                                        fontSize: '1.05rem',
                                        borderRadius: 2,
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: 'rgba(255,255,255,0.1)'
                                        }
                                    }}
                                >
                                    تعرف علينا
                                </Button>
                            </Stack>
                        </motion.div>
                    </Grid>

                    <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            style={{ width: '100%' }}
                        >
                            <Box
                                component="img"
                                src="/hero-illustration.svg"
                                alt="Digital Library"
                                sx={{
                                    width: '100%',
                                    maxWidth: 450,
                                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                                    mx: 'auto'
                                }}
                                onError={(e) => {
                                    e.target.src = "https://cdn.pixabay.com/photo/2018/01/17/18/43/book-3088775_1280.png";
                                }}
                            />
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default HeroSection;
