import React, { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface PasswordVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (password: string) => Promise<void>;
    title?: string;
    description?: string;
}

export const PasswordVerificationModal: React.FC<PasswordVerificationModalProps> = ({
    isOpen,
    onClose,
    onVerify,
    title = 'Verify Your Password',
    description = 'Please enter your password to continue'
}) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password.trim()) {
            setError('Password is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onVerify(password);
            setPassword('');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Invalid password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPassword('');
        setError('');
        setShowPassword(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="overflow-y-auto fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="flex justify-center items-center p-4 min-h-full">
                <div className="relative p-6 w-full max-w-md rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel animate-slide-up">
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 transition-colors text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    {/* Header */}
                    <div className="flex gap-3 items-center mb-6">
                        <div className="flex justify-center items-center w-12 h-12 rounded-xl bg-gradient-primary glow-primary">
                            <ShieldCheckIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-display gradient-text-primary">
                                {title}
                            </h2>
                            <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Password Input */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block mb-2 text-sm font-medium text-secondary-700 dark:text-secondary-300"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError('');
                                    }}
                                    className={`input pr-10 ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                                    placeholder="Enter your password"
                                    autoFocus
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transition-colors -translate-y-1/2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {error && (
                                <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">
                                    {error}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading || !password.trim()}
                            >
                                {loading ? (
                                    <span className="flex gap-2 justify-center items-center">
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : (
                                    'Verify'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Security Note */}
                    <div className="pt-4 mt-4 border-t border-primary-200/30">
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">
                            🔒 Your password is verified securely and never stored in plain text.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};


