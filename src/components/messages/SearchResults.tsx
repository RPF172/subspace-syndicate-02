
import React from 'react';
import UserSearchResult from './UserSearchResult';

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  last_active?: string;
}

interface SearchResultsProps {
  results: UserProfile[];
  searchQuery: string;
  isSearching: boolean;
  onSelectUser: (userId: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  searchQuery, 
  isSearching, 
  onSelectUser 
}) => {
  if (isSearching) {
    return (
      <div className="text-center text-white/60 py-8">
        <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mx-auto"></div>
        <p className="mt-2">Searching...</p>
      </div>
    );
  }

  if (results.length === 0 && searchQuery && !isSearching) {
    return (
      <div className="text-center text-white/60 py-8">
        <p>No users found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {results.map(profile => (
        <UserSearchResult 
          key={profile.id} 
          profile={profile} 
          onSelect={onSelectUser} 
        />
      ))}
    </div>
  );
};

export default SearchResults;
