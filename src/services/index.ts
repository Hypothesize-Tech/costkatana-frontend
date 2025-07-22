// src/services/index.ts
export { authService } from './auth.service';
export { userService } from './user.service';
export { usageService } from './usage.service';
export { analyticsService } from './analytics.service';
export { optimizationService } from './optimization.service';
export { default as ExperimentationService } from './experimentation.service';

// Re-export types from services if needed
export type { default as api } from '../config/api';

export * from './intelligence.service';
export * from './project.service';
export * from './promptTemplate.service';
export { default as AdvancedMonitoringService } from './advancedMonitoring.service';