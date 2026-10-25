import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Button } from '@mui/material';
import { NewReleases } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import bookService from '../../services/bookService';
import BookCard from './BookCard';
import SkeletonLoader from './SkeletonLoader';

const NewArrivalsSection = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewest = async () => {
            try {
                const response = await bookService.getAllBooks({ sort: 'newest', limit: 8 });
                setBooks(response.data?.data?.books || []);
            } catch (error) {
                console.error('Error fetching new arrivals:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNewest();
    }, []);

    if (!loading && books.length === 0) return null;

    return (
        <Box sx={{ bgcolor: 'rgba(0,0,0,0.02)', py: { xs: 6, md: 10 }, mb: { xs: 6, md: 10 } }}>
            <Container maxWidth="lg">
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
                    <NewReleases sx={{ fontSize: { xs: 32, md: 40 }, color: 'primary.main' }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.125rem' } }}>
                            وصل حديثاً
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            اكتشف أحدث العناوين التي تمت إضافتها للمكتبة
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

                <Box sx={{ textAlign: 'center', mt: 6 }}>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/books?sort=newest')}
                        sx={{ borderRadius: 3, px: 6 }}
                    >
                        استكشف المزيد من الكتب الجديدة
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default NewArrivalsSection;
