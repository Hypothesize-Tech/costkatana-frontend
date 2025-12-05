import * as Sentry from '@sentry/react';
import { Replay } from '@sentry/replay';
import { useEffect } from 'react';
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom';

// Environment variables for Sentry configuration
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const SENTRY_ENVIRONMENT = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE || 'development';
const SENTRY_RELEASE = import.meta.env.VITE_SENTRY_RELEASE || import.meta.env.npm_package_version;
const SENTRY_SAMPLE_RATE = parseFloat(import.meta.env.VITE_SENTRY_SAMPLE_RATE || '1.0');
const SENTRY_TRACES_SAMPLE_RATE = parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1');
const SENTRY_REPLAYS_SAMPLE_RATE = parseFloat(import.meta.env.VITE_SENTRY_REPLAYS_SAMPLE_RATE || '0.1');
const SENTRY_DEBUG = import.meta.env.VITE_SENTRY_DEBUG === 'true';

// Performance monitoring configuration
const SENTRY_ENABLE_PERFORMANCE_MONITORING = import.meta.env.VITE_SENTRY_ENABLE_PERFORMANCE_MONITORING !== 'false';
const SENTRY_ENABLE_SESSION_REPLAY = import.meta.env.VITE_SENTRY_ENABLE_SESSION_REPLAY !== 'false';

// Custom Sentry configuration for React
export const sentryReactConfig = {
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,
  release: SENTRY_RELEASE,
  sampleRate: SENTRY_SAMPLE_RATE,
  tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
  replaysSessionSampleRate: SENTRY_REPLAYS_SAMPLE_RATE,
  replaysOnErrorSampleRate: 1.0, // Always capture replays for errors
  debug: SENTRY_DEBUG,
  enablePerformanceMonitoring: SENTRY_ENABLE_PERFORMANCE_MONITORING,
  enableSessionReplay: SENTRY_ENABLE_SESSION_REPLAY,
};

/**
 * Initialize Sentry for React application
 */
export function initializeSentryReact(): void {
  // Skip initialization if DSN is not provided
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not provided. Skipping Sentry initialization.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: SENTRY_RELEASE,
    sampleRate: SENTRY_SAMPLE_RATE,
    debug: SENTRY_DEBUG,

    // Performance monitoring
    tracesSampleRate: SENTRY_ENABLE_PERFORMANCE_MONITORING ? SENTRY_TRACES_SAMPLE_RATE : 0,

    // Session replay
    replaysSessionSampleRate: SENTRY_ENABLE_SESSION_REPLAY ? SENTRY_REPLAYS_SAMPLE_RATE : 0,
    replaysOnErrorSampleRate: SENTRY_ENABLE_SESSION_REPLAY ? 1.0 : 0,

    integrations: [
      // React Router v6 integration
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),

      // Session Replay integration
      ...(SENTRY_ENABLE_SESSION_REPLAY ? [
        new Replay({
          // Capture 10 minutes of events before an error occurs
          blockAllMedia: false,
          // Capture console logs as breadcrumbs
          maskAllText: true,
          maskAllInputs: true,
          // Capture network requests
          networkDetailAllowUrls: [
            window.location.origin,
            /^https:\/\/api\.costkatana\.com/,
          ],
          networkCaptureBodies: true,
          networkRequestHeaders: ['User-Agent'],
          networkResponseHeaders: ['Content-Type'],
        })
      ] : []),
    ],

    // Before sending events, filter and enrich them
    beforeSend: (event, hint) => {
      return beforeSendHook(event, hint) as Sentry.ErrorEvent | null;
    },

    // Global context and tags
    initialScope: {
      tags: {
        component: 'frontend',
        framework: 'react',
        bundler: 'vite',
        service: 'cost-katana-frontend',
        version: SENTRY_RELEASE,
      },
      contexts: {
        runtime: {
          name: 'browser',
          version: navigator.userAgent,
        },
        application: {
          name: 'Cost Katana Frontend',
          version: SENTRY_RELEASE,
          environment: SENTRY_ENVIRONMENT,
        },
        browser: {
          name: navigator.userAgent,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }
      }
    },

    // Error sampling and filtering
    ignoreErrors: [
      // Ignore common harmless errors
      'Non-Error promise rejection captured',
      'Loading chunk',
      'Loading CSS chunk',
      'Script error',
      'Network Error',
      'Request aborted',
      'cancelled',
      // React-specific errors to ignore
      'Cannot read properties of null (reading \'useState\')',
      'Cannot read properties of undefined (reading \'useState\')',
      // Ignore errors from external scripts
      'Script error.',
      'TypeError: null is not an object (evaluating \'document.body\')',
    ],

    // Ignore specific URLs for error tracking
    denyUrls: [
      // Development and testing URLs
      /localhost/,
      /127\.0\.0\.1/,
      /0\.0\.0\.0/,
      // Third-party scripts
      /googletagmanager\.com/,
      /google-analytics\.com/,
      /googlesyndication\.com/,
      /doubleclick\.net/,
      /facebook\.com/,
      /facebook\.net/,
      /twitter\.com/,
      /linkedin\.com/,
      /hotjar\.com/,
      /mixpanel\.com/,
      // CDN and external resources
      /cdn\./,
      /jsdelivr\.net/,
      /unpkg\.com/,
      /cdnjs\.cloudflare\.com/,
    ],

    // React-specific configuration
    attachStacktrace: true,
    normalizeDepth: 6,
    maxValueLength: 1000,

    // Max breadcrumbs to keep
    maxBreadcrumbs: 100,
  });

  console.log(`✅ Sentry React initialized for environment: ${SENTRY_ENVIRONMENT}, release: ${SENTRY_RELEASE}`);
}

/**
 * Hook to filter and enrich events before sending to Sentry
 */
function beforeSendHook(event: Sentry.Event, hint: Sentry.EventHint): Sentry.Event | null {
  // Skip events in development unless explicitly enabled
  if (SENTRY_ENVIRONMENT === 'development' && !SENTRY_DEBUG) {
    return null;
  }

  // Filter out health check and development errors
  if (event.request?.url?.includes('/health') || event.request?.url?.includes('/favicon.ico')) {
    return null;
  }

  // Filter out errors from external domains
  if (event.request?.url && !event.request.url.includes(window.location.origin)) {
    // Only capture external errors in production
    if (SENTRY_ENVIRONMENT !== 'production') {
      return null;
    }
  }

  // Enrich event with React-specific context
  event.tags = {
    ...event.tags,
    'react.version': React.version,
    'browser.name': getBrowserName(),
    'browser.version': getBrowserVersion(),
    'platform': navigator.platform,
    'viewport.width': window.innerWidth,
    'viewport.height': window.innerHeight,
  };

  // Add React component stack if available
  if ((hint as any).captureContext?.componentStack) {
    event.contexts = {
      ...event.contexts,
      react: {
        componentStack: (hint as any).captureContext.componentStack,
      }
    };
  }

  // Add custom fingerprinting for better error grouping
  if (event.exception) {
    const exception = event.exception.values?.[0];
    if (exception?.stacktrace?.frames) {
      event.fingerprint = generateCustomFingerprint(event);
    }
  }

  return event;
}

/**
 * Generate custom fingerprint for better error grouping in React
 */
function generateCustomFingerprint(event: Sentry.Event): string[] {
  const exception = event.exception?.values?.[0];
  const message = exception?.value || '';
  const stacktrace = exception?.stacktrace;

  const fingerprint = ['{{ default }}'];

  // Custom fingerprinting based on error patterns
  if (message.includes('useState')) {
    fingerprint.push('react-hook-error');
  } else if (message.includes('useEffect')) {
    fingerprint.push('react-effect-error');
  } else if (message.includes('Cannot read properties of null')) {
    fingerprint.push('null-reference-error');
  } else if (message.includes('Network Error') || message.includes('fetch')) {
    fingerprint.push('network-error');
  } else if (message.includes('ChunkLoadError') || message.includes('Loading chunk')) {
    fingerprint.push('chunk-load-error');
  }

  // Add component information if available
  if (stacktrace?.frames) {
    const reactFrame = stacktrace.frames.find(frame =>
      frame.filename?.includes('.tsx') ||
      frame.filename?.includes('.jsx') ||
      frame.function?.includes('React')
    );
    if (reactFrame?.filename) {
      fingerprint.push(reactFrame.filename);
    }
  }

  return fingerprint;
}

/**
 * Set user context for error tracking in React
 */
export function setUserContext(user: {
  id?: string;
  email?: string;
  username?: string;
  role?: string;
  organization?: string;
}): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    organization: user.organization,
  });

  // Add user tags for better filtering
  Sentry.setTag('user.id', user.id || 'anonymous');
  Sentry.setTag('user.role', user.role || 'unknown');
  Sentry.setTag('user.organization', user.organization || 'unknown');
}

/**
 * Set React component context for error tracking
 */
export function setComponentContext(component: {
  name?: string;
  props?: Record<string, any>;
  state?: Record<string, any>;
}): void {
  Sentry.setContext('react_component', {
    name: component.name,
    props: sanitizeObject(component.props),
    state: sanitizeObject(component.state),
  });
}

/**
 * Set route context for navigation tracking
 */
export function setRouteContext(route: {
  path?: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
  component?: string;
}): void {
  Sentry.setContext('route', {
    path: route.path,
    params: route.params,
    query: route.query,
    component: route.component,
  });

  // Set route tags
  if (route.path) Sentry.setTag('route.path', route.path);
  if (route.component) Sentry.setTag('route.component', route.component);
}

/**
 * Add custom breadcrumb for React component actions
 */
export function addBreadcrumb(message: string, category: string, level: Sentry.SeverityLevel = 'info', data?: any): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data: sanitizeObject(data),
    timestamp: Date.now() / 1000,
  });
}

/**
 * Capture custom error with React context
 */
export function captureError(error: Error, context?: {
  user?: any;
  component?: any;
  route?: any;
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}): void {
  // Set contexts before capturing
  if (context?.user) setUserContext(context.user);
  if (context?.component) setComponentContext(context.component);
  if (context?.route) setRouteContext(context.route);

  // Set additional tags
  if (context?.tags) {
    Object.entries(context.tags).forEach(([key, value]) => {
      Sentry.setTag(key, value);
    });
  }

  // Set extra data
  if (context?.extra) {
    Sentry.setContext('extra', sanitizeObject(context.extra));
  }

  // Capture the error
  Sentry.captureException(error);

  // Clear sensitive contexts after capturing
  Sentry.setUser(null);
  Sentry.setContext('react_component', null);
  Sentry.setContext('route', null);
  Sentry.setContext('extra', null);
}

/**
 * Performance monitoring for React components
 */
export function startPerformanceSpan(name: string, op: string) {
  return Sentry.startSpan({
    name,
    op,
  }, (span) => {
    return span;
  });
}

/**
 * Track React component interactions
 */
export function trackComponentInteraction(componentName: string, action: string, data?: any): void {
  addBreadcrumb(
    `Component interaction: ${componentName}.${action}`,
    'ui.interaction',
    'info',
    {
      component: componentName,
      action,
      ...sanitizeObject(data)
    }
  );
}

/**
 * Track user navigation
 */
export function trackNavigation(from: string, to: string, method: 'push' | 'replace' | 'pop' = 'push'): void {
  addBreadcrumb(
    `Navigation: ${from} → ${to}`,
    'navigation',
    'info',
    {
      from,
      to,
      method
    }
  );

  // Update route context
  setRouteContext({ path: to });
}

/**
 * Sanitize object to remove sensitive information
 * Handles circular references to prevent stack overflow
 */
function sanitizeObject(obj: any, visited: WeakSet<object> = new WeakSet()): any {
  if (!obj || typeof obj !== 'object') return obj;

  // Handle circular references
  if (visited.has(obj)) {
    return '[Circular Reference]';
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    visited.add(obj);
    const sanitized = obj.map(item => sanitizeObject(item, visited));
    visited.delete(obj);
    return sanitized;
  }
  
  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  // Handle other objects
  visited.add(obj);
  const sanitized: Record<string, any> = {};

  // Remove sensitive fields
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'apiKey', 'authToken',
    'authorization', 'cookie', 'sessionId', 'creditCard', 'ssn'
  ];

  Object.keys(obj).forEach(key => {
    // Skip sensitive fields
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
      return;
    }

  // Recursively sanitize nested objects
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitized[key] = sanitizeObject(obj[key], visited);
    } else {
      sanitized[key] = obj[key];
    }
  });

  visited.delete(obj);
  return sanitized;
}

/**
 * Get browser name from user agent
 */
function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Opera')) return 'Opera';
  return 'Unknown';
}

/**
 * Get browser version from user agent
 */
function getBrowserVersion(): string {
  const ua = navigator.userAgent;
  const match = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/(\d+\.\d+)/);
  return match ? match[2] : 'Unknown';
}

/**
 * Check if Sentry is enabled and properly configured
 */
export function isSentryEnabled(): boolean {
  return !!SENTRY_DSN && !!Sentry.getCurrentScope();
}

/**
 * Get current Sentry configuration (for debugging)
 */
export function getSentryConfig(): typeof sentryReactConfig {
  return { ...sentryReactConfig };
}


/**
 * Export utility functions for testing
 */
export { Sentry };

// Import React for version detection
import React from 'react';
