import React, { useRef } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

// Import Home Components
import HeroSection from '../components/home/HeroSection';
import SearchSection from '../components/home/SearchSection';
import FeaturedSection from '../components/home/FeaturedSection';
import NewArrivalsSection from '../components/home/NewArrivalsSection';
import TopRatedSection from '../components/home/TopRatedSection';
import MostViewedSection from '../components/home/MostViewedSection';
import CategoriesSection from '../components/home/CategoriesSection';
import NewsSection from '../components/home/NewsSection';
import StatsSection from '../components/home/StatsSection';
import CTASection from '../components/home/CTASection';

const Home = () => {
  const searchRef = useRef(null);

  const scrollToSearch = () => {
    searchRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 1. Hero Section */}
      <HeroSection onBrowseClick={scrollToSearch} />

      {/* 2. Advanced Search Section */}
      <Box ref={searchRef}>
        <SearchSection />
      </Box>

      {/* 3. Featured Books Section */}
      <FeaturedSection />

      {/* 4. New Arrivals Section */}
      <NewArrivalsSection />

      {/* 5. Top Rated & Most Viewed Sections */}
      <TopRatedSection />
      <MostViewedSection />

      {/* 6. Categories Section */}
      <CategoriesSection />

      {/* 7. News Section */}
      <NewsSection />

      {/* 8. Stats Section */}
      <StatsSection />

      {/* 9. CTA Section */}
      <CTASection />
    </motion.div>
  );
};

export default Home;