import { apiClient } from "@/config/api";


class UploadService {
  async uploadUsageFile(
    file: File,
    options?: {
      service?: string;
      format?: "csv" | "json" | "xlsx";
      dateColumn?: string;
      costColumn?: string;
    },
  ): Promise<{
    success: boolean;
    data: {
      processed: number;
      imported: number;
      failed: number;
      errors: Array<{
        row: number;
        error: string;
        data?: any;
      }>;
      summary: {
        totalCost: number;
        dateRange: {
          start: string;
          end: string;
        };
        services: Record<string, number>;
      };
    };
  }> {
    const formData = new FormData();
    formData.append("file", file);

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value) formData.append(key, value.toString());
      });
    }

    const response = await apiClient.post("/upload/usage", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1),
        );
        // You can emit progress events here
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });

    return response.data;
  }

  async uploadOptimizationFile(
    file: File,
    options?: {
      format?: "csv" | "json";
      hasHeaders?: boolean;
    },
  ): Promise<{
    success: boolean;
    data: {
      processed: number;
      optimized: number;
      failed: number;
      totalSavings: number;
      results: Array<{
        prompt: string;
        status: "success" | "failed";
        savings?: number;
        error?: string;
      }>;
    };
  }> {
    const formData = new FormData();
    formData.append("file", file);

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.post("/upload/optimization", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  async validateFile(
    file: File,
    type: "usage" | "optimization",
  ): Promise<{
    success: boolean;
    data: {
      valid: boolean;
      format: string;
      rows: number;
      columns: string[];
      errors: string[];
      warnings: string[];
      preview: any[];
    };
  }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await apiClient.post("/upload/validate", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  async getUploadHistory(params?: {
    page?: number;
    limit?: number;
    type?: "usage" | "optimization";
    status?: "success" | "partial" | "failed";
  }): Promise<{
    success: boolean;
    data: {
      uploads: Array<{
        id: string;
        filename: string;
        type: string;
        status: string;
        processedAt: string;
        rowsProcessed: number;
        rowsImported: number;
        rowsFailed: number;
        fileSize: number;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }> {
    const response = await apiClient.get("/upload/history", { params });
    return response.data;
  }

  async downloadTemplate(
    type: "usage" | "optimization",
    format: "csv" | "xlsx" = "csv",
  ): Promise<Blob> {
    const response = await apiClient.get(`/upload/template/${type}`, {
      params: { format },
      responseType: "blob",
    });

    return response.data;
  }

  async getUploadStatus(uploadId: string): Promise<{
    success: boolean;
    data: {
      id: string;
      status: "processing" | "completed" | "failed";
      progress: number;
      processed: number;
      total: number;
      errors: string[];
      completedAt?: string;
    };
  }> {
    const response = await apiClient.get(`/upload/status/${uploadId}`);
    return response.data;
  }

  getAcceptedFormats(type: "usage" | "optimization"): string {
    const formats = {
      usage: ".csv,.xlsx,.xls,.json",
      optimization: ".csv,.json,.txt",
    };
    return formats[type] || ".csv,.json";
  }

  getMaxFileSize(): number {
    return 10 * 1024 * 1024; // 10MB
  }

  validateFileSize(file: File): boolean {
    return file.size <= this.getMaxFileSize();
  }

  validateFileType(file: File, type: "usage" | "optimization"): boolean {
    const acceptedFormats = this.getAcceptedFormats(type).split(",");
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    return acceptedFormats.includes(fileExtension);
  }
}

export const uploadService = new UploadService();
