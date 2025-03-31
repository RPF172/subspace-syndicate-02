import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, ensureBucketExists } from '@/integrations/supabase/client';
import { 
  Image, 
  Smile, 
  Send, 
  X, 
  Bold, 
  Italic, 
  Underline, 
  Heading, 
  List, 
  ListOrdered,
  Hash
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { formatTextWithHashtags } from '@/utils/hashtags';

const PostForm: React.FC = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [bucketError, setBucketError] = useState<string | null>(null);

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching avatar:', error);
            return;
          }
          
          if (data && data.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }
        } catch (error) {
          console.error('Error fetching avatar:', error);
        }
      }
    };
    
    const checkStorageBucket = async () => {
      try {
        const bucketExists = await ensureBucketExists('post_media');
        if (!bucketExists) {
          setBucketError('Media storage is not available. Please try again later or contact support.');
        }
      } catch (error) {
        console.error('Error checking bucket exists:', error);
        setBucketError('Error connecting to storage. Please try again later.');
      }
    };
    
    fetchUserAvatar();
    checkStorageBucket();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setMediaFiles(prev => [...prev, ...newFiles]);
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const applyTextFormat = (format: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    let cursorPosition = 0;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorPosition = start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorPosition = start + 1;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        cursorPosition = start + 2;
        break;
      case 'heading':
        formattedText = `## ${selectedText}`;
        cursorPosition = start + 3;
        break;
      case 'list':
        formattedText = `\n- ${selectedText}`;
        cursorPosition = start + 3;
        break;
      case 'ordered-list':
        formattedText = `\n1. ${selectedText}`;
        cursorPosition = start + 4;
        break;
      case 'hashtag':
        formattedText = `#${selectedText}`;
        cursorPosition = start + 1;
        break;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + formattedText.length,
        start + formattedText.length
      );
    }, 0);
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please enter some content or select files to post",
        variant: "destructive",
      });
      return;
    }

    if (bucketError) {
      toast({
        title: "Error",
        description: "Storage is not available. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to post",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let mediaUrls: string[] = [];
      let mediaTypes: string[] = [];

      if (mediaFiles.length > 0) {
        const bucketExists = await ensureBucketExists('post_media');
        
        if (!bucketExists) {
          throw new Error("Media storage is not available. Please try again later or contact support.");
        }

        const uploadPromises = mediaFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const filePath = `${user.id}/${uuidv4()}.${fileExt}`;
          
          let mediaType = 'other';
          if (file.type.startsWith('image/')) {
            mediaType = 'image';
          } else if (file.type.startsWith('video/')) {
            mediaType = 'video';
          }
          
          const { error: uploadError, data } = await supabase.storage
            .from('post_media')
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('post_media')
            .getPublicUrl(filePath);
            
          return { url: publicUrl, type: mediaType };
        });

        const uploadResults = await Promise.all(uploadPromises);
        mediaUrls = uploadResults.map(result => result.url);
        mediaTypes = uploadResults.map(result => result.type);
      }

      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          media_url: mediaUrls.length > 0 ? mediaUrls.join(',') : null,
          media_type: mediaTypes.length > 0 ? mediaTypes.join(',') : null
        });

      if (insertError) {
        throw insertError;
      }

      setContent('');
      setMediaFiles([]);
      setPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Success",
        description: "Your post has been published!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
          <AvatarFallback className="bg-crimson text-white">
            {username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-black/20 border-white/10 resize-none min-h-[100px] text-white placeholder:text-white/50 mb-2 focus:ring-crimson/50 focus-visible:ring-crimson/50 focus:border-crimson"
            rows={2}
          />
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1 bg-black/30 border-white/10 border rounded-md p-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
                onClick={() => applyTextFormat('bold')}
                type="button"
                title="Bold"
              >
                <Bold size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
                onClick={() => applyTextFormat('italic')}
                type="button"
                title="Italic"
              >
                <Italic size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
                onClick={() => applyTextFormat('hashtag')}
                type="button"
                title="Add hashtag"
              >
                <Hash size={14} />
              </Button>
            </div>
          </div>

          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2 my-3">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <div className="w-20 h-20 rounded-md overflow-hidden">
                    <img 
                      src={preview} 
                      alt={`Preview ${index+1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-80 group-hover:opacity-100"
                    onClick={() => removeMediaFile(index)}
                  >
                    <X size={12} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white/5 text-white hover:bg-white/10"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  title="Add media"
                >
                  <Image size={18} />
                </Button>
                <Input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-white/5 text-white hover:bg-white/10"
                onClick={() => setShowPreview(!showPreview)}
                type="button"
                title="Preview"
              >
                <Smile size={18} />
              </Button>
            </div>
            
            <Button
              variant="default"
              className="bg-crimson hover:bg-crimson/90 text-white px-5"
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0)}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Posting...</span>
                  <span className="animate-spin">⏳</span>
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {showPreview && content.trim() && (
        <div className="bg-black/30 border border-white/10 rounded-md p-4 mt-3">
          <h3 className="text-white/70 text-sm font-semibold mb-2">Preview</h3>
          <div className="text-white whitespace-pre-wrap">
            {formatTextWithHashtags(content)}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostForm;
