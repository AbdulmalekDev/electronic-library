import React, { useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
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
    InputAdornment,
    IconButton
} from '@mui/material';
import {
    Lock,
    Visibility,
    VisibilityOff,
    ArrowForward,
    CheckCircle
} from '@mui/icons-material';
import { authService } from '../services/authService';
import { motion } from 'framer-motion';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('كلمتا المرور غير متطابقتين');
            return;
        }

        if (formData.password.length < 6) {
            setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
            return;
        }

        setLoading(true);

        try {
            const response = await authService.resetPassword(token, formData.password);

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(response.data.message || 'حدث خطأ ما');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'رمز إعادة التعيين غير صالح أو انتهت صلاحيته');
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
                                إعادة تعيين كلمة المرور
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                                أدخل كلمة المرور الجديدة لحسابك
                            </Typography>
                        </Box>

                        <CardContent sx={{ p: 4 }}>
                            {success ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', damping: 10 }}
                                    >
                                        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                                    </motion.div>
                                    <Typography variant="h5" gutterBottom fontWeight="bold">
                                        تم تغيير كلمة المرور بنجاح!
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        سيتم تحويلك إلى صفحة تسجيل الدخول خلال لحظات...
                                    </Typography>
                                </Box>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    {error && (
                                        <Alert severity="error" sx={{ mb: 3 }}>
                                            {error}
                                        </Alert>
                                    )}

                                    <TextField
                                        fullWidth
                                        name="password"
                                        label="كلمة المرور الجديدة"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock color="action" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{ mb: 3 }}
                                        required
                                        disabled={loading}
                                    />

                                    <TextField
                                        fullWidth
                                        name="confirmPassword"
                                        label="تأكيد كلمة المرور"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock color="action" />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{ mb: 3 }}
                                        required
                                        disabled={loading}
                                    />

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={loading}
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
                                            'تحديث كلمة المرور'
                                        )}
                                    </Button>
                                </form>
                            )}

                            {!success && (
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
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </Box>
    );
};

export default ResetPassword;
