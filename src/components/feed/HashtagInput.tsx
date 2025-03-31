import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CommandInput, CommandItem, CommandList, CommandGroup, Command } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HashtagInputProps {
  onAddHashtag: (tag: string) => void;
  maxHashtags: number;
  currentCount: number;
  disabled?: boolean;
}

export const HashtagInput: React.FC<HashtagInputProps> = ({ 
  onAddHashtag,
  maxHashtags,
  currentCount,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch hashtag suggestions when input changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!inputValue.trim()) {
        setSuggestions([]);
        return;
      }
      
      setLoading(true);
      try {
        // Remove # if present
        const searchTerm = inputValue.startsWith('#') ? inputValue.substring(1) : inputValue;
        
        // Query the database for existing hashtags
        const { data, error } = await supabase
          .from('post_hashtags')
          .select('hashtag')
          .ilike('hashtag', `${searchTerm.toLowerCase()}%`)
          .order('hashtag')
          .limit(5);
          
        if (error) throw error;
        
        // Extract unique hashtags
        const uniqueHashtags = [...new Set(data.map(item => item.hashtag))];
        setSuggestions(uniqueHashtags);
      } catch (error) {
        console.error('Error fetching hashtag suggestions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce the fetch
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [inputValue]);
  
  // Handle selecting a suggestion
  const handleSelect = (value: string) => {
    onAddHashtag(value);
    setInputValue('');
    setOpen(false);
    
    // Focus back on input after selection
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };
  
  // Handle submitting the hashtag
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim()) {
      onAddHashtag(inputValue);
      setInputValue('');
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-white/10"
          disabled={currentCount >= maxHashtags || disabled}
        >
          <Hash className="h-5 w-5 mr-1" />
          Hashtag
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[220px] p-0 bg-black/90 border-white/10" align="start">
        <form onSubmit={handleSubmit}>
          <Command className="bg-transparent">
            <CommandInput 
              ref={inputRef}
              placeholder="Type a hashtag..."
              value={inputValue}
              onValueChange={setInputValue}
              className="border-b border-white/10"
            />
            
            {suggestions.length > 0 && (
              <CommandList>
                <CommandGroup>
                  {suggestions.map(tag => (
                    <CommandItem
                      key={tag}
                      onSelect={() => handleSelect(tag)}
                      className="hover:bg-white/10 text-white"
                    >
                      <Hash className="h-4 w-4 mr-2 text-blue-400" />
                      {tag}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            )}
            
            <div className="p-2 flex justify-between items-center">
              <div className="text-xs text-gray-400">
                {currentCount}/{maxHashtags}
              </div>
              
              <Button 
                type="submit" 
                size="sm"
                disabled={!inputValue.trim() || currentCount >= maxHashtags || disabled}
              >
                Add
              </Button>
            </div>
          </Command>
        </form>
      </PopoverContent>
    </Popover>
  );
}; 