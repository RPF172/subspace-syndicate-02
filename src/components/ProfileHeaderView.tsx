
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Heart, Lock, Users } from 'lucide-react';
import MessageButton from '@/components/messages/MessageButton';
import FollowButton from '@/components/profile/FollowButton';
import { useFollowCounts } from '@/hooks/useFollowCounts';
import { cn } from '@/lib/utils';

interface ProfileHeaderViewProps {
  profile: {
    id: string;
    username?: string;
    avatar_url?: string;
    banner_url?: string;
    bdsm_role?: string;
    orientation?: string;
    location?: string;
    birthday?: string;
    visibility?: string;
    bio?: string;
    looking_for?: string;
    kinks?: string;
    soft_limits?: string;
    hard_limits?: string;
  };
}

const ProfileHeaderView: React.FC<ProfileHeaderViewProps> = ({
  profile
}) => {
  const {
    user
  } = useAuth();
  const username = profile?.username || 'User';
  const orientation = profile?.orientation || '';
  const location = profile?.location || '';
  const avatarUrl = profile?.avatar_url || '';
  const bannerUrl = profile?.banner_url;
  const bdsmRole = profile?.bdsm_role || 'Exploring';
  const profileId = profile?.id || '';
  const bio = profile?.bio || 'No bio information provided yet.';
  const lookingFor = profile?.looking_for || 'Not specified';
  const kinks = profile?.kinks || 'Not specified';
  const softLimits = profile?.soft_limits || 'Not specified';
  const hardLimits = profile?.hard_limits || 'Not specified';
  const visibility = profile?.visibility || 'Public';

  const { followerCount, followingCount, loading: countsLoading } = useFollowCounts(profileId);

  type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "dominant" | "submissive" | "switch" | "exploring" | "crimson";

  const getBadgeVariant = (role: string): BadgeVariant => {
    switch (role.toLowerCase()) {
      case 'dominant':
        return 'dominant';
      case 'submissive':
        return 'submissive';
      case 'switch':
        return 'switch';
      default:
        return 'exploring';
    }
  };

  const isCurrentUser = user?.id === profileId;

  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-gray-800 to-abyss rounded-b-lg overflow-hidden">
        {bannerUrl ? (
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('${bannerUrl}')`
          }}>
          </div>
        ) : (
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: "url('/placeholder.svg')"
          }}>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      
      {/* Avatar and basic info */}
      <div className="relative px-4 sm:px-6 -mt-12">
        <div className="flex flex-col sm:flex-row items-center">
          <Avatar className="w-24 h-24 border-4 border-background shadow-md">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
            <AvatarFallback className="bg-crimson text-white text-xl">
              {username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* User info */}
          <div className="mt-4 sm:mt-0 sm:ml-6 w-full text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-white">{username}</h2>
              <Badge variant={getBadgeVariant(bdsmRole)} className="text-xs">
                {bdsmRole}
              </Badge>
            </div>
            <p className="text-gray-400 mt-1">
              {orientation || 'No orientation set'} • {location || 'No location set'}
            </p>
            
            {/* Followers & Following */}
            <div className="flex items-center justify-center sm:justify-start gap-6 mt-2 text-sm text-white/70">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-crimson" />
                <span><strong>{followerCount}</strong> followers</span>
              </div>
              <div>
                <span><strong>{followingCount}</strong> following</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            {!isCurrentUser && (
              <div className="mt-4 flex gap-2 flex-wrap justify-center sm:justify-start">
                <FollowButton profileId={profileId} />
                <MessageButton recipientId={profileId} />
              </div>
            )}
          </div>
        </div>

        {/* Compact Profile Information Container */}
        <div className="mt-6 bg-black/20 rounded-lg border border-white/10 p-4 space-y-4">
          {/* Bio Section */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div>
                <h3 className="text-sm font-medium text-white/80">Bio</h3>
                <p className="text-sm text-white/70 whitespace-pre-wrap">{bio}</p>
              </div>
            </div>
          </div>
          
          {/* Looking For */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div>
                <h3 className="text-sm font-medium text-white/80">Looking For</h3>
                <p className="text-sm text-white/70 whitespace-pre-wrap">{lookingFor}</p>
              </div>
            </div>
          </div>
          
          {/* Kinks/Fetishes */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Heart className="h-4 w-4 text-crimson shrink-0 mt-1" />
              <div>
                <h3 className="text-sm font-medium text-white/80">Kinks/Fetishes</h3>
                <p className="text-sm text-white/70 whitespace-pre-wrap">{kinks}</p>
              </div>
            </div>
          </div>
          
          {/* Soft Limits */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div>
                <h3 className="text-sm font-medium text-white/80">Soft Limits</h3>
                <p className="text-sm text-white/70 whitespace-pre-wrap">{softLimits}</p>
              </div>
            </div>
          </div>
          
          {/* Hard Limits */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div>
                <h3 className="text-sm font-medium text-white/80">Hard Limits</h3>
                <p className="text-sm text-white/70 whitespace-pre-wrap">{hardLimits}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderView;
