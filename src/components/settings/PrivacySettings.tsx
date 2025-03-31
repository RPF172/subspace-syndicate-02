
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

const PrivacySettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState('Public');
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  
  // Fetch privacy settings from profiles table
  useEffect(() => {
    if (user?.id) {
      const fetchPrivacySettings = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('visibility, show_online_status, allow_messages')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching privacy settings:', error);
          return;
        }
        
        if (data) {
          setVisibility(data.visibility || user?.user_metadata?.visibility || 'Public');
          setShowOnlineStatus(data.show_online_status !== false && user?.user_metadata?.show_online_status !== false);
          setAllowMessages(data.allow_messages !== false && user?.user_metadata?.allow_messages !== false);
        }
      };
      
      fetchPrivacySettings();
    }
  }, [user]);
  
  const updatePrivacySettings = async () => {
    setLoading(true);
    
    try {
      // Update auth metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          visibility,
          show_online_status: showOnlineStatus,
          allow_messages: allowMessages
        }
      });
      
      if (error) throw error;
      
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          visibility,
          show_online_status: showOnlineStatus,
          allow_messages: allowMessages
        })
        .eq('id', user?.id);
        
      if (profileError) throw profileError;
      
      toast({
        title: "Privacy settings updated",
        description: "Your privacy settings have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating privacy settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Privacy Settings</h2>
        <p className="text-gray-400 mb-6">Manage who can see your profile and interact with you</p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Profile Visibility</Label>
          <RadioGroup value={visibility} onValueChange={setVisibility} className="space-y-3">
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="Public" id="public" />
              <div className="space-y-1">
                <Label htmlFor="public" className="font-medium">Public</Label>
                <p className="text-sm text-gray-400">Anyone can see your profile, including non-registered users</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="Members" id="members" />
              <div className="space-y-1">
                <Label htmlFor="members" className="font-medium">Members Only</Label>
                <p className="text-sm text-gray-400">Only registered users can see your profile</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="Friends" id="friends" />
              <div className="space-y-1">
                <Label htmlFor="friends" className="font-medium">Friends Only</Label>
                <p className="text-sm text-gray-400">Only users you've connected with can see your profile</p>
              </div>
            </div>
          </RadioGroup>
        </div>
        
        <div className="border-t border-white/10 my-6"></div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Show Online Status</Label>
              <p className="text-sm text-gray-400">Let others see when you're active on the platform</p>
            </div>
            <Switch 
              checked={showOnlineStatus} 
              onCheckedChange={setShowOnlineStatus} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Allow Direct Messages</Label>
              <p className="text-sm text-gray-400">Receive messages from other members</p>
            </div>
            <Switch 
              checked={allowMessages} 
              onCheckedChange={setAllowMessages} 
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={updatePrivacySettings} disabled={loading}>
            {loading ? "Saving..." : "Save Privacy Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
