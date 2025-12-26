import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, DevicePhoneMobileIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { MFAService } from '../../services/mfa.service';
import { getDeviceName as getDeviceNameUtil } from '../../utils/deviceFingerprint';

interface MFAVerificationProps {
  mfaToken: string;
  userId: string;
  availableMethods: Array<'email' | 'totp'>;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  embedded?: boolean; // Whether this is embedded in login page or standalone
}

export const MFAVerification: React.FC<MFAVerificationProps> = ({
  mfaToken,
  userId: _userId,
  availableMethods,
  onSuccess,
  onError,
  embedded = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'totp'>(
    availableMethods.includes('totp') ? 'totp' : availableMethods[0]
  );
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [deviceTrustStatus, setDeviceTrustStatus] = useState<{ isTrusted: boolean; deviceName?: string } | null>(null);

  // Check device trust status on mount
  useEffect(() => {
    const checkDeviceTrust = async () => {
      try {
        const status = await MFAService.getDeviceTrustStatus();
        setDeviceTrustStatus(status);
        if (status.isTrusted && status.deviceName) {
          setDeviceName(status.deviceName);
        }
      } catch (error) {
        console.warn('Failed to check device trust status:', error);
      }
    };
    checkDeviceTrust();
  }, []);

  // Auto-send email code if email is selected and user switches to it
  useEffect(() => {
    if (selectedMethod === 'email' && !emailCodeSent && availableMethods.length > 1) {
      // Only auto-send if user explicitly selected email (not default)
      // Don't auto-send if email is the only method - let user click send
    }
  }, [selectedMethod, emailCodeSent, availableMethods.length]);

  // Countdown timer for email code resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendEmailCode = async () => {
    setIsSendingCode(true);
    try {
      await MFAService.sendEmailCode(mfaToken);
      setEmailCodeSent(true);
      setCountdown(60); // 60 second cooldown
    } catch (error: any) {
      onError(error.response?.data?.message || 'Failed to send email code');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsVerifying(true);
    try {
      const result = await MFAService.verifyMFA(
        mfaToken,
        selectedMethod,
        code,
        rememberDevice,
        deviceName || undefined
      );
      onSuccess(result);
    } catch (error: any) {
      onError(error.response?.data?.message || 'Invalid verification code');
      setCode(''); // Clear the code on error
    } finally {
      setIsVerifying(false);
    }
  };

  const getDeviceName = () => {
    return getDeviceNameUtil();
  };

  const containerClass = embedded
    ? "space-y-6"
    : "flex justify-center items-center px-4 py-12 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient sm:px-6 lg:px-8 relative overflow-hidden";

  const contentClass = embedded
    ? "space-y-6"
    : "space-y-8 w-full max-w-md";

  const content = (
    <div className={contentClass}>
      <div className={`animate-fade-in ${!embedded ? 'relative z-10 p-8 rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel' : ''}`}>
        <div className="flex justify-center items-center mx-auto w-16 h-16 rounded-2xl shadow-2xl bg-gradient-success glow-success">
          <ShieldCheckIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="mt-6 text-3xl font-bold text-center font-display gradient-text-primary">
          Two-Factor Authentication
        </h2>
        <p className="mt-3 text-sm text-center font-body text-light-text-secondary dark:text-dark-text-secondary">
          Please verify your identity to continue
        </p>
      </div>

      <form className="mt-8 space-y-8" onSubmit={handleVerify}>
        {/* Device Trust Status */}
        {deviceTrustStatus?.isTrusted && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center">
              <ShieldCheckIcon className="mr-2 w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Device Previously Trusted
                </p>
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  This device "{deviceTrustStatus.deviceName}" was trusted but may need re-verification due to browser or network changes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Method Selection */}
        {availableMethods.length > 1 && (
          <div>
            <label className="label">Verification Method</label>
            <div className="mt-3 space-y-3">
              {availableMethods.sort((a, b) => a === 'totp' ? -1 : b === 'totp' ? 1 : 0).map((method) => (
                <label key={method} className="flex items-center p-3 rounded-xl transition-all duration-300 cursor-pointer glass hover:bg-primary-500/5">
                  <input
                    type="radio"
                    name="method"
                    value={method}
                    checked={selectedMethod === method}
                    onChange={(e) => setSelectedMethod(e.target.value as 'email' | 'totp')}
                    className="w-4 h-4 text-primary-600 border-primary-300 focus:ring-primary-500"
                  />
                  <span className="flex items-center ml-3">
                    {method === 'email' ? (
                      <EnvelopeIcon className="mr-3 w-5 h-5 text-primary-500" />
                    ) : (
                      <DevicePhoneMobileIcon className="mr-3 w-5 h-5 text-success-500" />
                    )}
                    <span className="font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                      {method === 'email' ? 'Email Code' : 'Authenticator App'}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Email Code Section */}
        {selectedMethod === 'email' && (
          <div className="p-4 rounded-2xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
            <div className="flex items-center mb-3">
              <div className="flex justify-center items-center mr-3 w-8 h-8 rounded-lg shadow-lg bg-gradient-primary">
                <EnvelopeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                {emailCodeSent ? 'Code sent to your email' : 'We will send a code to your email'}
              </span>
            </div>
            {!emailCodeSent && (
              <button
                type="button"
                onClick={handleSendEmailCode}
                disabled={isSendingCode}
                className="text-sm btn btn-primary"
              >
                {isSendingCode ? 'Sending...' : 'Send Code'}
              </button>
            )}
            {countdown > 0 && (
              <div className="flex items-center mt-2 text-sm text-light-text-muted dark:text-dark-text-muted">
                <ClockIcon className="mr-2 w-4 h-4" />
                Resend in {countdown}s
              </div>
            )}
            {countdown === 0 && emailCodeSent && (
              <button
                type="button"
                onClick={handleSendEmailCode}
                disabled={isSendingCode}
                className="text-sm btn-ghost"
              >
                Resend Code
              </button>
            )}
          </div>
        )}

        {/* TOTP Section */}
        {selectedMethod === 'totp' && (
          <div className="p-4 bg-gradient-to-br rounded-2xl border shadow-lg backdrop-blur-xl glass border-success-200/30 from-success-50/50 to-success-100/50">
            <div className="flex items-center">
              <div className="flex justify-center items-center mr-3 w-8 h-8 rounded-lg shadow-lg bg-gradient-success">
                <DevicePhoneMobileIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                Enter the 6-digit code from your authenticator app
              </span>
            </div>
          </div>
        )}

        {/* Code Input */}
        <div>
          <label htmlFor="code" className="sr-only">
            Verification Code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, selectedMethod === 'totp' ? 6 : 6))}
            className="block w-full text-2xl tracking-widest text-center rounded-2xl shadow-lg input"
            placeholder={selectedMethod === 'totp' ? '000000' : '000000'}
            maxLength={selectedMethod === 'totp' ? 6 : 6}
          />
        </div>

        {/* Remember Device */}
        <div className="flex items-center">
          <input
            id="remember-device"
            name="remember-device"
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => {
              setRememberDevice(e.target.checked);
              if (e.target.checked && !deviceName) {
                setDeviceName(getDeviceName());
              }
            }}
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
          <label htmlFor="remember-device" className="block ml-2 text-sm text-light-text-primary dark:text-dark-text-primary">
            Trust this device for 30 days
          </label>
        </div>

        {/* Device Name Input */}
        {rememberDevice && (
          <div>
            <label htmlFor="device-name" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
              Device Name
            </label>
            <input
              id="device-name"
              name="device-name"
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="block relative px-3 py-2 mt-1 w-full placeholder-gray-500 text-gray-900 rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="e.g., My Laptop"
            />
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isVerifying || !code.trim() || (selectedMethod === 'email' && !emailCodeSent)}
            className="w-full btn btn-primary"
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>

      <div className="text-center">
        <p className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted">
          Having trouble? Contact support for assistance.
        </p>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className={containerClass}>
      {/* Ambient glow effects */}
      <div className="overflow-hidden absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse bg-primary-500/8" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse bg-success-500/8" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 right-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse bg-accent-500/6" style={{ animationDelay: '4s' }} />
      </div>
      {content}
    </div>
  );
};


