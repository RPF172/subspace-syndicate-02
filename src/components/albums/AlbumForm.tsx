import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/ui/file-uploader';
import { X, Upload, Image as ImageIcon, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { AlbumPrivacy, Album } from '@/types/albums';

interface AlbumFormProps {
  onSubmit: (values: FormValues) => Promise<void>;
  defaultValues?: Partial<FormValues>;
  isEditing?: boolean;
  isLoading?: boolean;
  onCancel?: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().optional(),
  privacy: z.enum(['public', 'private', 'friends-only']),
  tags: z.array(z.string()).optional(),
  coverImage: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AlbumForm = ({ 
  onSubmit, 
  defaultValues, 
  isEditing = false,
  isLoading = false,
  onCancel
}: AlbumFormProps): JSX.Element => {
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [currentTag, setCurrentTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (coverImagePreview) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [coverImagePreview]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      privacy: defaultValues?.privacy || 'public',
      tags: defaultValues?.tags || [],
      coverImage: undefined,
    },
  });

  const handleCoverImageSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }

      form.setValue('coverImage', file);
      setCoverImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleRemoveCoverImage = () => {
    form.setValue('coverImage', undefined);
    if (coverImagePreview) {
      URL.revokeObjectURL(coverImagePreview);
      setCoverImagePreview(null);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim() !== '') {
      e.preventDefault();
      const tags = form.getValues('tags') || [];
      if (!tags.includes(currentTag.trim())) {
        form.setValue('tags', [...tags, currentTag.trim()]);
        setCurrentTag('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const tags = form.getValues('tags') || [];
    form.setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      setError(null);
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save album');
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Album Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter album title" 
                  {...field} 
                  className="bg-black/30 border-white/20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your album (optional)" 
                  {...field} 
                  className="bg-black/30 border-white/20 min-h-[80px] sm:min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="privacy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Privacy</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-black/30 border-white/20">
                    <SelectValue placeholder="Select privacy setting" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="public">Public (Everyone can see)</SelectItem>
                  <SelectItem value="friends-only">Friends Only</SelectItem>
                  <SelectItem value="private">Private (Only you can see)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-white/60 text-sm">
                Control who can view your album
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {field.value?.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-sm">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <FormControl>
                <Input
                  ref={tagInputRef}
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tags and press Enter"
                  className="bg-black/30 border-white/20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  {coverImagePreview ? (
                    <div className="relative aspect-[4/3]">
                      <img
                        src={coverImagePreview}
                        alt="Cover preview"
                        className="object-cover w-full h-full rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={handleRemoveCoverImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <FileUploader
                      onFilesSelected={handleCoverImageSelect}
                      accept="image/*"
                      maxSize={10 * 1024 * 1024} // 10MB
                      className="aspect-[4/3] border-2 border-dashed border-white/20 rounded-md hover:border-white/40 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center h-full text-white/60 p-4 text-center">
                        <Upload className="h-6 w-6 sm:h-8 sm:w-8 mb-2" />
                        <p className="text-sm sm:text-base">Click to upload cover image</p>
                        <p className="text-xs mt-1">Max size: 10MB</p>
                      </div>
                    </FileUploader>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {isEditing ? 'Update Album' : 'Create Album'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AlbumForm;
