import api from '../config/api';
import type {
  ComplianceCheckRequest,
  ComplianceCheckResponse,
  BatchComplianceRequest,
  BatchComplianceResponse,
  PresetsResponse,
  CostComparisonResponse
} from '../types/visualCompliance.types';

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
   * Helper: Convert File to base64 for API
   */
  async prepareImageFile(file: File): Promise<string> {
    return this.fileToBase64(file);
  }
}

export const visualComplianceService = new VisualComplianceService();

