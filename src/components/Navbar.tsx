
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Function to handle link clicks in mobile menu
  const handleMobileMenuClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300',
        isScrolled ? 'glass shadow-md py-3' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Logo />
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#about" className="text-white/90 hover:text-white transition-colors text-sm font-medium">
            About
          </a>
          <a href="#features" className="text-white/90 hover:text-white transition-colors text-sm font-medium">
            Features
          </a>
          <a href="#creators" className="text-white/90 hover:text-white transition-colors text-sm font-medium">
            Creators
          </a>
          <Link to="/community" className="text-white/90 hover:text-white transition-colors text-sm font-medium">
            Community
          </Link>
          <Link to="/dashboard" className="text-white/90 hover:text-white transition-colors text-sm font-medium">
            Dashboard
          </Link>
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/auth">
            <Button variant="ghost" className="text-white hover:text-crimson transition-colors">
              Login
            </Button>
          </Link>
          <Button className="bg-crimson hover:bg-crimson/90 text-white">
            Get Invited
          </Button>
        </div>
        
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden glass shadow-md"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <a 
              href="#about"
              className="text-white hover:text-crimson py-2 transition-colors"
              onClick={handleMobileMenuClick}
            >
              About
            </a>
            <a 
              href="#features"
              className="text-white hover:text-crimson py-2 transition-colors"
              onClick={handleMobileMenuClick}
            >
              Features
            </a>
            <a 
              href="#creators"
              className="text-white hover:text-crimson py-2 transition-colors"
              onClick={handleMobileMenuClick}
            >
              Creators
            </a>
            {/* Use <div> wrapper for Link with onClick */}
            <div onClick={handleMobileMenuClick}>
              <Link 
                to="/community"
                className="text-white hover:text-crimson py-2 transition-colors block"
              >
                Community
              </Link>
            </div>
            <div onClick={handleMobileMenuClick}>
              <Link 
                to="/dashboard"
                className="text-white hover:text-crimson py-2 transition-colors block"
              >
                Dashboard
              </Link>
            </div>
            <div className="flex flex-col space-y-2 pt-2 border-t border-white/10">
              <Link to="/auth">
                <Button variant="ghost" className="text-white hover:text-crimson justify-start">
                  Login
                </Button>
              </Link>
              <Button className="bg-crimson hover:bg-crimson/90 text-white w-full">
                Get Invited
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

const Logo = () => (
  <motion.div 
    className="text-2xl font-bold text-white flex items-center gap-2"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <img src="/logo.svg" alt="SubSpace Logo" className="h-7 w-auto" />
    <span className="text-gradient font-poppins">SubSpace</span>
  </motion.div>
);

export default Navbar;
