import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Shield, SwitchCamera, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  created_at: string;
  user_id: string;
}

const VideoPage = () => {
  const { id } = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchVideo(id);
    }
  }, [id]);

  const fetchVideo = async (videoId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setVideo(data);
      } else {
        toast({
          title: 'Video Not Found',
          description: 'The requested video could not be found.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-white mb-4">Video Not Found</h1>
            <p className="text-white/70 mb-6">The requested video could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout pageTitle={video.title}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-black/30 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">{video.title}</CardTitle>
            <CardDescription className="text-white/70">Uploaded on {new Date(video.created_at).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <video controls className="w-full h-full object-cover">
                <source src={video.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <Separator className="bg-white/10 my-4" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">Description</h3>
              <p className="text-white/70">{video.description}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AuthenticatedLayout>
  );
};

export default VideoPage;
