// src/components/settings/SecuritySettings.tsx
import React, { useState } from 'react';
import { ShieldCheckIcon, KeyIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../contexts/NotificationContext';

interface SecuritySettings {
    twoFactorEnabled: boolean;
    activeSessions: {
        id: string;
        device: string;
        location: string;
        lastActive: string;
        current: boolean;
    }[];
}

interface SecuritySettingsProps {
    onUpdate: (data: { security: SecuritySettings }) => void;
    security: SecuritySettings;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = () => {
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const { showNotification } = useNotifications();

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            showNotification('Password must be at least 8 characters', 'error');
            return;
        }
        // Handle password update
        showNotification('Password updated successfully', 'success');
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const sessions = [
        {
            id: '1',
            device: 'Chrome on MacOS',
            location: 'San Francisco, CA',
            lastActive: '2 minutes ago',
            current: true,
        },
        {
            id: '2',
            device: 'Safari on iPhone',
            location: 'San Francisco, CA',
            lastActive: '1 hour ago',
            current: false,
        },
    ];

    return (
        <div className="space-y-8">
            {/* Change Password */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
                {!showPasswordForm ? (
                    <button
                        onClick={() => setShowPasswordForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <KeyIcon className="h-4 w-4 mr-2" />
                        Change Password
                    </button>
                ) : (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Must be at least 8 characters
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                            >
                                Update Password
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPasswordForm(false);
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Two-Factor Authentication */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <ShieldCheckIcon className={`h-8 w-8 ${twoFactorEnabled ? 'text-green-500' : 'text-gray-400'}`} />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">
                                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {twoFactorEnabled
                                        ? 'Your account is protected with 2FA'
                                        : 'Add an extra layer of security to your account'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${twoFactorEnabled
                                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                : 'text-white bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {twoFactorEnabled ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Sessions */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Active Sessions</h2>
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="bg-white rounded-lg border border-gray-200 p-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <DevicePhoneMobileIcon className="h-6 w-6 text-gray-400" />
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">
                                            {session.device}
                                            {session.current && (
                                                <span className="ml-2 text-xs text-green-600">(Current)</span>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {session.location} • {session.lastActive}
                                        </p>
                                    </div>
                                </div>
                                {!session.current && (
                                    <button className="text-sm text-red-600 hover:text-red-800">
                                        Revoke
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security Recommendations */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Security Recommendations</h2>
                <div className="bg-blue-50 rounded-lg p-4">
                    <ul className="space-y-2 text-sm text-blue-900">
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Use a strong, unique password for your account
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Enable two-factor authentication for extra security
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Regularly review your active sessions and API keys
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Keep your API keys secure and rotate them periodically
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};