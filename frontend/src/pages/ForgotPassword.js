import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Alert,
    Link,
    CircularProgress,
    InputAdornment
} from '@mui/material';
import {
    Email,
    ArrowForward,
    Info
} from '@mui/icons-material';
import { authService } from '../services/authService';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (!email) {
                setError('يرجى إدخال البريد الإلكتروني');
                setLoading(false);
                return;
            }

            const response = await authService.forgotPassword(email);

            if (response.data.success) {
                setSuccess(response.data.message || 'تم إرسال تعليمات استعادة كلمة المرور');
            } else {
                setError(response.data.message || 'حدث خطأ ما');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #0062D1 0%, #4FC3F7 100%)',
                py: 4
            }}
        >
            <Container maxWidth="sm">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card
                        sx={{
                            borderRadius: 4,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            overflow: 'hidden'
                        }}
                    >
                        <Box
                            sx={{
                                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                color: 'white',
                                p: 4,
                                textAlign: 'center'
                            }}
                        >
                            <Typography variant="h4" component="h1" fontWeight="bold">
                                نسيت كلمة المرور
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                                أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
                            </Typography>
                        </Box>

                        <CardContent sx={{ p: 4 }}>
                            <form onSubmit={handleSubmit}>
                                {error && (
                                    <Alert severity="error" sx={{ mb: 3 }}>
                                        {error}
                                    </Alert>
                                )}
                                {success && (
                                    <Alert severity="success" sx={{ mb: 3 }} icon={<Info />}>
                                        {success}
                                    </Alert>
                                )}

                                <TextField
                                    fullWidth
                                    label="البريد الإلكتروني"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ mb: 3 }}
                                    required
                                    disabled={loading || !!success}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={loading || !!success}
                                    sx={{
                                        py: 2,
                                        mb: 3,
                                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)',
                                        }
                                    }}
                                >
                                    {loading ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        'إرسال الرابط'
                                    )}
                                </Button>

                                <Box sx={{ textAlign: 'center' }}>
                                    <Link
                                        component={RouterLink}
                                        to="/login"
                                        sx={{
                                            textDecoration: 'none',
                                            color: '#1976d2',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <ArrowForward sx={{ fontSize: 18 }} />
                                        العودة إلى تسجيل الدخول
                                    </Link>
                                </Box>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </Box>
    );
};

export default ForgotPassword;
