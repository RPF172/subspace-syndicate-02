
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import VideosList from '@/components/video/VideosList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Upload, FolderOpen, Film } from 'lucide-react';

const SubSpaceTVBrowse = () => {
  const { user } = useAuth();

  return (
    <AuthenticatedLayout pageTitle="SubSpaceTV - Browse">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Film className="h-6 w-6 text-crimson mr-2" />
            <h1 className="text-3xl font-bold text-white">Browse Videos</h1>
          </div>
          <div className="flex space-x-2">
            <Link to="/subspacetv/my-content">
              <Button variant="outline" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                My Content
              </Button>
            </Link>
            <Link to="/subspacetv/upload">
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Video
              </Button>
            </Link>
          </div>
        </div>
        <VideosList />
      </div>
    </AuthenticatedLayout>
  );
};

export default SubSpaceTVBrowse;
