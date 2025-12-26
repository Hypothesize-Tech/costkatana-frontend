/**
 * Device fingerprinting utility for consistent device identification
 * Helps maintain trust across minor browser updates and IP changes
 */

const DEVICE_ID_KEY = 'costkatana_device_id';
const DEVICE_FINGERPRINT_KEY = 'costkatana_device_fingerprint';

export interface DeviceFingerprint {
  id: string;
  fingerprint: string;
  created: number;
  browser: string;
  os: string;
}

/**
 * Generate a stable device fingerprint
 */
export function generateDeviceFingerprint(): DeviceFingerprint {
  const userAgent = navigator.userAgent;
  
  // Extract browser information (normalize versions to major releases)
  let browser = 'unknown';
  let browserVersion = '';
  
  if (userAgent.includes('Chrome/') && !userAgent.includes('Edg')) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    const majorVersion = match ? Math.floor(parseInt(match[1]) / 10) * 10 : '0';
    browser = 'chrome';
    browserVersion = majorVersion.toString();
  } else if (userAgent.includes('Firefox/')) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    const majorVersion = match ? Math.floor(parseInt(match[1]) / 5) * 5 : '0';
    browser = 'firefox';
    browserVersion = majorVersion.toString();
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    browser = 'safari';
    browserVersion = '1';
  } else if (userAgent.includes('Edg/')) {
    browser = 'edge';
    browserVersion = '1';
  }
  
  // Extract OS information
  let os = 'unknown';
  if (userAgent.includes('Windows')) os = 'windows';
  else if (userAgent.includes('Macintosh') || userAgent.includes('MacIntel')) os = 'macos';
  else if (userAgent.includes('Linux')) os = 'linux';
  else if (userAgent.includes('Android')) os = 'android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'ios';
  
  // Create stable fingerprint
  const fingerprint = `${browser}-${browserVersion}-${os}`;
  
  // Generate unique device ID (persisted in localStorage)
  const existingId = localStorage.getItem(DEVICE_ID_KEY);
  const id = existingId || generateRandomId();
  
  const deviceFingerprint: DeviceFingerprint = {
    id,
    fingerprint,
    created: Date.now(),
    browser: `${browser} ${browserVersion}`,
    os
  };
  
  // Store in localStorage for persistence
  localStorage.setItem(DEVICE_ID_KEY, id);
  localStorage.setItem(DEVICE_FINGERPRINT_KEY, JSON.stringify(deviceFingerprint));
  
  return deviceFingerprint;
}

/**
 * Get existing device fingerprint or create new one
 */
export function getDeviceFingerprint(): DeviceFingerprint {
  try {
    const stored = localStorage.getItem(DEVICE_FINGERPRINT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Verify the fingerprint is still valid (check if browser/OS changed significantly)
      const current = generateDeviceFingerprint();
      
      // If the core fingerprint matches, use stored ID
      if (parsed.fingerprint === current.fingerprint) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to read stored device fingerprint:', error);
  }
  
  // Generate new fingerprint
  return generateDeviceFingerprint();
}

/**
 * Clear device fingerprint (for debugging or manual logout)
 */
export function clearDeviceFingerprint(): void {
  localStorage.removeItem(DEVICE_ID_KEY);
  localStorage.removeItem(DEVICE_FINGERPRINT_KEY);
}

/**
 * Get device name for display purposes
 */
export function getDeviceName(): string {
  const fingerprint = getDeviceFingerprint();
  return `${fingerprint.browser} on ${fingerprint.os}`;
}

/**
 * Generate random device ID
 */
function generateRandomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if device fingerprint has changed significantly
 */
export function hasDeviceChanged(): boolean {
  try {
    const stored = localStorage.getItem(DEVICE_FINGERPRINT_KEY);
    if (!stored) return true;
    
    const parsed = JSON.parse(stored);
    const current = generateDeviceFingerprint();
    
    return parsed.fingerprint !== current.fingerprint;
  } catch (error) {
    console.warn('Failed to check device fingerprint:', error);
    return true;
  }
}
