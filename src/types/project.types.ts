export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: string;
  workspaceId: string;
  budget: ProjectBudget;
  spending: ProjectSpending;
  settings: ProjectSettings;
  tags: string[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  status?: "active" | "inactive" | "archived";
  department?: string;
  team?: string;
  usage?: {
    totalCost: number;
    totalRequests: number;
    totalTokens: number;
  };
}

export interface ProjectBudget {
  amount: number;
  currency: string;
  spent?: number;
  period: "monthly" | "quarterly" | "yearly" | "one-time";
  startDate?: Date | string;
  alerts: Array<{
    threshold: number;
    type: "email" | "in-app" | "both";
    recipients: string[];
    enabled?: boolean;
  }>;
}

export interface ProjectSpending {
  current: number;
  previous: number;
  breakdown: {
    service: string;
    amount: number;
    percentage: number;
  }[];
}

export interface ProjectSettings {
  costOptimization: {
    enabled: boolean;
    autoApply: boolean;
    strategies: string[];
    level?: "Low" | "Medium" | "High";
  };
  notifications: {
    budgetAlerts: boolean;
    monthlyReports: boolean;
    usageReports?: boolean;
  };
  requireApprovalAbove?: number;
  allowedModels?: string[];
  maxTokensPerRequest?: number;
  enablePromptLibrary?: boolean;
  enableCostAllocation?: boolean;
}

export interface ProjectStats {
  totalProjects: number;
  totalBudget: number;
  totalSpent: number;
  averageSpending: number;
  projectsOverBudget: number;
}

export interface ProjectActivity {
  _id: string;
  projectId: string;
  userId: string;
  type:
    | "budget_updated"
    | "settings_changed"
    | "spending_alert"
    | "api_request";
  description: string;
  metadata: any;
  createdAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  budget: {
    amount: number;
    period: "monthly" | "yearly";
    alerts: {
      enabled: boolean;
      thresholds: number[];
    };
  };
  tags: string[];
  settings: {
    costOptimization: {
      enabled: boolean;
      autoApply: boolean;
      strategies: string[];
    };
    notifications: {
      budgetAlerts: boolean;
      monthlyReports: boolean;
    };
  };
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  budget?: Partial<ProjectBudget>;
  settings?: Partial<ProjectSettings>;
  tags?: string[];
  isActive?: boolean;
  status?: "active" | "inactive" | "archived";
}

export interface ProjectDashboard {
  project: Project;
  recentActivity: ProjectActivity[];
  costTrends: {
    date: string;
    amount: number;
  }[];
}

export interface BudgetAlert {
  _id: string;
  projectId: string;
  type: "threshold_reached" | "budget_exceeded" | "unusual_spending";
  threshold: number;
  currentSpending: number;
  message: string;
  createdAt: string;
  acknowledged: boolean;
}
