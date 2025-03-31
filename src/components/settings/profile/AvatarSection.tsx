
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploader } from '@/components/ui/file-uploader';
import { Upload } from 'lucide-react';

interface AvatarSectionProps {
  avatarUrl: string | null;
  username: string;
  initials: string;
  avatarPreview: string;
  avatarFile: File | null;
  avatarLoading: boolean;
  onAvatarSelect: (files: FileList | null) => void;
  onUploadAvatar: () => void;
  onCancelAvatarUpload: () => void;
}

const AvatarSection: React.FC<AvatarSectionProps> = ({
  avatarUrl,
  username,
  initials,
  avatarPreview,
  avatarFile,
  avatarLoading,
  onAvatarSelect,
  onUploadAvatar,
  onCancelAvatarUpload
}) => {
  return (
    <Card className="bg-black/30 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Profile Picture</CardTitle>
        <CardDescription className="text-white/70">
          This is your public profile image. It will be displayed on your profile and comments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-white/20">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt="Preview" />
              ) : (
                <>
                  <AvatarImage src={avatarUrl || ""} alt={username} />
                  <AvatarFallback className="bg-crimson text-white text-xl">
                    {initials}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row">
            {avatarFile ? (
              <>
                <Button 
                  onClick={onUploadAvatar}
                  disabled={avatarLoading}
                  className="bg-crimson hover:bg-crimson/90 text-white"
                >
                  {avatarLoading ? "Uploading..." : "Save Avatar"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={onCancelAvatarUpload}
                  disabled={avatarLoading}
                  className="border-white/20"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <FileUploader
                accept="image/*"
                onFilesSelected={onAvatarSelect}
                maxSize={5} // 5MB
              >
                <Button 
                  variant="outline"
                  className="border-white/20"
                >
                  <Upload className="mr-2 h-4 w-4" /> Change Avatar
                </Button>
              </FileUploader>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarSection;
