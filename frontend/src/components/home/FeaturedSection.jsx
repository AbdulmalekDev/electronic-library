import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import bookService from '../../services/bookService';
import BookCard from './BookCard';
import SkeletonLoader from './SkeletonLoader';

const FeaturedSection = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const response = await bookService.getAllBooks({ featured: true, limit: 8 });
                setBooks(response.data?.data?.books || []);
            } catch (error) {
                console.error('Error fetching featured books:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    if (!loading && books.length === 0) return null;

    return (
        <Container maxWidth="lg" sx={{ mb: { xs: 6, md: 10 } }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'center', md: 'center' },
                    mb: 4,
                    textAlign: { xs: 'center', md: 'right' },
                    gap: { xs: 2, md: 0 }
                }}
            >
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, fontSize: { xs: '1.8rem', md: '2.125rem' } }}>
                        الكتب المميزة
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        مجموعة مختارة بعناية من أفضل ما لدينا
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/books?featured=true')}
                    sx={{ fontWeight: 'bold', borderRadius: 2 }}
                >
                    عرض الكل
                </Button>
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

export default FeaturedSection;
