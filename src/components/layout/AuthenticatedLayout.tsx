
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { motion } from 'framer-motion';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  pageTitle?: string;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ 
  children, 
  showSidebar = true,
  pageTitle
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only navigate away if we're done loading and there's no user
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss">
      {showSidebar ? (
        <SidebarProvider defaultOpen={true}>
          <div className="flex w-full">
            <DashboardSidebar />
            
            <SidebarInset className="flex-1">
              <div className="container px-4 py-6">
                {pageTitle && (
                  <div className="flex items-center mb-6">
                    <SidebarTrigger className="mr-2" />
                    <h1 className="text-3xl font-bold text-white">{pageTitle}</h1>
                  </div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {children}
                </motion.div>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      ) : (
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AuthenticatedLayout;
