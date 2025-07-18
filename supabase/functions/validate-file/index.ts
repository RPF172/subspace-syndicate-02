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
    [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70], // ftyp
  ],
  'video/quicktime': [
    [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74], // ftypqt
  ],
  'video/webm': [
    [0x1A, 0x45, 0xDF, 0xA3], // EBML header
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

function validateVideoFile(fileBytes: Uint8Array): boolean {
  // Check for MP4 container elements
  const mp4Signatures = [
    'ftyp', 'moov', 'mdat', 'mvhd'
  ];
  
  const fileString = new TextDecoder().decode(fileBytes.slice(0, 100));
  return mp4Signatures.some(sig => fileString.includes(sig));
}

function checkForMaliciousContent(fileBytes: Uint8Array): boolean {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const content = decoder.decode(fileBytes.slice(0, 1024)); // Check first 1KB
  
  // Look for potentially malicious patterns
  const maliciousPatterns = [
    '<script', 'javascript:', 'data:text/html', 'vbscript:', 'onload=', 'onerror=',
    '<?php', '<%', 'eval(', 'document.cookie', 'window.location'
  ];
  
  return maliciousPatterns.some(pattern => 
    content.toLowerCase().includes(pattern.toLowerCase())
  );
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

    // Validate MIME type is allowed
    const allowedTypes = [
      'video/mp4', 'video/quicktime', 'video/webm',
      'image/jpeg', 'image/png', 'image/webp'
    ];
    
    if (!allowedTypes.includes(expectedMimeType)) {
      return new Response(
        JSON.stringify({ error: 'Unsupported file type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check file size (10MB limit for images, 100MB for videos)
    const maxSize = expectedMimeType.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (file.size === 0) {
      return new Response(
        JSON.stringify({ error: 'File is empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Read file header for signature validation
    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer.slice(0, 1024)); // First 1KB

    // Check for malicious content
    if (checkForMaliciousContent(fileBytes)) {
      return new Response(
        JSON.stringify({ error: 'File contains potentially malicious content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file signature matches MIME type
    if (!validateFileSignature(fileBytes, expectedMimeType)) {
      return new Response(
        JSON.stringify({ error: 'File signature does not match MIME type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Additional checks for video files
    if (expectedMimeType.startsWith('video/')) {
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
        fileName: file.name,
        mimeType: expectedMimeType,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('File validation error:', error);
    return new Response(
      JSON.stringify({ error: 'File validation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});