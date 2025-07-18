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
  const maxVideoSize = 100 * 1024 * 1024; // 100MB
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

  // Check for suspicious file names
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.vbs', '.js', '.jar'];
  const fileName = file.name.toLowerCase();
  
  if (suspiciousExtensions.some(ext => fileName.includes(ext))) {
    return { valid: false, error: 'File name contains suspicious extension' };
  }

  // Warn about large files
  if (file.size > 50 * 1024 * 1024) {
    warnings.push('Large file size may take longer to upload and process');
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
    console.error('File validation error:', error);
    return { valid: false, error: 'File validation service unavailable. Please try again.' };
  }
}

export function sanitizeFileName(fileName: string): string {
  // Remove potentially dangerous characters and patterns
  return fileName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') // Remove invalid characters
    .replace(/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, '_reserved_') // Windows reserved names
    .replace(/\.(exe|bat|cmd|scr|pif|com|vbs|js|jar)$/i, '.safe') // Change dangerous extensions
    .replace(/_{2,}/g, '_') // Replace multiple underscores
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .substring(0, 255) // Limit length
    .toLowerCase();
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}