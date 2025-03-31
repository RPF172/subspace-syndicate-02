
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface TextAreaSectionProps {
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const TextAreaSection: React.FC<TextAreaSectionProps> = ({
  title,
  description,
  value,
  onChange,
  placeholder
}) => {
  return (
    <Card className="bg-black/30 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription className="text-white/70">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-black/30 border-white/10 min-h-[100px]"
        />
      </CardContent>
    </Card>
  );
};

export default TextAreaSection;
