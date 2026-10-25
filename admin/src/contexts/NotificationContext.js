import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Snackbar, Box, Typography, IconButton, Slide } from '@mui/material';
import { MdClose, MdCheckCircle, MdError, MdInfo } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

const NotificationContext = createContext();

// Define Transition Components outside to prevent remounting/shaking
const SlideTransitionRight = (props) => <Slide {...props} direction="right" />;
const SlideTransitionLeft = (props) => <Slide {...props} direction="left" />;

export const NotificationProvider = ({ children }) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const [notification, setNotification] = useState({
        open: false,
        message: '',
        type: 'info', // success, error, info
    });

    const [notificationsList, setNotificationsList] = useState([]);

    const fetchNotifications = useCallback(async () => {
        try {
            const { notificationService } = await import('../services/notificationService');
            const res = await notificationService.getBorrowNotifications();
            if (res.data?.success) {
                setNotificationsList(res.data.data.notifications);
            }
        } catch (error) {
            if (error?.response?.status !== 401) {
                console.error("Failed to fetch notifications:", error);
            }
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const unreadCount = useMemo(() => 
        notificationsList.filter(n => !n.read).length
    , [notificationsList]);

    const addToList = useCallback((message, type) => {
        const newNotification = {
            id: Date.now(),
            message,
            type,
            read: false,
            createdAt: new Date().toISOString()
        };
        setNotificationsList(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
    }, []);

    const showNotification = useCallback((message, type, persist = false) => {
        setNotification({ open: true, message, type });
        if (persist) {
            addToList(message, type);
        }
    }, [addToList]);

    const showSuccess = useCallback((message, persist = false) => showNotification(message, 'success', persist), [showNotification]);
    
    const showError = useCallback((msg, persist = false) => {
        // Handle both string and error objects
        const message = typeof msg === 'string' ? msg : (msg.response?.data?.message || msg.message || 'حدث خطأ غير متوقع');
        showNotification(message, 'error', persist);
    }, [showNotification]);
    
    const showInfo = useCallback((message, persist = false) => showNotification(message, 'info', persist), [showNotification]);

    const handleClose = useCallback((event, reason) => {
        if (reason === 'clickaway') return;
        setNotification(prev => ({ ...prev, open: false }));
    }, []);

    const markAsRead = useCallback(async (id) => {
        try {
            const { notificationService } = await import('../services/notificationService');
            await notificationService.markAsRead(id);
            setNotificationsList(prev => prev.map(n => 
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const { notificationService } = await import('../services/notificationService');
            await notificationService.markAllAsRead();
            setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    }, []);

    const deleteNotification = useCallback((id) => {
        setNotificationsList(prev => prev.filter(n => n.id !== id));
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <MdCheckCircle style={{ fontSize: '24px' }} />;
            case 'error': return <MdError style={{ fontSize: '24px' }} />;
            default: return <MdInfo style={{ fontSize: '24px' }} />;
        }
    };

    const getColors = (type) => {
        switch (type) {
            case 'success': return { bg: '#2e7d32', border: '#1b5e20' };
            case 'error': return { bg: '#d32f2f', border: '#b71c1c' };
            default: return { bg: '#0288d1', border: '#01579b' };
        }
    };

    const colors = getColors(notification.type);

    const contextValue = useMemo(() => ({
        showSuccess, showError, showInfo, 
        notificationsList, unreadCount,
        markAsRead, markAllAsRead, deleteNotification 
    }), [showSuccess, showError, showInfo, notificationsList, unreadCount, markAsRead, markAllAsRead, deleteNotification]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{ 
                    vertical: 'bottom', 
                    horizontal: isRTL ? 'right' : 'left' 
                }}
                TransitionComponent={isRTL ? SlideTransitionRight : SlideTransitionLeft}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        backgroundColor: colors.bg,
                        color: '#fff',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        minWidth: '300px',
                        maxWidth: '450px',
                        borderRight: isRTL ? `6px solid ${colors.border}` : 'none',
                        borderLeft: !isRTL ? `6px solid ${colors.border}` : 'none',
                        transition: 'transform 0.2s',
                        '&:hover': {
                            transform: 'scale(1.02)'
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getIcon(notification.type)}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
                            {notification.message}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}>
                        <MdClose fontSize="small" />
                    </IconButton>
                </Box>
            </Snackbar>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);