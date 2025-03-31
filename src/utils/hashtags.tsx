
import React from 'react';
import { Link } from 'react-router-dom';

// Function to parse text and convert hashtags to links
export function parseHashtags(text: string): React.ReactNode[] {
  if (!text) return [text];

  // Regex pattern for hashtags (# followed by alphanumeric chars or underscores)
  const hashtagPattern = /#(\w+)/g;
  
  // Find all hashtags in the text
  const matches = text.match(hashtagPattern);
  
  if (!matches) return [text];
  
  // Split text by hashtags and create array of text and hashtag links
  let result: React.ReactNode[] = [];
  let lastIndex = 0;
  
  matches.forEach((match) => {
    const matchIndex = text.indexOf(match, lastIndex);
    
    // Add text before hashtag
    if (matchIndex > lastIndex) {
      result.push(text.substring(lastIndex, matchIndex));
    }
    
    // Extract hashtag without the # symbol
    const tag = match.substring(1);
    
    // Add hashtag link
    const hashtagLink = (
      <div 
        key={`tag-${matchIndex}`} 
        className="inline"
        onClick={(e) => {
          e.stopPropagation(); // Prevent parent click events
        }}
      >
        <Link
          to={`/hashtag/${tag}`}
          className="text-crimson hover:underline inline-block"
        >
          {match}
        </Link>
      </div>
    );
    
    result.push(hashtagLink);
    
    lastIndex = matchIndex + match.length;
  });
  
  // Add remaining text after last hashtag
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }
  
  return result;
}

// New function to format text with hashtags for preview
export function formatTextWithHashtags(text: string): React.ReactNode {
  if (!text) return null;
  return <div className="space-x-1">{parseHashtags(text)}</div>;
}
