import React from 'react';
import { Grid, Box, Skeleton, Card, CardContent } from '@mui/material';

const SkeletonLoader = ({ count = 4, xs = 12, sm = 6, md = 3 }) => {
    return (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
            {Array.from({ length: count }).map((_, index) => (
                <Grid item xs={xs} sm={sm} md={md} key={index}>
                    <Card sx={{ height: '100%', borderRadius: 3 }}>
                        <Skeleton variant="rectangular" height={300} animation="wave" />
                        <CardContent>
                            <Skeleton variant="text" width="60%" animation="wave" />
                            <Skeleton variant="text" height={32} animation="wave" />
                            <Skeleton variant="text" width="40%" animation="wave" />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Skeleton variant="circular" width={30} height={30} animation="wave" />
                                <Skeleton variant="text" width="30%" animation="wave" />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default SkeletonLoader;
