import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Button } from '@mui/material';
import { Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import bookService from '../../services/bookService';
import BookCard from './BookCard';
import SkeletonLoader from './SkeletonLoader';

const TopRatedSection = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopRated = async () => {
            try {
                const response = await bookService.getAllBooks({ sort: 'rating', limit: 8 });
                setBooks(response.data?.data?.books || []);
            } catch (error) {
                console.error('Error fetching top rated books:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTopRated();
    }, []);

    if (!loading && books.length === 0) return null;

    return (
        <Container maxWidth="lg" sx={{ mb: { xs: 6, md: 10 } }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    mb: 5,
                    textAlign: { xs: 'center', md: 'right' },
                    gap: { xs: 1, md: 2 }
                }}
            >
                <Star sx={{ fontSize: { xs: 32, md: 40 }, color: '#ffc107' }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.125rem' } }}>
                        الأعلى تقييماً
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        الكتب المفضلة لدى مجتمع القراء
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

export default TopRatedSection;
