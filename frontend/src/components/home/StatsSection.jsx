import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Stack, alpha } from '@mui/material';
import { Book, People, Category, AutoStories } from '@mui/icons-material';
import { useInView } from 'react-intersection-observer';
import bookService from '../../services/bookService';

const Counter = ({ end, duration = 2000, inView }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (inView) {
            let start = 0;
            const increment = end / (duration / 16);
            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start));
                }
            }, 16);
            return () => clearInterval(timer);
        }
    }, [inView, end, duration]);

    return <span>{count.toLocaleString()}</span>;
};

const StatsSection = () => {
    const { ref, inView } = useInView({
        threshold: 0.3,
        triggerOnce: true
    });

    const [stats, setStats] = useState({
        books: 1250,
        users: 850,
        categories: 13,
        borrows: 3420
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const booksRes = await bookService.getAllBooks({ limit: 1 });
                if (booksRes.data?.data?.pagination?.count) {
                    setStats(prev => ({ ...prev, books: booksRes.data.data.pagination.count }));
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, []);

    const statItems = [
        { icon: <Book sx={{ fontSize: 40 }} />, label: 'إجمالي الكتب', value: stats.books },
        { icon: <People sx={{ fontSize: 40 }} />, label: 'المستخدمين', value: stats.users },
        { icon: <Category sx={{ fontSize: 40 }} />, label: 'الفئات', value: stats.categories },
        { icon: <AutoStories sx={{ fontSize: 40 }} />, label: 'عمليات الاستعارة', value: stats.borrows },
    ];

    return (
        <Box
            ref={ref}
            sx={{
                py: { xs: 8, md: 12 },
                mb: { xs: 6, md: 10 },
                background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : alpha(theme.palette.primary.main, 0.03),
                position: 'relative'
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={{ xs: 2, sm: 3, xl: 4 }}>
                    {statItems.map((item, index) => (
                        <Grid item xs={6} md={3} key={index}>
                            <Stack alignItems="center" spacing={2}>
                                <Box
                                    sx={{
                                        width: { xs: 60, md: 80 },
                                        height: { xs: 60, md: 80 },
                                        borderRadius: '50%',
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: (theme) => `0 10px 20px ${alpha(theme.palette.primary.main, 0.2)}`
                                    }}
                                >
                                    {React.cloneElement(item.icon, { sx: { fontSize: { xs: 28, md: 40 } } })}
                                </Box>
                                <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', fontSize: { xs: '1.5rem', md: '3rem' } }}>
                                    <Counter end={item.value} inView={inView} />
                                </Typography>
                                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold', fontSize: { xs: '0.9rem', md: '1.25rem' } }}>
                                    {item.label}
                                </Typography>
                            </Stack>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default StatsSection;
