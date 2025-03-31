
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Search, Heart, Shield, AlertCircle } from 'lucide-react';

interface AboutTabViewProps {
  profile: any;
}

const AboutTabView: React.FC<AboutTabViewProps> = ({ profile }) => {
  const bio = profile?.bio || 'No bio information provided yet.';
  const lookingFor = profile?.looking_for || 'Not specified';
  const kinks = profile?.kinks || 'Not specified';
  const softLimits = profile?.soft_limits || 'Not specified';
  const hardLimits = profile?.hard_limits || 'Not specified';

  return (
    <div className="space-y-6">
      {/* Bio Section */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-crimson shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-crimson mb-2">Bio</h3>
              <p className="text-white/80 whitespace-pre-wrap">{bio}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Looking For */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Search className="h-5 w-5 text-crimson shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-crimson mb-2">Looking For</h3>
              <p className="text-white/80 whitespace-pre-wrap">{lookingFor}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Kinks/Fetishes */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-crimson shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-crimson mb-2">Kinks/Fetishes</h3>
              <p className="text-white/80 whitespace-pre-wrap">{kinks}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Soft Limits */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-crimson shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-crimson mb-2">Soft Limits</h3>
              <p className="text-white/80 whitespace-pre-wrap">{softLimits}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Hard Limits */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-crimson shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-crimson mb-2">Hard Limits</h3>
              <p className="text-white/80 whitespace-pre-wrap">{hardLimits}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutTabView;
