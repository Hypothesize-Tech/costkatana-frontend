import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  QrCodeIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { MFAService, MFAStatus } from '../../services/mfa.service';
import { useAuth } from '../../hooks';

interface MFASetupProps {
  onStatusChange?: () => void;
}

export const MFASetup: React.FC<MFASetupProps> = ({ onStatusChange }) => {
  const { user } = useAuth();
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupMode, setSetupMode] = useState<'none' | 'email' | 'totp'>('none');

  // TOTP Setup State
  const [totpSetup, setTotpSetup] = useState<{
    qrCodeUrl: string;
    backupCodes: string[];
  } | null>(null);
  const [totpToken, setTotpToken] = useState('');
  const [isSettingUpTotp, setIsSettingUpTotp] = useState(false);

  // Email Setup State
  const [emailCode, setEmailCode] = useState('');
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [isSettingUpEmail, setIsSettingUpEmail] = useState(false);
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);

  // General State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if user is authenticated before loading MFA status
    if (user) {
      loadMFAStatus();
    } else {
      setError('Please log in to manage MFA settings');
      setLoading(false);
    }
  }, [user]);

  const loadMFAStatus = async () => {
    try {
      setLoading(true);
      console.log('Loading MFA status...');
      const status = await MFAService.getStatus();
      console.log('MFA status loaded:', status);
      setMfaStatus(status);
    } catch (error: any) {
      console.error('Failed to load MFA status:', error);
      setError(error.response?.data?.message || 'Failed to load MFA status');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupTOTP = async () => {
    try {
      setIsSettingUpTotp(true);
      setError('');

      // Get user email from auth context
      const userEmail = user?.email || localStorage.getItem('userEmail') || 'user@example.com';
      console.log('Setting up TOTP for email:', userEmail);

      const setup = await MFAService.setupTOTP(userEmail);
      console.log('TOTP setup result:', setup);
      setTotpSetup(setup);
      setSetupMode('totp');
    } catch (error: any) {
      console.error('TOTP setup error:', error);
      setError(error.response?.data?.message || 'Failed to setup TOTP');
    } finally {
      setIsSettingUpTotp(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (!totpToken.trim()) return;

    try {
      setIsSettingUpTotp(true);
      setError('');

      await MFAService.verifyAndEnableTOTP(totpToken);
      setSuccess('TOTP authentication enabled successfully!');
      setSetupMode('none');
      setTotpSetup(null);
      setTotpToken('');
      await loadMFAStatus();
      onStatusChange?.();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid TOTP token');
    } finally {
      setIsSettingUpTotp(false);
    }
  };

  const handleSendEmailCode = async () => {
    try {
      setIsSendingEmailCode(true);
      setError('');

      await MFAService.sendEmailCode();
      setEmailCodeSent(true);
      setSetupMode('email');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send email code');
    } finally {
      setIsSendingEmailCode(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!emailCode.trim()) return;

    try {
      setIsSettingUpEmail(true);
      setError('');

      await MFAService.verifyAndEnableEmailMFA(emailCode);
      setSuccess('Email MFA enabled successfully!');
      setSetupMode('none');
      setEmailCode('');
      setEmailCodeSent(false);
      await loadMFAStatus();
      onStatusChange?.();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid email code');
    } finally {
      setIsSettingUpEmail(false);
    }
  };

  const handleDisableMFA = async (method: 'email' | 'totp') => {
    if (!confirm(`Are you sure you want to disable ${method.toUpperCase()} authentication?`)) {
      return;
    }

    try {
      setError('');
      await MFAService.disableMFA(method);
      setSuccess(`${method.toUpperCase()} authentication disabled`);
      await loadMFAStatus();
      onStatusChange?.();
    } catch (error: any) {
      setError(error.response?.data?.message || `Failed to disable ${method} MFA`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const downloadBackupCodes = () => {
    if (!totpSetup?.backupCodes) return;

    const content = `AI Cost Optimizer - MFA Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\nBackup Codes (use each code only once):\n${totpSetup.backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}\n\nKeep these codes in a safe place. You can use them to access your account if you lose your authenticator device.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-cost-optimizer-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-200 animate-spin border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <ShieldCheckIcon className="mr-3 w-6 h-6 text-green-600" />
        <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-red-50 rounded-md border border-red-200">
          <div className="flex">
            <XMarkIcon className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 rounded-md border border-green-200">
          <div className="flex">
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* MFA Status Overview */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="mb-3 text-sm font-medium text-gray-900">Current Status</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Two-Factor Authentication</span>
            <span className={`px-2 py-1 text-xs rounded-full ${mfaStatus?.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {mfaStatus?.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          {mfaStatus?.enabled && (
            <div className="text-sm text-gray-600">
              Active methods: {mfaStatus.methods.map(method => method.toUpperCase()).join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Setup Methods */}
      {setupMode === 'none' && (
        <div className="space-y-4">
          {/* Email MFA */}
          <div className="p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex">
                <EnvelopeIcon className="mr-3 w-6 h-6 text-blue-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Authentication</h4>
                  <p className="text-sm text-gray-600">Receive verification codes via email</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {mfaStatus?.email.enabled ? (
                  <>
                    <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">Enabled</span>
                    <button
                      onClick={() => handleDisableMFA('email')}
                      className="px-3 py-1 text-xs text-red-600 rounded border border-red-300 hover:bg-red-50"
                    >
                      Disable
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSendEmailCode}
                    disabled={isSendingEmailCode}
                    className="px-3 py-1 text-xs text-blue-600 rounded border border-blue-300 hover:bg-blue-50 disabled:opacity-50"
                  >
                    {isSendingEmailCode ? 'Setting up...' : 'Enable'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* TOTP MFA */}
          <div className="p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex">
                <DevicePhoneMobileIcon className="mr-3 w-6 h-6 text-green-500" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Authenticator App</h4>
                  <p className="text-sm text-gray-600">Use Google Authenticator, Authy, or similar apps</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {mfaStatus?.totp.enabled ? (
                  <>
                    <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">Enabled</span>
                    <button
                      onClick={() => handleDisableMFA('totp')}
                      className="px-3 py-1 text-xs text-red-600 rounded border border-red-300 hover:bg-red-50"
                    >
                      Disable
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSetupTOTP}
                    disabled={isSettingUpTotp}
                    className="px-3 py-1 text-xs text-green-600 rounded border border-green-300 hover:bg-green-50 disabled:opacity-50"
                  >
                    {isSettingUpTotp ? 'Setting up...' : 'Enable'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOTP Setup Flow */}
      {setupMode === 'totp' && totpSetup && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h4 className="flex items-center mb-4 text-lg font-medium text-gray-900">
              <QrCodeIcon className="mr-2 w-5 h-5" />
              Setup Authenticator App
            </h4>

            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p className="mb-2">1. Install an authenticator app like Google Authenticator or Authy</p>
                <p className="mb-2">2. Scan the QR code below with your app</p>
                <p>3. Enter the 6-digit code from your app to complete setup</p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center p-4 bg-white rounded border">
                <img
                  src={totpSetup.qrCodeUrl}
                  alt="TOTP QR Code"
                  className="w-48 h-48"
                />
              </div>

              {/* Verification */}
              <div className="space-y-3">
                <label htmlFor="totp-token" className="block text-sm font-medium text-gray-700">
                  Enter 6-digit code from your app
                </label>
                <input
                  id="totp-token"
                  type="text"
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="block px-3 py-2 w-full text-2xl tracking-widest text-center rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              {/* Backup Codes */}
              <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                <h5 className="mb-2 text-sm font-medium text-yellow-800">Backup Codes</h5>
                <p className="mb-3 text-sm text-yellow-700">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {totpSetup.backupCodes.map((code, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="font-mono text-sm">{code}</span>
                      <button
                        onClick={() => copyToClipboard(code)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={downloadBackupCodes}
                  className="px-3 py-1 text-sm text-yellow-700 rounded border border-yellow-300 hover:bg-yellow-100"
                >
                  Download Backup Codes
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleVerifyTOTP}
                  disabled={isSettingUpTotp || totpToken.length !== 6}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSettingUpTotp ? 'Verifying...' : 'Complete Setup'}
                </button>
                <button
                  onClick={() => {
                    setSetupMode('none');
                    setTotpSetup(null);
                    setTotpToken('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Setup Flow */}
      {setupMode === 'email' && emailCodeSent && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h4 className="flex items-center mb-4 text-lg font-medium text-gray-900">
              <EnvelopeIcon className="mr-2 w-5 h-5" />
              Verify Email Address
            </h4>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                We've sent a 6-digit verification code to your email address. Enter it below to enable email-based two-factor authentication.
              </p>

              <div className="space-y-3">
                <label htmlFor="email-code" className="block text-sm font-medium text-gray-700">
                  Enter 6-digit code from email
                </label>
                <input
                  id="email-code"
                  type="text"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="block px-3 py-2 w-full text-2xl tracking-widest text-center rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleVerifyEmail}
                  disabled={isSettingUpEmail || emailCode.length !== 6}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSettingUpEmail ? 'Verifying...' : 'Complete Setup'}
                </button>
                <button
                  onClick={() => {
                    setSetupMode('none');
                    setEmailCode('');
                    setEmailCodeSent(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trusted Devices */}
      {mfaStatus?.enabled && mfaStatus.trustedDevices.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="mb-3 text-sm font-medium text-gray-900">Trusted Devices</h4>
          <div className="space-y-2">
            {mfaStatus.trustedDevices.map((device, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                <div>
                  <p className="text-sm font-medium text-gray-900">{device.deviceName}</p>
                  <p className="text-xs text-gray-500">
                    Last used: {new Date(device.lastUsed).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => MFAService.removeTrustedDevice(device.deviceId)}
                  className="px-2 py-1 text-xs text-red-600 rounded border border-red-300 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};