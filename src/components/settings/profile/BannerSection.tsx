
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploader } from '@/components/ui/file-uploader';
import { Upload } from 'lucide-react';

interface BannerSectionProps {
  bannerUrl: string | null;
  bannerPreview: string;
  bannerFile: File | null;
  bannerLoading: boolean;
  onBannerSelect: (files: FileList | null) => void;
  onUploadBanner: () => void;
  onCancelBannerUpload: () => void;
}

const BannerSection: React.FC<BannerSectionProps> = ({
  bannerUrl,
  bannerPreview,
  bannerFile,
  bannerLoading,
  onBannerSelect,
  onUploadBanner,
  onCancelBannerUpload
}) => {
  return (
    <Card className="bg-black/30 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Profile Banner</CardTitle>
        <CardDescription className="text-white/70">
          This is your profile header image. It will be displayed at the top of your profile page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="relative w-full h-48 bg-black/20 rounded-md overflow-hidden border border-white/10">
            {bannerPreview ? (
              <img 
                src={bannerPreview} 
                alt="Banner Preview" 
                className="w-full h-full object-cover"
              />
            ) : bannerUrl ? (
              <img 
                src={bannerUrl} 
                alt="Profile Banner" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                No banner image set
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row">
            {bannerFile ? (
              <>
                <Button 
                  onClick={onUploadBanner}
                  disabled={bannerLoading}
                  className="bg-crimson hover:bg-crimson/90 text-white"
                >
                  {bannerLoading ? "Uploading..." : "Save Banner"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={onCancelBannerUpload}
                  disabled={bannerLoading}
                  className="border-white/20"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <FileUploader
                accept="image/*"
                onFilesSelected={onBannerSelect}
                maxSize={10} // 10MB
              >
                <Button 
                  variant="outline"
                  className="border-white/20"
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload Banner
                </Button>
              </FileUploader>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BannerSection;
