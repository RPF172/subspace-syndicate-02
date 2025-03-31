
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Features from '@/components/Features';
import Creators from '@/components/Creators';
import Join from '@/components/Join';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-abyss overflow-x-hidden"
    >
      <Navbar />
      <Hero />
      <About />
      <Features />
      <Creators />
      <Join />
      <Footer />
    </motion.div>
  );
};

export default Index;
