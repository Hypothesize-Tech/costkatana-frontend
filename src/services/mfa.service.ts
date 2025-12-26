import api from '@/config/api';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create a special API instance for MFA operations during login
const createMFAApi = (mfaToken: string) => {
  return axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${mfaToken}`,
    },
  });
};

export interface MFAStatus {
  enabled: boolean;
  methods: Array<'email' | 'totp'>;
  email: {
    enabled: boolean;
  };
  totp: {
    enabled: boolean;
    hasBackupCodes: boolean;
  };
  trustedDevices: Array<{
    deviceId: string;
    deviceName: string;
    lastUsed: string;
    expiresAt: string;
  }>;
}

export interface TOTPSetupResult {
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MFAVerificationResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
    subscription: any;
  };
  accessToken: string;
  refreshToken: string;
  trustedDevice?: boolean;
}

export class MFAService {
  /**
   * Get MFA status for current user
   */
  static async getStatus(): Promise<MFAStatus> {
    try {
      const response = await api.get('/mfa/status');
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please log in to access MFA settings');
      }
      throw error;
    }
  }

  /**
   * Setup TOTP (authenticator app)
   */
  static async setupTOTP(email: string): Promise<TOTPSetupResult> {
    const response = await api.post('/mfa/totp/setup', { email });
    return response.data.data;
  }

  /**
   * Verify TOTP token and enable TOTP MFA
   */
  static async verifyAndEnableTOTP(token: string): Promise<void> {
    await api.post('/mfa/totp/verify', { token });
  }

  /**
   * Send email MFA code
   */
  static async sendEmailCode(mfaToken?: string): Promise<void> {
    try {
      const apiInstance = mfaToken ? createMFAApi(mfaToken) : api;
      await apiInstance.post('/mfa/email/send-code');
    } catch (error: any) {
      console.log("errorerror", error.response?.data?.message)
      if (error.response?.status === 401) {
        throw new Error('Please log in to send email verification codes');
      }
      throw error;
    }
  }

  /**
   * Verify email code and enable email MFA
   */
  static async verifyAndEnableEmailMFA(code: string): Promise<void> {
    await api.post('/mfa/email/verify', { code });
  }

  /**
   * Verify MFA during login
   */
  static async verifyMFA(
    mfaToken: string,
    method: 'email' | 'totp',
    code: string,
    rememberDevice?: boolean,
    deviceName?: string
  ): Promise<MFAVerificationResult> {
    const mfaApi = createMFAApi(mfaToken);
    const response = await mfaApi.post('/mfa/verify', {
      mfaToken,
      method,
      code,
      rememberDevice,
      deviceName,
    });
    return response.data.data;
  }

  /**
   * Disable MFA method
   */
  static async disableMFA(method: 'email' | 'totp'): Promise<void> {
    await api.post('/mfa/disable', { method });
  }

  /**
   * Add trusted device
   */
  static async addTrustedDevice(deviceName: string): Promise<{ deviceId: string; deviceName: string }> {
    const response = await api.post('/mfa/trusted-devices/add', { deviceName });
    return response.data.data;
  }

  /**
   * Remove trusted device
   */
  static async removeTrustedDevice(deviceId: string): Promise<void> {
    await api.delete('/mfa/trusted-devices/remove', {
      data: { deviceId },
    });
  }

  /**
   * Check if current device is trusted
   */
  static async checkTrustedDevice(): Promise<{ deviceId: string; isTrusted: boolean }> {
    const response = await api.get('/mfa/trusted-devices/check');
    return response.data.data;
  }

  /**
   * Get device trust status with additional context
   */
  static async getDeviceTrustStatus(): Promise<{ 
    isTrusted: boolean; 
    deviceId: string; 
    deviceName?: string; 
    expiresAt?: string;
    lastUsed?: string;
  }> {
    try {
      const result = await this.checkTrustedDevice();
      const status = await this.getStatus();
      
      if (result.isTrusted && status.trustedDevices) {
        const trustedDevice = status.trustedDevices.find(d => d.deviceId === result.deviceId);
        return {
          isTrusted: true,
          deviceId: result.deviceId,
          deviceName: trustedDevice?.deviceName,
          expiresAt: trustedDevice?.expiresAt,
          lastUsed: trustedDevice?.lastUsed
        };
      }
      
      return {
        isTrusted: false,
        deviceId: result.deviceId
      };
    } catch (error) {
      console.warn('Failed to get device trust status:', error);
      // If check fails, assume not trusted
      return {
        isTrusted: false,
        deviceId: 'unknown'
      };
    }
  }

  /**
   * Request email MFA code during login
   */
  static async requestEmailCode(mfaToken: string): Promise<void> {
    // Use the mfaToken for authentication during login flow
    await this.sendEmailCode(mfaToken);
  }
}

