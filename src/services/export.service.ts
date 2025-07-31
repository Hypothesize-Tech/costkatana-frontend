// src/services/export.service.ts
import api from "../config/api";

export type ExportFormat = "csv" | "json" | "pdf" | "xlsx";

interface ExportOptions {
  format: ExportFormat;
  startDate?: string;
  endDate?: string;
  filters?: Record<string, any>;
  includeMetadata?: boolean;
}

class ExportService {
  async exportUsageData(options: ExportOptions): Promise<Blob> {
    const response = await api.post("/export/usage", options, {
      responseType: "blob",
    });
    return this.processExportResponse(response.data, options.format, "usage");
  }

  async exportAnalytics(
    options: ExportOptions & {
      sections?: Array<"summary" | "trends" | "breakdown" | "insights">;
      includeCharts?: boolean;
    },
  ): Promise<Blob> {
    const response = await api.post("/export/analytics", options, {
      responseType: "blob",
    });
    return this.processExportResponse(
      response.data,
      options.format,
      "analytics",
    );
  }

  async exportOptimizations(
    options: ExportOptions & {
      applied?: boolean;
      minSavings?: number;
    },
  ): Promise<Blob> {
    const response = await api.post("/export/optimizations", options, {
      responseType: "blob",
    });
    return this.processExportResponse(
      response.data,
      options.format,
      "optimizations",
    );
  }

  async exportReport(
    type: "daily" | "weekly" | "monthly" | "custom",
    options?: {
      startDate?: string;
      endDate?: string;
      format?: ExportFormat;
      includeCharts?: boolean;
      sections?: string[];
    },
  ): Promise<Blob> {
    const response = await api.post(`/export/report/${type}`, options || {}, {
      responseType: "blob",
    });
    return this.processExportResponse(
      response.data,
      options?.format || "pdf",
      `${type}-report`,
    );
  }

  async exportInvoice(
    invoiceId: string,
    format: "pdf" | "csv" = "pdf",
  ): Promise<Blob> {
    const response = await api.get(`/export/invoice/${invoiceId}`, {
      params: { format },
      responseType: "blob",
    });
    return this.processExportResponse(
      response.data,
      format,
      `invoice-${invoiceId}`,
    );
  }

  async scheduledExport(config: {
    type: "usage" | "analytics" | "report";
    frequency: "daily" | "weekly" | "monthly";
    format: ExportFormat;
    email: string;
    filters?: Record<string, any>;
    time?: string; // HH:mm format
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
  }): Promise<{
    success: boolean;
    data: {
      id: string;
      nextRun: string;
      status: "active" | "paused";
    };
  }> {
    const response = await api.post("/export/schedule", config);
    return response.data;
  }

  async getScheduledExports(): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      type: string;
      frequency: string;
      format: string;
      email: string;
      nextRun: string;
      lastRun?: string;
      status: "active" | "paused" | "failed";
    }>;
  }> {
    const response = await api.get("/export/schedules");
    return response.data;
  }

  async deleteScheduledExport(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await api.delete(`/export/schedule/${id}`);
    return response.data;
  }

  private processExportResponse(
    data: Blob,
    format: ExportFormat,
    _defaultFilename: string,
  ): Blob {
    // Create a downloadable blob with appropriate MIME type
    const mimeTypes: Record<ExportFormat, string> = {
      csv: "text/csv",
      json: "application/json",
      pdf: "application/pdf",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };

    return new Blob([data], { type: mimeTypes[format] });
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  generateFilename(prefix: string, format: ExportFormat): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    return `${prefix}-${timestamp}.${format}`;
  }

  async getExportHistory(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<{
    success: boolean;
    data: {
      exports: Array<{
        id: string;
        type: string;
        format: string;
        createdAt: string;
        fileSize: number;
        status: "completed" | "failed";
        downloadUrl?: string;
        expiresAt?: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }> {
    const response = await api.get("/export/history", { params });
    return response.data;
  }
}

export const exportService = new ExportService();
