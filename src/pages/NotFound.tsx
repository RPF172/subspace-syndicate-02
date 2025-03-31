
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-abyss px-4"
    >
      <div className="text-center max-w-md">
        <div className="mb-6">
          <img src="/logo.svg" alt="SubSpace Logo" className="h-16 w-auto mx-auto mb-4" />
        </div>
        <div className="glass px-3 py-1 rounded-full inline-block mb-6">
          <span className="text-white/80 text-sm font-medium">404 Error</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Page Not Found</h1>
        <p className="text-white/70 text-lg mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button 
          asChild 
          className="bg-[#E9C846] hover:bg-[#E9C846]/90 text-black px-8 py-6 rounded-md text-lg"
        >
          <a href="/">Return to Home</a>
        </Button>
      </div>
      
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-abyss via-abyss/95 to-abyss z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl">
        <div className="absolute inset-0 bg-[#E9C846]/10 rounded-full blur-[150px]"></div>
      </div>
    </motion.div>
  );
};

export default NotFound;
