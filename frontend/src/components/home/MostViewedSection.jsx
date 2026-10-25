import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Button } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import bookService from '../../services/bookService';
import BookCard from './BookCard';
import SkeletonLoader from './SkeletonLoader';

const MostViewedSection = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMostViewed = async () => {
            try {
                const response = await bookService.getAllBooks({ sort: 'views', limit: 8 });
                setBooks(response.data?.data?.books || []);
            } catch (error) {
                console.error('Error fetching most viewed books:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMostViewed();
    }, []);

    if (!loading && books.length === 0) return null;

    return (
        <Container maxWidth="lg" sx={{ mb: 10 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
                <TrendingUp sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                        الأكثر قراءة
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        العناوين الأكثر شهرة وبحثاً في مكتبتنا
                    </Typography>
                </Box>
            </Box>

            {loading ? (
                <SkeletonLoader count={4} md={3} />
            ) : (
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                    {books.map((book) => (
                        <Grid item xs={12} sm={6} md={3} key={book._id}>
                            <BookCard book={book} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default MostViewedSection;
