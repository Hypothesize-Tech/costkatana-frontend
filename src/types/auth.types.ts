export interface User {
  data(data: any): unknown;
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  emailVerified: boolean;
  subscription: Subscription;
  preferences: UserPreferences;
  usage: UserUsage;
  onboarding: {
    completed: boolean;
    completedAt?: string;
    skipped?: boolean;
    skippedAt?: string;
    projectCreated: boolean;
    firstLlmCall: boolean;
    stepsCompleted: string[];
  };
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
  company?: string;
}

export interface Subscription {
  plan: "free" | "pro" | "enterprise";
  startDate: string;
  endDate?: string;
  limits: {
    apiCalls: number;
    optimizations: number;
  };
  status?: string;
  currentPeriodEnd?: string;
}

export interface UserPreferences {
  emailAlerts: boolean;
  alertThreshold: number;
  optimizationSuggestions: boolean;
  timezone?: string;
}

export interface UserUsage {
  currentMonth: {
    apiCalls: number;
    totalCost: number;
    optimizationsSaved: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiKey {
  service: string;
  key?: string;
  maskedKey?: string;
  addedAt: string;
}
