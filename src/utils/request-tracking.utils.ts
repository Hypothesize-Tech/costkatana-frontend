/**
 * Utilities to capture client-side network/performance data for optimization requests.
 * Merges with server-captured requestTracking to provide richer diagnostics.
 */

import type { OptimizationRequestTracking } from '@/types/optimization.types';

/**
 * Client info available before the request (no timing).
 * Use when creating optimizations to enrich server-captured requestTracking.
 */
export function getClientRequestTrackingInfo(): Partial<OptimizationRequestTracking> {
  return {
    clientInfo: {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      environment: typeof window !== 'undefined' ? 'browser' : 'unknown',
    },
  };
}

/**
 * Captures performance metrics for client-side request timing.
 * Call at the start of a request; use in buildClientRequestTracking after completion.
 */
export function captureClientPerformanceStart(): { startTime: number } {
  return { startTime: typeof performance !== 'undefined' ? performance.now() : Date.now() };
}

/**
 * Builds requestTracking with client-measured timing. Call after the API request completes.
 */
export function buildClientRequestTracking(
  start: { startTime: number },
): Partial<OptimizationRequestTracking> {
  const elapsed =
    (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start.startTime;
  return {
    ...getClientRequestTrackingInfo(),
    performance: {
      totalRoundTripTime: Math.round(elapsed),
      networkTime: Math.round(elapsed),
    },
  };
}
