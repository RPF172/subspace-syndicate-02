import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Eye, Clock, Trash2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

type VideoData = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
  category: string;
  tags: string | null;
  duration: number | null;
  status: string;
  visibility: string;
};

const SubSpaceTVMyContent = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['my-videos', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as VideoData[];
    },
  });

  const totalPages = videos ? Math.ceil(videos.length / itemsPerPage) : 0;
  const paginatedVideos = videos ? videos.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  ) : [];

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'ready': return "dominant";
      case 'processing': return "exploring";
      case 'failed': return "destructive";
      default: return "secondary";
    }
  };

  const getVisibilityBadgeVariant = (visibility: string) => {
    switch(visibility) {
      case 'public': return "default";
      case 'unlisted': return "outline";
      case 'private': return "secondary";
      default: return "outline";
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout pageTitle="SubSpaceTV - My Content">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-white">My Videos</h1>
          <Card className="bg-black/20 border-white/10 backdrop-blur-md">
            <CardContent className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-crimson"></div>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout pageTitle="SubSpaceTV - My Content">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-white">My Videos</h1>
          <Card className="bg-black/20 border-white/10 backdrop-blur-md">
            <CardContent className="flex justify-center py-8 text-white/70">
              <p>Error loading videos. Please try again later.</p>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <AuthenticatedLayout pageTitle="SubSpaceTV - My Content">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-white">My Videos</h1>
          <div className="flex justify-between items-center mb-6">
            <p className="text-white/70">You haven't uploaded any videos yet.</p>
            <Link to="/subspacetv/upload">
              <Button>Upload New Video</Button>
            </Link>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout pageTitle="SubSpaceTV - My Content">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">My Videos</h1>
          <Link to="/subspacetv/upload">
            <Button>Upload New Video</Button>
          </Link>
        </div>
        
        <Card className="bg-black/20 border-white/10 backdrop-blur-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-white/90">
              <thead className="bg-black/40 text-white/70">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Visibility</th>
                  <th className="px-4 py-3 text-left">Uploaded</th>
                  <th className="px-4 py-3 text-left">Duration</th>
                  <th className="px-4 py-3 text-left">Views</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVideos.map((video) => (
                  <tr key={video.id} className="border-t border-white/10 hover:bg-black/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-9 bg-black/40 overflow-hidden rounded">
                          {video.thumbnail_url ? (
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-white/30">
                              No thumbnail
                            </div>
                          )}
                        </div>
                        <span className="font-medium line-clamp-1">{video.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusBadgeVariant(video.status)}>
                        {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getVisibilityBadgeVariant(video.visibility)}>
                        {video.visibility.charAt(0).toUpperCase() + video.visibility.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">
                      {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(video.duration)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {video.views}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {video.status === 'ready' && (
                          <Link to={`/subspacetv/watch/${video.id}`}>
                            <Button variant="ghost" size="icon" title="View">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Button variant="ghost" size="icon" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {totalPages > 1 && (
          <Pagination className="mb-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(currentPage - 1)} 
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                >
                  <ChevronLeft className="h-4 w-4" />
                </PaginationPrevious>
              </PaginationItem>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    onClick={() => setCurrentPage(i + 1)} 
                    isActive={currentPage === i + 1}
                    size="sm"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(currentPage + 1)} 
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                >
                  <ChevronRight className="h-4 w-4" />
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default SubSpaceTVMyContent;
