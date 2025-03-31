
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Hash, X } from 'lucide-react';
import { HashtagInput } from './HashtagInput';
import { Separator } from '@/components/ui/separator';

interface NotificationPreferences {
  allPosts: boolean;
  followedUsers: boolean;
  hashtags: string[];
}

interface NotificationSettingsProps {
  preferences: NotificationPreferences;
  onPreferencesChange: (prefs: NotificationPreferences) => void;
}

export default function NotificationSettings({ preferences, onPreferencesChange }: NotificationSettingsProps) {
  // Ensure hashtags is always an array even if undefined
  const hashtags = Array.isArray(preferences.hashtags) ? preferences.hashtags : [];
  
  const handleToggleAllPosts = (checked: boolean) => {
    onPreferencesChange({
      ...preferences,
      allPosts: checked
    });
  };
  
  const handleToggleFollowedUsers = (checked: boolean) => {
    onPreferencesChange({
      ...preferences,
      followedUsers: checked
    });
  };
  
  const handleAddHashtag = (tag: string) => {
    // Skip if preferences.hashtags is not yet initialized
    if (!preferences || !tag) return;
    
    // Remove # if present and normalize to lowercase
    const formattedTag = tag.startsWith('#') ? tag.substring(1).toLowerCase() : tag.toLowerCase();
    
    // Don't add if already exists
    if (hashtags.includes(formattedTag)) return;
    
    onPreferencesChange({
      ...preferences,
      hashtags: [...hashtags, formattedTag]
    });
  };
  
  const handleRemoveHashtag = (tag: string) => {
    if (!preferences) return;
    
    onPreferencesChange({
      ...preferences,
      hashtags: hashtags.filter(t => t !== tag)
    });
  };
  
  return (
    <Card className="bg-black/30 border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-5 w-5 mr-2 text-blue-400"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          Notification Settings
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="all-posts">All Posts</Label>
            <p className="text-sm text-gray-400">Get notified about all new posts</p>
          </div>
          <Switch
            id="all-posts"
            checked={preferences.allPosts}
            onCheckedChange={handleToggleAllPosts}
          />
        </div>
        
        <Separator className="bg-white/10" />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="followed-users">Followed Users</Label>
            <p className="text-sm text-gray-400">Only get notifications from users you follow</p>
          </div>
          <Switch
            id="followed-users"
            checked={preferences.followedUsers}
            onCheckedChange={handleToggleFollowedUsers}
            disabled={preferences.allPosts}
          />
        </div>
        
        <Separator className="bg-white/10" />
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Hashtag Notifications</Label>
            <HashtagInput
              onAddHashtag={handleAddHashtag}
              maxHashtags={10}
              currentCount={hashtags.length}
              disabled={preferences.allPosts}
            />
          </div>
          
          {hashtags.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {hashtags.map(tag => (
                <Badge
                  key={tag}
                  className="bg-blue-900/30 text-blue-300 flex items-center gap-1"
                >
                  #{tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full hover:bg-blue-800/60 p-0"
                    onClick={() => handleRemoveHashtag(tag)}
                    disabled={preferences.allPosts}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              {preferences.allPosts 
                ? "You'll get all notifications" 
                : "Add hashtags to get notifications for specific topics"}
            </p>
          )}
        </div>
        
        <div className="text-xs text-gray-400 italic mt-4">
          Changes to notification settings are saved automatically
        </div>
      </CardContent>
    </Card>
  );
}
