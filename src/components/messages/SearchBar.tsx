
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isSearching }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="flex items-center gap-2 my-4">
      <div className="relative flex-1">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for username..."
          className="bg-black/30 pr-8"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button 
        onClick={handleSearch}
        disabled={!searchQuery.trim() || isSearching}
      >
        {isSearching ? (
          <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full" />
        ) : (
          <Search className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default SearchBar;
