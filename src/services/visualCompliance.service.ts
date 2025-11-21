import api from '../config/api';
import type {
  ComplianceCheckRequest,
  ComplianceCheckResponse,
  BatchComplianceRequest,
  BatchComplianceResponse,
  PresetsResponse,
  CostComparisonResponse,
  MetaPromptPresetsResponse,
  MetaPromptPresetResponse
} from '../types/visualCompliance.types';
import { 
  compressImageWithStats, 
  formatFileSize, 
  type CompressionResult 
} from '../utils/imageCompression.utils';

class VisualComplianceService {
  /**
   * Convert file to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Single compliance check
   */
  async checkCompliance(request: ComplianceCheckRequest): Promise<ComplianceCheckResponse> {
    try {
      const response = await api.post('/visual-compliance/check-optimized', request);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Failed to check compliance'
      );
    }
  }

  /**
   * Batch compliance checks
   */
  async batchCheck(requests: BatchComplianceRequest[]): Promise<BatchComplianceResponse> {
    try {
      const response = await api.post('/visual-compliance/batch', { requests });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Failed to process batch checks'
      );
    }
  }

  /**
   * Get quality presets
   */
  async getPresets(): Promise<PresetsResponse> {
    try {
      const response = await api.get('/visual-compliance/presets');
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to fetch presets');
    }
  }

  /**
   * Get cost comparison data
   */
  async getCostComparison(): Promise<CostComparisonResponse> {
    try {
      const response = await api.get('/visual-compliance/cost-comparison');
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to fetch cost comparison');
    }
  }

  /**
   * Get meta prompt presets (list)
   */
  async getMetaPromptPresets(): Promise<MetaPromptPresetsResponse> {
    try {
      const response = await api.get('/visual-compliance/meta-prompt-presets');
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to fetch meta prompt presets');
    }
  }

  /**
   * Get specific meta prompt preset by ID (includes full prompt)
   */
  async getMetaPromptPresetById(id: string): Promise<MetaPromptPresetResponse> {
    try {
      const response = await api.get(`/visual-compliance/meta-prompt-presets/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch preset: ${id}`);
    }
  }

  /**
   * Helper: Convert File to base64 for API with automatic compression
   */
  async prepareImageFile(file: File): Promise<string> {
    try {
      // Compress image first to reduce payload size
      const compressionResult = await compressImageWithStats(file, {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.85,
        maxSizeKB: 1024 // Target 1MB
      });

      // Log compression statistics
      console.log('Image compression:', {
        original: formatFileSize(compressionResult.originalSize),
        compressed: formatFileSize(compressionResult.compressedSize),
        ratio: `${(compressionResult.compressionRatio * 100).toFixed(1)}%`,
        dimensions: compressionResult.dimensions
      });

      // Convert compressed image to base64
      const base64 = await this.fileToBase64(compressionResult.file);

      // Validate base64 size (AWS Bedrock limit ~4MB for base64)
      const base64Size = base64.length;
      const maxBase64Size = 4 * 1024 * 1024; // 4MB

      if (base64Size > maxBase64Size) {
        console.error('Image too large after compression:', {
          base64Size: formatFileSize(base64Size),
          maxSize: formatFileSize(maxBase64Size),
          compressionRatio: compressionResult.compressionRatio
        });
        throw new Error(
          `Image too large (${formatFileSize(base64Size)}). Please use a smaller image or reduce quality.`
        );
      }

      console.log('Image prepared successfully:', {
        base64Size: formatFileSize(base64Size),
        compressionApplied: compressionResult.compressionRatio > 0
      });

      return base64;
    } catch (error: any) {
      console.error('Failed to prepare image:', error);
      throw new Error(error.message || 'Failed to prepare image for upload');
    }
  }

  /**
   * Get compression statistics for an image (without base64 conversion)
   */
  async getCompressionStats(file: File): Promise<CompressionResult> {
    return compressImageWithStats(file, {
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 0.85,
      maxSizeKB: 1024
    });
  }
}

export const visualComplianceService = new VisualComplianceService();

