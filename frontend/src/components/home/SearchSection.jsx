import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, InputAdornment, Paper, Grid, MenuItem, Typography, Button } from '@mui/material';
import { Search, Category, Person, Book } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SearchSection = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');

    const categories = [
        { id: 'all', name: 'كل الفئات' },
        { id: 'أدب', name: 'أدب' },
        { id: 'تاريخ', name: 'تاريخ' },
        { id: 'علوم', name: 'علوم' },
        { id: 'تكنولوجيا', name: 'تكنولوجيا' },
        { id: 'دين', name: 'دين' }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (category !== 'all') params.append('category', category);
        navigate(`/books?${params.toString()}`);
    };

    return (
        <Container maxWidth="md" sx={{ mt: { xs: -4, md: -6 }, mb: 8, position: 'relative', zIndex: 10 }}>
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
            >
                <Paper
                    elevation={10}
                    sx={{
                        p: { xs: 3, md: 4 },
                        borderRadius: 4,
                        bgcolor: 'background.paper',
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 3,
                            fontWeight: 'bold',
                            textAlign: { xs: 'center', md: 'right' }
                        }}
                    >
                        ابحث عن كتابك التالي
                    </Typography>
                    <form onSubmit={handleSearch}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={5}>
                                <TextField
                                    fullWidth
                                    placeholder="ابحث بالعنوان أو المؤلف..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search color="primary" />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 3 }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    select
                                    fullWidth
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Category color="primary" />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 3 }
                                    }}
                                >
                                    {categories.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    type="submit"
                                    sx={{
                                        height: '56px',
                                        borderRadius: 3,
                                        fontWeight: 'bold',
                                        fontSize: '1rem'
                                    }}
                                >
                                    بحث سريع
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </motion.div>
        </Container>
    );
};


export default SearchSection;
