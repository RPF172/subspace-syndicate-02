# Critical Security Vulnerabilities Fix Plan

## Overview
This document provides a step-by-step plan to address the 4 critical security vulnerabilities identified in the security audit. Each issue includes implementation steps, code examples, and testing procedures.

**Timeline:** All fixes should be completed within 48-72 hours
**Priority:** CRITICAL - Production deployment should be halted until these are resolved

---

## 1. Fix Hardcoded Supabase Credentials (CRITICAL)

### Current Issue
- Supabase URL and API key are hardcoded in `src/integrations/supabase/client.ts`
- Credentials are exposed in source code and version control

### Fix Steps

#### Step 1.1: Create Environment Variables
Create environment files:

**`.env.example`** (template for developers):
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**`.env.local`** (for local development):
```env
VITE_SUPABASE_URL=https://bggqlewmggcpzhogdkrn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZ3FsZXdtZ2djcHpob2dka3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NDkzMDIsImV4cCI6MjA2ODEyNTMwMn0.4e9jC5JLueY8cKy-QPg8lMN3dsEPFF6hSK3fvDSxwrQ
```

#### Step 1.2: Update .gitignore
Add to `.gitignore`:
```gitignore
# Environment variables
.env
.env.local
.env.development
.env.production
.env.test
.env*.local
```

#### Step 1.3: Modify Supabase Client
Update `src/integrations/supabase/client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Rest of the file remains the same...
```

#### Step 1.4: Update Netlify Configuration
Add environment variables to `netlify.toml`:
```toml
[build.environment]
  NODE_VERSION = "20"

[context.production.environment]
  VITE_SUPABASE_URL = "https://bggqlewmggcpzhogdkrn.supabase.co"
  VITE_SUPABASE_ANON_KEY = "your_production_key_here"

[context.development.environment]
  VITE_SUPABASE_URL = "https://bggqlewmggcpzhogdkrn.supabase.co"
  VITE_SUPABASE_ANON_KEY = "your_development_key_here"
```

#### Step 1.5: Update Other Files Using Environment Variables
Fix `src/components/feed/hooks/usePostCreation.ts`:
```typescript
const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-media-bucket`, {
```

Fix `src/components/video/VideoUploadForm.tsx`:
```typescript
const processResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-video`, {
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  }
});
```

### Testing
1. Verify app loads correctly with environment variables
2. Test authentication flow
3. Test file uploads and API calls
4. Confirm no hardcoded credentials remain in codebase

---

## 2. Fix XSS Vulnerability in Chart Component (HIGH)

### Current Issue
- Using `dangerouslySetInnerHTML` without sanitization in `src/components/ui/chart.tsx`
- Potential XSS if user input reaches this code

### Fix Steps

#### Step 2.1: Install DOMPurify for Sanitization
```bash
npm install dompurify
npm install -D @types/dompurify
```

#### Step 2.2: Create Safe CSS Generator
Create `src/utils/cssUtils.ts`:
```typescript
import DOMPurify from 'dompurify';

export function generateSafeCSS(themes: Record<string, string>, id: string, colorConfig: [string, any][]): string {
  // Validate and sanitize inputs
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid chart ID');
  }
  
  // Escape CSS identifiers
  const safeId = CSS.escape(id);
  
  const cssRules = Object.entries(themes)
    .map(([theme, prefix]) => {
      if (typeof theme !== 'string' || typeof prefix !== 'string') {
        return '';
      }
      
      const safeTheme = CSS.escape(theme);
      const safePrefix = CSS.escape(prefix);
      
      const colorRules = colorConfig
        .map(([key, itemConfig]) => {
          if (typeof key !== 'string' || !itemConfig) {
            return '';
          }
          
          const safeKey = CSS.escape(key);
          // Validate color values
          const color = itemConfig.color;
          if (typeof color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
            return '';
          }
          
          return `  --color-${safeKey}: ${color};`;
        })
        .filter(Boolean)
        .join('\n');
      
      return `${safePrefix} [data-chart="${safeId}"] {\n${colorRules}\n}`;
    })
    .filter(Boolean)
    .join('\n\n');
  
  // Sanitize the final CSS
  return DOMPurify.sanitize(cssRules);
}
```

#### Step 2.3: Update Chart Component
Replace the dangerous code in `src/components/ui/chart.tsx`:
```typescript
import { generateSafeCSS } from '@/utils/cssUtils';

// Replace the dangerouslySetInnerHTML section with:
const safeCSS = useMemo(() => {
  try {
    return generateSafeCSS(THEMES, id, colorConfig);
  } catch (error) {
    console.error('Error generating chart CSS:', error);
    return '';
  }
}, [id, colorConfig]);

return (
  <style
    dangerouslySetInnerHTML={{
      __html: safeCSS
    }}
  />
);
```

#### Step 2.4: Alternative Solution - Use CSS-in-JS
Better approach using styled-components or emotion:
```typescript
import styled from 'styled-components';

const StyledChartContainer = styled.div<{ chartId: string; colors: Record<string, string> }>`
  ${({ chartId, colors }) => 
    Object.entries(colors)
      .map(([key, color]) => `
        &[data-chart="${chartId}"] {
          --color-${key}: ${color};
        }
      `)
      .join('')
  }
`;
```

### Testing
1. Test chart rendering with various data inputs
2. Attempt XSS injection in chart data
3. Verify CSS is properly escaped
4. Performance test with large datasets

---

## 3. Fix Admin Authorization Vulnerability (HIGH)

### Current Issue
- Admin check only validates client-side against `profiles.is_admin`
- No server-side verification, can be bypassed

### Fix Steps

#### Step 3.1: Create Server-Side Admin Verification Function
Create `supabase/functions/verify-admin/index.ts`:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin status in database
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.is_admin === true;

    return new Response(
      JSON.stringify({ isAdmin, userId: user.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

#### Step 3.2: Create Secure Admin Hook
Create `src/hooks/useAdminVerification.ts`:
```typescript
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAdminVerification = () => {
  const { user, session } = useAuth();

  return useQuery({
    queryKey: ['adminVerification', user?.id],
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No access token');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Admin verification failed');
      }

      const data = await response.json();
      return data.isAdmin;
    },
    enabled: !!user?.id && !!session?.access_token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

#### Step 3.3: Update Admin Dashboard
Replace `src/pages/AdminDashboard.tsx`:
```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminVerification } from '@/hooks/useAdminVerification';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import AdminCreatorApplications from '@/components/admin/AdminCreatorApplications';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading, error } = useAdminVerification();
  
  // If loading, show a loading indicator
  if (loading || isAdminLoading) {
    return (
      <AuthenticatedLayout pageTitle="Admin Dashboard">
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  // If not authenticated or admin verification failed, redirect
  if (!user || error || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <AuthenticatedLayout pageTitle="Admin Dashboard">
      <div className="space-y-6">
        <AdminCreatorApplications />
      </div>
    </AuthenticatedLayout>
  );
};

export default AdminDashboard;
```

#### Step 3.4: Add RLS Policies for Admin Operations
Add to Supabase SQL:
```sql
-- Create admin verification function
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy for admin-only operations
CREATE POLICY "Only admins can manage applications" ON creator_applications
  FOR ALL USING (is_admin(auth.uid()));
```

### Testing
1. Test admin access with valid admin user
2. Test access denial for non-admin users
3. Verify token validation works correctly
4. Test edge cases (expired tokens, invalid users)

---

## 4. Fix File Upload Security Issues (HIGH)

### Current Issue
- File type validation only checks MIME type (can be spoofed)
- No server-side file content validation
- Large file upload limits without rate limiting

### Fix Steps

#### Step 4.1: Create Secure File Validation Function
Create `supabase/functions/validate-file/index.ts`:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// File signatures for validation
const FILE_SIGNATURES = {
  'video/mp4': [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp
    [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], // ftyp
  ],
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF
};

function validateFileSignature(fileBytes: Uint8Array, mimeType: string): boolean {
  const signatures = FILE_SIGNATURES[mimeType as keyof typeof FILE_SIGNATURES];
  if (!signatures) return false;

  return signatures.some(signature => {
    if (fileBytes.length < signature.length) return false;
    return signature.every((byte, index) => fileBytes[index] === byte);
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const expectedMimeType = formData.get('mimeType') as string;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check file size (10MB limit for images, 50MB for videos)
    const maxSize = expectedMimeType.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File too large' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Read file header for signature validation
    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer.slice(0, 64)); // First 64 bytes

    // Validate file signature matches MIME type
    if (!validateFileSignature(fileBytes, expectedMimeType)) {
      return new Response(
        JSON.stringify({ error: 'File signature does not match MIME type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Additional checks for video files
    if (expectedMimeType.startsWith('video/')) {
      // Check for common video container formats
      const isValidVideo = validateVideoFile(fileBytes);
      if (!isValidVideo) {
        return new Response(
          JSON.stringify({ error: 'Invalid video file format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        valid: true, 
        fileSize: file.size,
        fileName: file.name 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'File validation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function validateVideoFile(fileBytes: Uint8Array): boolean {
  // Check for MP4 container
  const mp4Signatures = [
    'ftyp', 'moov', 'mdat', 'mvhd'
  ];
  
  const fileString = new TextDecoder().decode(fileBytes);
  return mp4Signatures.some(sig => fileString.includes(sig));
}
```

#### Step 4.2: Update Client-Side File Validation
Create `src/utils/fileValidation.ts`:
```typescript
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export async function validateFileSecurely(file: File): Promise<FileValidationResult> {
  const warnings: string[] = [];

  // Client-side checks
  const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedTypes = [...allowedVideoTypes, ...allowedImageTypes];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type' };
  }

  // Size checks
  const maxVideoSize = 50 * 1024 * 1024; // 50MB
  const maxImageSize = 10 * 1024 * 1024; // 10MB
  const maxSize = file.type.startsWith('video/') ? maxVideoSize : maxImageSize;

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB` 
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  // Server-side validation
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mimeType', file.type);

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-file`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.valid) {
      return { valid: false, error: result.error || 'Server validation failed' };
    }

    return { valid: true, warnings };
  } catch (error) {
    return { valid: false, error: 'File validation service unavailable' };
  }
}

export function sanitizeFileName(fileName: string): string {
  // Remove potentially dangerous characters
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}
```

#### Step 4.3: Update Video Upload Form
Modify `src/components/video/VideoUploadForm.tsx`:
```typescript
import { validateFileSecurely, sanitizeFileName } from '@/utils/fileValidation';

const handleVideoSelect = async (files: FileList | null) => {
  if (files && files.length > 0) {
    const file = files[0];
    
    // Secure file validation
    const validation = await validateFileSecurely(file);
    
    if (!validation.valid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    if (validation.warnings?.length) {
      validation.warnings.forEach(warning => {
        toast({
          title: "Warning",
          description: warning,
          variant: "default"
        });
      });
    }

    // Sanitize file name
    const sanitizedFile = new File([file], sanitizeFileName(file.name), {
      type: file.type,
      lastModified: file.lastModified,
    });

    setVideoFile(sanitizedFile);
    
    // Continue with existing logic...
  }
};
```

#### Step 4.4: Add Rate Limiting
Create `src/hooks/useRateLimit.ts`:
```typescript
import { useState, useRef } from 'react';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function useRateLimit(config: RateLimitConfig) {
  const requestTimes = useRef<number[]>([]);
  const [isLimited, setIsLimited] = useState(false);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Remove old requests outside the window
    requestTimes.current = requestTimes.current.filter(time => time > windowStart);

    if (requestTimes.current.length >= config.maxRequests) {
      setIsLimited(true);
      return false;
    }

    requestTimes.current.push(now);
    setIsLimited(false);
    return true;
  };

  return { checkRateLimit, isLimited };
}
```

### Testing
1. Test file upload with valid files
2. Attempt to upload files with spoofed MIME types
3. Test file size limits
4. Verify malicious file detection
5. Test rate limiting functionality

---

## Implementation Timeline

### Day 1 (8 hours)
- **Hours 1-2:** Fix hardcoded credentials
- **Hours 3-4:** Implement environment variable system
- **Hours 5-6:** Fix XSS vulnerability in chart component
- **Hours 7-8:** Test credential and XSS fixes

### Day 2 (8 hours)
- **Hours 1-4:** Implement server-side admin verification
- **Hours 5-8:** Create secure file validation system

### Day 3 (4 hours)
- **Hours 1-2:** Integration testing
- **Hours 3-4:** Security testing and verification

## Post-Implementation Checklist

### Security Verification
- [ ] No hardcoded credentials in codebase
- [ ] All environment variables properly configured
- [ ] XSS vulnerability patched and tested
- [ ] Admin authorization requires server-side verification
- [ ] File uploads validate both MIME type and file signature
- [ ] Rate limiting implemented for uploads

### Testing Requirements
- [ ] Unit tests for all security functions
- [ ] Integration tests for authentication flows
- [ ] File upload security tests
- [ ] Admin authorization tests
- [ ] Performance tests for rate limiting

### Documentation
- [ ] Update deployment documentation with environment variables
- [ ] Document new security procedures
- [ ] Create incident response plan
- [ ] Update developer onboarding with security practices

### Monitoring
- [ ] Set up alerts for failed admin verifications
- [ ] Monitor file upload patterns
- [ ] Track rate limiting violations
- [ ] Log security-related events

## Emergency Rollback Plan

If issues arise during implementation:

1. **Credentials Fix:** Revert to hardcoded values temporarily, but remove from production immediately
2. **XSS Fix:** Disable chart component if needed
3. **Admin Fix:** Temporarily disable admin features
4. **File Upload Fix:** Disable file uploads if validation fails

Each fix should be implemented and tested independently to minimize risk of cascading failures.