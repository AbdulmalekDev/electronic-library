import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Home, Search, AutoStories } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <Box
      sx={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 6, md: 10 },
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at center, #16171D 0%, #0F1014 100%)'
            : 'radial-gradient(circle at center, #EBF3FA 0%, #F8F9FA 100%)'
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 10px 40px rgba(0,0,0,0.5)'
                  : '0 10px 40px rgba(0,98,209,0.08)'
            }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  mb: 3,
                  boxShadow: '0 8px 24px rgba(30, 58, 138, 0.3)'
                }}
              >
                <AutoStories sx={{ fontSize: 52 }} />
              </Box>
            </motion.div>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '4rem', sm: '6rem' },
                fontWeight: 900,
                lineHeight: 1,
                color: 'primary.main',
                mb: 1,
                letterSpacing: 2
              }}
            >
              404
            </Typography>

            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '1.5rem', sm: '2rem' },
                color: 'text.primary'
              }}
            >
              الصفحة غير موجودة
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, lineHeight: 1.7, fontSize: '1rem' }}
            >
              عذراً، يبدو أن الصفحة التي تبحث عنها قد تم نقلها أو حذفها أو أن الرابط الذي اتبعته غير صحيح.
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'center'
              }}
            >
              <Button
                component={RouterLink}
                to="/"
                variant="contained"
                size="large"
                startIcon={<Home />}
                sx={{
                  py: 1.4,
                  px: 3,
                  fontWeight: 700,
                  borderRadius: 2.5
                }}
              >
                العودة للرئيسية
              </Button>
              <Button
                component={RouterLink}
                to="/books"
                variant="outlined"
                size="large"
                startIcon={<Search />}
                sx={{
                  py: 1.4,
                  px: 3,
                  fontWeight: 700,
                  borderRadius: 2.5
                }}
              >
                تصفح الكتب
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default NotFound;
