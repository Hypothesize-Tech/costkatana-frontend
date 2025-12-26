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
  // Google-specific fields
  googleFileId?: string;
  connectionId?: string;
  webViewLink?: string;
  modifiedTime?: string;
  createdTime?: string;
}

export interface GoogleFileAttachment {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  modifiedTime?: string;
  createdTime?: string;
  size?: number;
  connectionId: string;
}

export const GOOGLE_FILE_TYPES = {
  DOCUMENT: 'application/vnd.google-apps.document',
  SPREADSHEET: 'application/vnd.google-apps.spreadsheet', 
  PRESENTATION: 'application/vnd.google-apps.presentation',
  FOLDER: 'application/vnd.google-apps.folder',
  FORM: 'application/vnd.google-apps.form',
} as const;

export type GoogleFileType = typeof GOOGLE_FILE_TYPES[keyof typeof GOOGLE_FILE_TYPES];

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

