import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
  return (
    <section className="min-h-screen relative flex items-center justify-center overflow-hidden pb-20 pt-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-abyss to-abyss/95 z-0"></div>
      
      {/* Animated particles */}
      <Particles />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-4"
          >
            <motion.div 
              className="flex justify-center mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img src="/logo.svg" alt="SubSpace Logo" className="w-32 h-auto" />
            </motion.div>
            
            <div className="inline-block glass px-3 py-1 rounded-full mb-6">
              <span className="text-white/80 text-sm font-medium">Invite-Only Access</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              <span className="block">Unleash.</span>
              <span className="block delay-200">Connect.</span>
              <span className="text-[#E9C846] block delay-400">Dominate.</span>
            </h1>
            
            <motion.p 
              className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              The next generation of fetish social networking and creator monetization. 
              Where desire meets technology, boundaries dissolve, and power is reclaimed.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button className="bg-[#E9C846] hover:bg-[#E9C846]/90 text-black w-full sm:w-auto px-8 py-6 rounded-md text-lg">
              Request Invitation
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 w-full sm:w-auto px-8 py-6 rounded-md text-lg">
              Learn More
            </Button>
          </motion.div>
        </div>

        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <a href="#about" className="text-white/50 hover:text-white transition-colors">
            <ChevronDown className="animate-pulse w-8 h-8" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

const Particles = () => {
  // Create an array of 20 particles
  const particles = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <div className="absolute inset-0 z-0">
      {particles.map((_, i) => {
        // Random values for each particle
        const size = Math.random() * 4 + 1;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#E9C846]/20"
            style={{
              width: size + 'px',
              height: size + 'px',
              left: left + '%',
              top: top + '%',
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
};

export default Hero;
