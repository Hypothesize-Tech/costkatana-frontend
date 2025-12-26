import axios from 'axios';
import { UploadedFileResponse } from '../types/attachment.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class FileUploadService {
  /**
   * Upload a file
   */
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadedFileResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('access_token');

    const response = await axios.post<{ success: boolean; data: UploadedFileResponse }>(
      `${API_BASE_URL}/files/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      }
    );

    if (!response.data.success) {
      throw new Error('File upload failed');
    }

    return response.data.data;
  }


  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<void> {
    const token = localStorage.getItem('access_token');

    const response = await axios.delete<{ success: boolean }>(
      `${API_BASE_URL}/files/${fileId}`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.data.success) {
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get user's uploaded files
   */
  async getUserFiles(conversationId?: string): Promise<UploadedFileResponse[]> {
    const token = localStorage.getItem('access_token');

    const response = await axios.get<{ success: boolean; data: UploadedFileResponse[] }>(
      `${API_BASE_URL}/files`,
      {
        params: { conversationId },
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.data.success) {
      throw new Error('Failed to get user files');
    }

    return response.data.data;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Get icon name for file type
   */
  getFileIcon(fileType: string): string {
    const iconMap: Record<string, string> = {
      pdf: 'DocumentTextIcon',
      docx: 'DocumentTextIcon',
      doc: 'DocumentTextIcon',
      xlsx: 'TableCellsIcon',
      xls: 'TableCellsIcon',
      csv: 'TableCellsIcon',
      txt: 'DocumentIcon',
      md: 'DocumentIcon',
      js: 'CodeBracketIcon',
      ts: 'CodeBracketIcon',
      tsx: 'CodeBracketIcon',
      jsx: 'CodeBracketIcon',
      py: 'CodeBracketIcon',
      java: 'CodeBracketIcon',
      cpp: 'CodeBracketIcon',
      c: 'CodeBracketIcon',
      jpg: 'PhotoIcon',
      jpeg: 'PhotoIcon',
      png: 'PhotoIcon',
      gif: 'PhotoIcon',
      webp: 'PhotoIcon',
      svg: 'PhotoIcon',
      zip: 'ArchiveBoxIcon',
      rar: 'ArchiveBoxIcon',
      tar: 'ArchiveBoxIcon',
      gz: 'ArchiveBoxIcon',
      mp4: 'VideoCameraIcon',
      mov: 'VideoCameraIcon',
      avi: 'VideoCameraIcon',
      mp3: 'MusicalNoteIcon',
      wav: 'MusicalNoteIcon',
    };

    return iconMap[fileType.toLowerCase()] || 'DocumentIcon';
  }
}

export const fileUploadService = new FileUploadService();

