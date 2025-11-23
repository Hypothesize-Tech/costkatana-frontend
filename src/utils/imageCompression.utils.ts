/**
 * Image Compression Utility
 * 
 * Compresses images on the client side before uploading to reduce payload size
 * and prevent AWS Bedrock base64 validation errors.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
  mimeType?: string;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dimensions: {
    original: { width: number; height: number };
    compressed: { width: number; height: number };
  };
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.85,
  maxSizeKB: 1024, // 1MB target
  mimeType: 'image/jpeg'
};

/**
 * Load an image file and return an HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Calculate dimensions maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;
  
  // Scale down if larger than max dimensions
  if (width > maxWidth || height > maxHeight) {
    const aspectRatio = width / height;
    
    if (width > height) {
      width = maxWidth;
      height = Math.round(width / aspectRatio);
    } else {
      height = maxHeight;
      width = Math.round(height * aspectRatio);
    }
    
    // Ensure both dimensions are within limits
    if (width > maxWidth) {
      width = maxWidth;
      height = Math.round(width / aspectRatio);
    }
    if (height > maxHeight) {
      height = maxHeight;
      width = Math.round(height * aspectRatio);
    }
  }
  
  return { width, height };
}

/**
 * Compress image using Canvas API
 */
async function compressImageToCanvas(
  img: HTMLImageElement,
  options: Required<CompressionOptions>
): Promise<Blob> {
  const { width, height } = calculateDimensions(
    img.width,
    img.height,
    options.maxWidth,
    options.maxHeight
  );
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Draw image on canvas
  ctx.drawImage(img, 0, 0, width, height);
  
  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      options.mimeType,
      options.quality
    );
  });
}

/**
 * Convert blob to File
 */
function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
}

/**
 * Compress image with progressive quality reduction if needed
 */
export async function compressImage(
  file: File,
  userOptions?: CompressionOptions
): Promise<CompressionResult> {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };
  const originalSize = file.size;
  
  // Load image
  const img = await loadImage(file);
  const originalDimensions = { width: img.width, height: img.height };
  
  // Calculate target dimensions
  const targetDimensions = calculateDimensions(
    img.width,
    img.height,
    options.maxWidth,
    options.maxHeight
  );
  
  let quality = options.quality;
  let compressedBlob: Blob;
  let attempts = 0;
  const maxAttempts = 5;
  const targetSizeBytes = options.maxSizeKB * 1024;
  
  // Progressive quality reduction loop
  do {
    attempts++;
    compressedBlob = await compressImageToCanvas(img, {
      ...options,
      quality
    });
    
    // If size is acceptable, break
    if (compressedBlob.size <= targetSizeBytes || attempts >= maxAttempts) {
      break;
    }
    
    // Reduce quality for next attempt
    quality = Math.max(0.5, quality - 0.1);
  } while (compressedBlob.size > targetSizeBytes && attempts < maxAttempts);
  
  // Generate filename
  const originalName = file.name.replace(/\.[^/.]+$/, '');
  const extension = options.mimeType.split('/')[1];
  const filename = `${originalName}_compressed.${extension}`;
  
  // Convert to File
  const compressedFile = blobToFile(compressedBlob, filename);
  const compressedSize = compressedFile.size;
  
  return {
    file: compressedFile,
    originalSize,
    compressedSize,
    compressionRatio: originalSize > 0 ? (1 - compressedSize / originalSize) : 0,
    dimensions: {
      original: originalDimensions,
      compressed: targetDimensions
    }
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file needs compression
 */
export function needsCompression(file: File, maxSizeKB: number = 1024): boolean {
  return file.size > maxSizeKB * 1024;
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.' };
  }
  
  // Check file size (max 20MB original)
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Maximum size is ${formatFileSize(maxSize)}.` };
  }
  
  return { valid: true };
}

/**
 * Compress image and return statistics
 */
export async function compressImageWithStats(
  file: File,
  options?: CompressionOptions
): Promise<CompressionResult> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Check if compression is needed
  const targetSize = options?.maxSizeKB || DEFAULT_OPTIONS.maxSizeKB;
  if (!needsCompression(file, targetSize)) {
    // File is already small enough, return as-is with stats
    const img = await loadImage(file);
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
      dimensions: {
        original: { width: img.width, height: img.height },
        compressed: { width: img.width, height: img.height }
      }
    };
  }
  
  // Compress image
  return compressImage(file, options);
}

