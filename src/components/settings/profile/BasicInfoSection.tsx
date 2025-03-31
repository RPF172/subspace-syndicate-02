
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BasicInfoSectionProps {
  username: string;
  setUsername: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  orientation: string;
  setOrientation: (value: string) => void;
  bdsmRole: string;
  setBdsmRole: (value: string) => void;
  visibility: string;
  setVisibility: (value: string) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  username,
  setUsername,
  location,
  setLocation,
  orientation,
  setOrientation,
  bdsmRole,
  setBdsmRole,
  visibility,
  setVisibility
}) => {
  return (
    <Card className="bg-black/30 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-black/30 border-white/10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-black/30 border-white/10"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="orientation">Orientation</Label>
            <Select value={orientation} onValueChange={setOrientation}>
              <SelectTrigger className="bg-black/30 border-white/10 w-full">
                <SelectValue placeholder="Select orientation" />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-white/10 text-white">
                <SelectItem value="hetero">Hetero</SelectItem>
                <SelectItem value="gay">Gay</SelectItem>
                <SelectItem value="lesbian">Lesbian</SelectItem>
                <SelectItem value="bisexual">Bisexual</SelectItem>
                <SelectItem value="pansexual">Pansexual</SelectItem>
                <SelectItem value="asexual">Asexual</SelectItem>
                <SelectItem value="queer">Queer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bdsm-role">BDSM Role</Label>
            <Select value={bdsmRole} onValueChange={setBdsmRole}>
              <SelectTrigger className="bg-black/30 border-white/10 w-full">
                <SelectValue placeholder="Select BDSM role" />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-white/10 text-white">
                <SelectItem value="dominant">Dominant</SelectItem>
                <SelectItem value="submissive">Submissive</SelectItem>
                <SelectItem value="switch">Switch</SelectItem>
                <SelectItem value="exploring">Exploring</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="visibility">Profile Visibility</Label>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="bg-black/30 border-white/10 w-full">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent className="bg-black/95 border-white/10 text-white">
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="members-only">Members Only</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;
