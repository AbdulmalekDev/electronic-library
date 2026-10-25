import React, { useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from "../../App";
import { FaBell, FaCheckDouble, FaTrash, FaCheckCircle, FaExclamationCircle, FaBook, FaUser, FaClock, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import { useNotification } from '../../contexts/NotificationContext';
import { Box, Card, Typography, IconButton, Badge, Chip, Stack, Tooltip } from '@mui/material';

const Notifications = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ar';
    const context = useContext(MyContext);
    const { notificationsList, markAllAsRead, markAsRead, deleteNotification } = useNotification();

    const getStatusConfig = (type) => {
        switch (type) {
            case 'pending':
                return {
                    color: '#ed6c02', // Warning Orange
                    bgColor: 'rgba(237, 108, 2, 0.1)',
                    icon: <FaBell />,
                    label: t("Borrows.status_pending") || "Pending"
                };
            case 'near_expiry':
                return {
                    color: '#ff9800', // Warning Yellow/Orange
                    bgColor: 'rgba(255, 152, 0, 0.1)',
                    icon: <FaClock />,
                    label: t("Notifications.due_soon") || "Due Soon"
                };
            case 'overdue':
                return {
                    color: '#d32f2f', // Danger Red
                    bgColor: 'rgba(211, 47, 47, 0.1)',
                    icon: <FaExclamationCircle />,
                    label: t("Borrows.status_overdue")
                };
            case 'returned':
                return {
                    color: '#2e7d32', // Success Green
                    bgColor: 'rgba(46, 125, 50, 0.1)',
                    icon: <FaCheckCircle />,
                    label: t("Borrows.status_returned")
                };
            case 'borrowed':
                return {
                    color: '#1976d2', // Primary Blue
                    bgColor: 'rgba(25, 118, 210, 0.1)',
                    icon: <FaBook />,
                    label: t("Borrows.status_borrowed")
                };
            default:
                return {
                    color: '#757575',
                    bgColor: 'rgba(117, 117, 117, 0.1)',
                    icon: <FaBell />,
                    label: t("Notifications.status_new")
                };
        }
    };

    const getTimeAgo = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return isRTL ? "الآن" : "Just now";
        if (seconds < 3600) {
            const min = Math.floor(seconds / 60);
            return isRTL ? `منذ ${min} دقيقة` : `${min}m ago`;
        }
        if (seconds < 86400) {
            const hours = Math.floor(seconds / 3600);
            return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
        }
        return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US');
    };

    const handleMarkAll = (e) => {
        e.stopPropagation();
        markAllAsRead();
    };

    return (
        <Box className="right-content w-100" sx={{ 
            pt: { xs: '85px', md: '100px' }, 
            px: { xs: 2, md: 4 },
            pb: 4
        }}>
            {/* Header Section */}
            <Card className="shadow-sm border-0 w-100 p-4 mb-4" sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: 2,
                borderRadius: '15px'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '12px', 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        display: 'flex'
                    }}>
                        <FaBell size={20} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {t("Notifications.title")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {`${notificationsList.length} ${isRTL ? 'إجمالي التنبيهات' : 'total alerts'}`}
                        </Typography>
                    </Box>
                </Box>
                
                <button 
                    className="btn btn-primary d-flex align-items-center gap-2 shadow-sm rounded-pill px-4 py-2" 
                    onClick={handleMarkAll} 
                    disabled={notificationsList.length === 0 || notificationsList.every(n => n.read)}
                >
                    <FaCheckDouble /> {t("Notifications.mark_all_read")}
                </button>
            </Card>

            {/* Notifications List */}
            <Stack spacing={2}>
                {notificationsList.length > 0 ? (
                    notificationsList.map(item => {
                        const status = getStatusConfig(item.type);
                        return (
                            <Card 
                                key={item.id}
                                onClick={() => !item.read && markAsRead(item.id)}
                                sx={{ 
                                    p: 0,
                                    borderRadius: '15px',
                                    border: '1px solid',
                                    borderColor: item.read ? 'divider' : 'primary.light',
                                    bgcolor: item.read ? 'background.paper' : 'rgba(25, 118, 210, 0.02)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                                    },
                                    position: 'relative'
                                }}
                            >
                                {!item.read && (
                                    <Box sx={{ 
                                        position: 'absolute', 
                                        top: 0, 
                                        [isRTL ? 'right' : 'left']: 0, 
                                        width: '4px', 
                                        height: '100%', 
                                        bgcolor: 'primary.main',
                                        borderTopLeftRadius: isRTL ? 0 : '15px',
                                        borderBottomLeftRadius: isRTL ? 0 : '15px',
                                        borderTopRightRadius: isRTL ? '15px' : 0,
                                        borderBottomRightRadius: isRTL ? '15px' : 0
                                    }} />
                                )}

                                <Box sx={{ p: 3, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                    {/* Icon Box */}
                                    <Box sx={{ position: 'relative' }}>
                                        <Box sx={{ 
                                            minWidth: 50, 
                                            height: 50, 
                                            borderRadius: '50%', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            bgcolor: status.bgColor,
                                            color: status.color,
                                            fontSize: '20px'
                                        }}>
                                            {status.icon}
                                        </Box>
                                        {!item.read && (
                                            <Box sx={{ 
                                                position: 'absolute', 
                                                top: 0, 
                                                right: 0, 
                                                width: 12, 
                                                height: 12, 
                                                bgcolor: '#f44336', 
                                                borderRadius: '50%', 
                                                border: '2px solid white' 
                                            }} />
                                        )}
                                    </Box>

                                    {/* Content */}
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                            <Chip 
                                                label={status.label} 
                                                size="small" 
                                                sx={{ 
                                                    height: 20, 
                                                    fontSize: '0.65rem', 
                                                    fontWeight: 700,
                                                    bgcolor: status.bgColor,
                                                    color: status.color,
                                                    border: `1px solid ${status.color}33`
                                                }} 
                                            />
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '12px' }}>
                                                <FaClock size={12} />
                                                {getTimeAgo(item.createdAt)}
                                            </Box>
                                        </Box>

                                        <Typography variant="body1" sx={{ fontWeight: item.read ? 500 : 700, mb: 1, lineHeight: 1.5, textAlign: 'start' }}>
                                            {item.type === 'pending' && t("Notifications.pending_msg", { userName: item.userName, bookTitle: item.bookTitle })}
                                            {item.type === 'near_expiry' && t("Notifications.near_expiry_msg", { userName: item.userName, bookTitle: item.bookTitle })}
                                            {item.type === 'borrowed' && t("Notifications.borrowed_msg", { userName: item.userName, bookTitle: item.bookTitle })}
                                            {item.type === 'overdue' && t("Notifications.late_msg", { userName: item.userName, bookTitle: item.bookTitle })}
                                            {item.type === 'returned' && t("Notifications.returned_msg", { userName: item.userName, bookTitle: item.bookTitle })}
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                            {!item.read && (
                                                <Tooltip title={t("Notifications.mark_as_read")}>
                                                    <IconButton 
                                                        size="small" 
                                                        color="success"
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            markAsRead(item.id); 
                                                        }}
                                                        sx={{ bgcolor: 'rgba(46, 125, 50, 0.1)', '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.2)' } }}
                                                    >
                                                        <FaCheckCircle size={14} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title={t("BookDetails.title")}>
                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); if(!item.read) markAsRead(item.id); navigate(`/books/${item.bookId}`); }}>
                                                    <FaBook size={14} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t("Users.title") || "Member Details"}>
                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); if(!item.read) markAsRead(item.id); navigate(`/users/${item.userId}`); }}>
                                                    <FaUser size={14} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>

                                    {/* Actions */}
                                    <Tooltip title={t("Common.delete") || "Delete"}>
                                        <IconButton 
                                            size="small" 
                                            color="error"
                                            onClick={(e) => { e.stopPropagation(); deleteNotification(item.id); }}
                                            sx={{ opacity: 0.2, '&:hover': { opacity: 1 } }}
                                        >
                                            <FaTrash size={14} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Card>
                        );
                    })
                ) : (
                    <Card sx={{ 
                        p: 8, 
                        textAlign: 'center', 
                        borderRadius: '15px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <Box sx={{ 
                            p: 3, 
                            borderRadius: '50%', 
                            bgcolor: 'rgba(0,0,0,0.03)',
                            color: 'text.secondary',
                            mb: 2
                        }}>
                            <FaBell size={60} opacity={0.2} />
                        </Box>
                        <Typography variant="h6" fontWeight={700}>
                            {t("Notifications.no_new_notifications")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {isRTL ? 'ستظهر تنبيهات الاستعارة الجديدة هنا فور حدوثها.' : 'New borrow alerts will appear here as they happen.'}
                        </Typography>
                    </Card>
                )}
            </Stack>
        </Box>
    );
};

export default Notifications;

