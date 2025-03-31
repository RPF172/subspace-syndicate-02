import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Search, Heart, Shield, AlertCircle } from 'lucide-react';

const AboutTab: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  
  useEffect(() => {
    if (user?.id) {
      const fetchProfileData = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          setProfileData(data);
        }
      };
      
      fetchProfileData();
    }
  }, [user]);

  const bio = profileData?.bio || user?.user_metadata?.bio;
  const lookingFor = profileData?.looking_for || 'Not specified';
  const kinks = profileData?.kinks || 'Not specified';
  const softLimits = profileData?.soft_limits || 'Not specified';
  const hardLimits = profileData?.hard_limits || 'Not specified';

  return (
    <div className="space-y-6">
      {/* Bio Section */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Bio</CardTitle>
        </CardHeader>
        <CardContent className="text-white/80">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-crimson shrink-0 mt-1" />
            <p className="whitespace-pre-wrap">{bio || 'No bio information provided yet.'}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Looking For */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Looking For</CardTitle>
        </CardHeader>
        <CardContent className="text-white/80">
          <div className="flex items-start gap-3">
            <Search className="h-5 w-5 text-crimson shrink-0 mt-1" />
            <p className="whitespace-pre-wrap">{lookingFor}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Kinks/Fetishes */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Kinks/Fetishes</CardTitle>
        </CardHeader>
        <CardContent className="text-white/80">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-crimson shrink-0 mt-1" />
            <p className="whitespace-pre-wrap">{kinks}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Soft Limits */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Soft Limits</CardTitle>
        </CardHeader>
        <CardContent className="text-white/80">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-crimson shrink-0 mt-1" />
            <p className="whitespace-pre-wrap">{softLimits}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Hard Limits */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Hard Limits</CardTitle>
        </CardHeader>
        <CardContent className="text-white/80">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-crimson shrink-0 mt-1" />
            <p className="whitespace-pre-wrap">{hardLimits}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutTab;
