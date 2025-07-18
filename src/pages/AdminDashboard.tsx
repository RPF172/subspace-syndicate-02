
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminVerification } from '@/hooks/useAdminVerification';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import AdminCreatorApplications from '@/components/admin/AdminCreatorApplications';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading, error } = useAdminVerification();
  
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
  
  // If not authenticated or admin verification failed, redirect
  if (!user || error || !isAdmin) {
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
