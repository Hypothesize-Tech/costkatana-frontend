import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, DevicePhoneMobileIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { MFAService } from '../../services/mfa.service';

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
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari')) return 'Safari Browser';
    if (userAgent.includes('Edge')) return 'Edge Browser';
    return 'Unknown Device';
  };

  const containerClass = embedded
    ? "space-y-6"
    : "flex justify-center items-center px-4 py-12 min-h-screen bg-gray-50 sm:px-6 lg:px-8";

  const contentClass = embedded
    ? "space-y-6"
    : "space-y-8 w-full max-w-md";

  const content = (
    <div className={contentClass}>
      <div className="animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-success flex items-center justify-center mx-auto shadow-2xl glow-success">
          <ShieldCheckIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="mt-6 text-3xl font-display font-bold text-center gradient-text">
          Two-Factor Authentication
        </h2>
        <p className="mt-3 text-sm font-body text-center text-light-text-secondary dark:text-dark-text-secondary">
          Please verify your identity to continue
        </p>
      </div>

      <form className="mt-8 space-y-8" onSubmit={handleVerify}>
        {/* Method Selection */}
        {availableMethods.length > 1 && (
          <div>
            <label className="label">Verification Method</label>
            <div className="mt-3 space-y-3">
              {availableMethods.sort((a, b) => a === 'totp' ? -1 : b === 'totp' ? 1 : 0).map((method) => (
                <label key={method} className="flex items-center p-3 rounded-xl glass hover:bg-primary-500/5 transition-all duration-300 cursor-pointer">
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
                    <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">
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
          <div className="p-4 glass border border-primary-200/30 rounded-2xl shadow-lg backdrop-blur-xl">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center mr-3 shadow-lg">
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
                className="btn-primary text-sm"
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
                className="btn-ghost text-sm"
              >
                Resend Code
              </button>
            )}
          </div>
        )}

        {/* TOTP Section */}
        {selectedMethod === 'totp' && (
          <div className="p-4 glass border border-success-200/30 rounded-2xl bg-gradient-to-br from-success-50/50 to-success-100/50 shadow-lg backdrop-blur-xl">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center mr-3 shadow-lg">
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
            className="input block w-full text-2xl tracking-widest text-center rounded-2xl shadow-lg"
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
            <label htmlFor="device-name" className="block text-sm font-medium text-gray-700">
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
            className="btn btn-primary w-full"
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

  return embedded ? content : <div className={containerClass}>{content}</div>;
};


