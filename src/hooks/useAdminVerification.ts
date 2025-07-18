import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminVerification = () => {
  const { user, session } = useAuth();

  return useQuery({
    queryKey: ['adminVerification', user?.id],
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No access token');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Admin verification failed');
      }

      const data = await response.json();
      return data.isAdmin;
    },
    enabled: !!user?.id && !!session?.access_token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};