
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import VideoUploadForm from '@/components/video/VideoUploadForm';
import { Card } from '@/components/ui/card';
import { createPortal } from 'react-dom';

// Create a storage bucket for videos if it doesn't exist
// This would normally be done in a SQL migration
import { supabase, ensureBucketExists } from '@/integrations/supabase/client';

// Check if the videos storage bucket exists
const checkStorageBucket = async () => {
  try {
    const bucketExists = await ensureBucketExists('videos');
    
    if (!bucketExists) {
      console.log("Videos bucket doesn't exist. Video uploads may not work.");
    } else {
      console.log("Videos bucket exists");
    }
  } catch (error) {
    console.error("Error checking videos bucket:", error);
  }
};

const SubSpaceTVUpload = () => {
  const { user } = useAuth();
  
  React.useEffect(() => {
    // Check if the storage bucket exists when the component mounts
    checkStorageBucket();
  }, []);

  return (
    <AuthenticatedLayout pageTitle="SubSpaceTV - Upload">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Upload Video</h1>
        <Card className="bg-black/20 border-white/10 backdrop-blur-md p-6 mb-6">
          <VideoUploadForm />
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

export default SubSpaceTVUpload;
