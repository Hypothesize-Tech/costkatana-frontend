export * from "./analytics.types";
export * from "./auth.types";
export * from "./optimization.types";
export * from "./usage.types";
export * from "./intelligence.types";
export * from "./project.types";

// Common types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ApiError[];
}

export interface ApiError {
  field?: string;
  message: string;
}

export interface Alert {
  _id: string;
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  data?: Record<string, any>;
  sent: boolean;
  sentAt?: string;
  read: boolean;
  readAt?: string;
  actionRequired: boolean;
  actionTaken?: boolean;
  actionTakenAt?: string;
  actionDetails?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AlertType =
  | "cost_threshold"
  | "usage_spike"
  | "optimization_available"
  | "weekly_summary"
  | "monthly_summary"
  | "error_rate";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface SortConfig {
  field: string;
  order: "asc" | "desc";
}
