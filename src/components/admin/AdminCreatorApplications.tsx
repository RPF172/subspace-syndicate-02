
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  X, 
  Eye, 
  AlertCircle 
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ApplicationDetailsModal } from './ApplicationDetailsModal';

// Status badge variant mapping
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'approved':
      return 'default';
    case 'rejected':
      return 'destructive';
    case 'pending':
    default:
      return 'secondary';
  }
};

const AdminCreatorApplications = () => {
  const [page, setPage] = useState(1);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const pageSize = 10;
  const queryClient = useQueryClient();
  
  // Fetch creator applications
  const { data, isLoading } = useQuery({
    queryKey: ['creatorApplications', page],
    queryFn: async () => {
      const startIndex = (page - 1) * pageSize;
      
      // Get total count first
      const { count } = await supabase
        .from('creator_applications')
        .select('*', { count: 'exact', head: true });
      
      // Then get the applications for current page with their applicant names
      const { data: applications, error } = await supabase
        .from('creator_applications')
        .select(`
          *,
          identities!inner(full_name)
        `)
        .order('date_submitted', { ascending: true })
        .range(startIndex, startIndex + pageSize - 1);
      
      if (error) throw error;
      
      return {
        applications,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    }
  });
  
  // Mutation to update application status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('creator_applications')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      return { id, status };
    },
    onSuccess: (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['creatorApplications'] });
      
      // Show toast
      toast({
        title: `Application ${variables.status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `Successfully ${variables.status === 'approved' ? 'approved' : 'rejected'} the creator application.`,
        variant: variables.status === 'approved' ? 'default' : 'destructive',
      });
    },
    onError: (error) => {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to update application status.",
        variant: "destructive",
      });
    }
  });
  
  const handleStatusChange = (id: string, status: 'approved' | 'rejected') => {
    if (window.confirm(`Are you sure you want to ${status} this application?`)) {
      updateStatusMutation.mutate({ id, status });
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Creator Applications</CardTitle>
          <CardDescription>Loading applications...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data?.applications || data.applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Creator Applications</CardTitle>
          <CardDescription>Manage creator applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Applications Found</h3>
            <p className="text-muted-foreground mt-2">
              There are currently no creator applications to review.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Creator Applications</CardTitle>
          <CardDescription>
            Review and manage creator applications. Displaying {data.applications.length} of {data.totalCount} applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.applications.map((application, index) => (
                <TableRow key={application.id}>
                  <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
                  <TableCell>{application.identities?.full_name}</TableCell>
                  <TableCell>
                    {format(new Date(application.date_submitted), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(application.status)}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {application.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-500 hover:bg-green-500/10 text-green-500"
                            onClick={() => handleStatusChange(application.id, 'approved')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 hover:bg-red-500/10 text-red-500"
                            onClick={() => handleStatusChange(application.id, 'rejected')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedApplicationId(application.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                </PaginationItem>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setPage(pageNum)}
                      isActive={pageNum === page}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                  >
                    Next
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        isOpen={!!selectedApplicationId}
        onClose={() => setSelectedApplicationId(null)}
        applicationId={selectedApplicationId || ''}
      />
    </>
  );
};

export default AdminCreatorApplications;
