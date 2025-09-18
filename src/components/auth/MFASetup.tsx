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
      <div className="flex justify-center items-center py-12">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center mr-4 shadow-lg glow-success">
          <ShieldCheckIcon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-display font-bold gradient-text">Two-Factor Authentication</h3>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 rounded-2xl border border-danger-200/50 bg-gradient-to-br from-danger-50 to-danger-100/50 glow-danger animate-scale-in">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center mr-3 shadow-lg">
              <XMarkIcon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-danger-800 dark:text-danger-200">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl border border-success-200/50 bg-gradient-to-br from-success-50 to-success-100/50 animate-scale-in">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center mr-3 shadow-lg">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-success-800 dark:text-success-200">{success}</p>
          </div>
        </div>
      )}

      {/* MFA Status Overview */}
      <div className="glass p-6 shadow-2xl backdrop-blur-xl border border-primary-200/30">
        <h4 className="mb-4 text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">Current Status</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Two-Factor Authentication</span>
            <span className={`px-3 py-1 text-xs font-display font-bold rounded-xl shadow-lg ${mfaStatus?.enabled ? 'bg-gradient-success text-white' : 'glass text-light-text-muted dark:text-dark-text-muted'}`}>
              {mfaStatus?.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          {mfaStatus?.enabled && (
            <div className="text-sm font-medium gradient-text">
              Active methods: {mfaStatus.methods.map(method => method.toUpperCase()).join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Setup Methods */}
      {setupMode === 'none' && (
        <div className="space-y-6">
          {/* Email MFA */}
          <div className="glass p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 border border-primary-200/30 shadow-lg backdrop-blur-xl hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg">
                  <EnvelopeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">Email Authentication</h4>
                  <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Receive verification codes via email</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {mfaStatus?.email.enabled ? (
                  <>
                    <span className="px-3 py-1 text-xs font-display font-bold bg-gradient-success text-white rounded-xl shadow-lg">Enabled</span>
                    <button
                      onClick={() => handleDisableMFA('email')}
                      className="btn-ghost text-danger-500 hover:bg-danger-500/10"
                    >
                      Disable
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSendEmailCode}
                    disabled={isSendingEmailCode}
                    className="btn-primary"
                  >
                    {isSendingEmailCode ? 'Setting up...' : 'Enable'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* TOTP MFA */}
          <div className="glass p-6 bg-gradient-to-br from-success-50/50 to-success-100/50 border border-success-200/30 shadow-lg backdrop-blur-xl hover:scale-105 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center mr-4 shadow-lg">
                  <DevicePhoneMobileIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">Authenticator App</h4>
                  <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Use Google Authenticator, Authy, or similar apps</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {mfaStatus?.totp.enabled ? (
                  <>
                    <span className="px-3 py-1 text-xs font-display font-bold bg-gradient-success text-white rounded-xl shadow-lg">Enabled</span>
                    <button
                      onClick={() => handleDisableMFA('totp')}
                      className="btn-ghost text-danger-500 hover:bg-danger-500/10"
                    >
                      Disable
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSetupTOTP}
                    disabled={isSettingUpTotp}
                    className="btn-secondary"
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
          <div className="glass p-6 shadow-2xl backdrop-blur-xl border border-primary-200/30">
            <h4 className="flex items-center mb-4 text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center mr-3 shadow-lg">
                <QrCodeIcon className="w-5 h-5 text-white" />
              </div>
              Setup Authenticator App
            </h4>

            <div className="space-y-4">
              <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                <p className="mb-2">1. Install an authenticator app like Google Authenticator, Authy, or 1Password</p>
                <p className="mb-2">2. Scan the QR code below with your app</p>
                <p>3. Enter the 6-digit code from your app to complete setup</p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center p-6 glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <img
                  src={totpSetup.qrCodeUrl}
                  alt="TOTP QR Code"
                  className="w-48 h-48 rounded-lg shadow-lg"
                />
              </div>

              {/* Verification */}
              <div className="space-y-3">
                <label htmlFor="totp-token" className="label">
                  Enter 6-digit code from your app
                </label>
                <input
                  id="totp-token"
                  type="text"
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input w-full text-2xl tracking-widest text-center"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              {/* Backup Codes */}
              <div className="p-4 glass rounded-xl border border-warning-200/30 bg-gradient-to-br from-warning-50/50 to-warning-100/50 shadow-lg backdrop-blur-xl">
                <h5 className="mb-2 text-sm font-display font-bold text-warning-700 dark:text-warning-300">🔐 Backup Codes</h5>
                <p className="mb-3 text-sm font-body text-warning-700 dark:text-warning-300">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {totpSetup.backupCodes.map((code, index) => (
                    <div key={index} className="flex justify-between items-center p-2 glass rounded-lg border border-primary-200/30 shadow-sm backdrop-blur-xl">
                      <span className="font-mono text-sm text-light-text-primary dark:text-dark-text-primary">{code}</span>
                      <button
                        onClick={() => copyToClipboard(code)}
                        className="text-light-text-muted dark:text-dark-text-muted hover:text-primary-500 transition-colors duration-300"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={downloadBackupCodes}
                  className="btn-ghost text-warning-600 dark:text-warning-400 hover:bg-warning-500/10"
                >
                  📥 Download Backup Codes
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleVerifyTOTP}
                  disabled={isSettingUpTotp || totpToken.length !== 6}
                  className="btn-primary flex-1"
                >
                  {isSettingUpTotp ? '🔄 Verifying...' : '✅ Complete Setup'}
                </button>
                <button
                  onClick={() => {
                    setSetupMode('none');
                    setTotpSetup(null);
                    setTotpToken('');
                  }}
                  className="btn-secondary"
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
          <div className="glass p-6 shadow-2xl backdrop-blur-xl border border-primary-200/30">
            <h4 className="flex items-center mb-4 text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center mr-3 shadow-lg">
                <EnvelopeIcon className="w-5 h-5 text-white" />
              </div>
              Verify Email Address
            </h4>

            <div className="space-y-4">
              <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                📧 We've sent a 6-digit verification code to your email address. Enter it below to enable email-based two-factor authentication.
              </p>

              <div className="space-y-3">
                <label htmlFor="email-code" className="label">
                  Enter 6-digit code from email
                </label>
                <input
                  id="email-code"
                  type="text"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input w-full text-2xl tracking-widest text-center"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleVerifyEmail}
                  disabled={isSettingUpEmail || emailCode.length !== 6}
                  className="btn-primary flex-1"
                >
                  {isSettingUpEmail ? '🔄 Verifying...' : '✅ Complete Setup'}
                </button>
                <button
                  onClick={() => {
                    setSetupMode('none');
                    setEmailCode('');
                    setEmailCodeSent(false);
                  }}
                  className="btn-secondary"
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