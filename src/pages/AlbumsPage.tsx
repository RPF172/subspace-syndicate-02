import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAlbums } from '@/hooks/useAlbums';
import { useNavigate } from 'react-router-dom';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AlbumCard from '@/components/albums/AlbumCard';
import AlbumForm from '@/components/albums/AlbumForm';
import { Plus, Search, Filter } from 'lucide-react';
import { AlbumPrivacy } from '@/types/albums';

const AlbumsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { albums, isLoadingAlbums, loading, createAlbum } = useAlbums();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState<string>('all');
  
  const handleCreateAlbum = async (values: {
    title: string;
    description?: string;
    privacy: AlbumPrivacy;
    tags?: string[];
    coverImage?: File;
  }) => {
    const album = await createAlbum(values);
    if (album) {
      setIsCreateDialogOpen(false);
      // Navigate to the newly created album
      navigate(`/albums/${album.id}`);
    }
  };
  
  // Filter albums based on search query and privacy filter
  const filteredAlbums = albums?.filter(album => {
    const matchesSearch = album.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrivacy = privacyFilter === 'all' || album.privacy === privacyFilter;
    return matchesSearch && matchesPrivacy;
  });
  
  return (
    <AuthenticatedLayout>
      <div className="container py-8 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Albums</h1>
            <p className="text-white/70">Organize and showcase your media collections</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Album
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              type="search"
              placeholder="Search albums..."
              className="pl-10 bg-black/30 border-white/20 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={privacyFilter}
              onValueChange={setPrivacyFilter}
            >
              <SelectTrigger className="bg-black/30 border-white/20 text-white">
                <SelectValue placeholder="Filter by privacy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Albums</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="friends-only">Friends Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoadingAlbums ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
          </div>
        ) : albums?.length === 0 ? (
          <div className="text-center py-16 bg-black/20 rounded-lg border border-white/10">
            <h3 className="text-xl font-medium text-white mb-2">No Albums Yet</h3>
            <p className="text-white/70 mb-6">Create your first album to start organizing your media</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Album
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAlbums?.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Create New Album</DialogTitle>
            </DialogHeader>
            <AlbumForm 
              onSubmit={handleCreateAlbum} 
              isLoading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedLayout>
  );
};

export default AlbumsPage;
