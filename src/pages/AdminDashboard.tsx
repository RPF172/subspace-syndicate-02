
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import AdminCreatorApplications from '@/components/admin/AdminCreatorApplications';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  
  // Check if the user is an admin
  const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      return data?.is_admin || false;
    },
    enabled: !!user?.id && !loading,
  });
  
  // If loading, show a loading indicator
  if (loading || isAdminLoading) {
    return (
      <AuthenticatedLayout pageTitle="Admin Dashboard">
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  // If not admin, redirect to dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <AuthenticatedLayout pageTitle="Admin Dashboard">
      <div className="space-y-6">
        <AdminCreatorApplications />
      </div>
    </AuthenticatedLayout>
  );
};

export default AdminDashboard;
