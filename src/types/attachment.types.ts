export interface MessageAttachment {
  type: 'uploaded' | 'google';
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileType: string;
  url: string;
  extractedText?: string;
  extractedAt?: Date;
}

export interface UploadedFileResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileType: string;
  url: string;
  extractedText?: string;
  hasExtractedText: boolean;
  uploadedAt: Date;
}

export interface FileUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  result?: UploadedFileResponse;
}

