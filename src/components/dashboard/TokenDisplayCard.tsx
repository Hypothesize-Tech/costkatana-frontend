import { useState } from 'react';
import { ClipboardDocumentIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { copyToClipboard } from '@/utils/helpers';
import toast from 'react-hot-toast';

interface TokenDisplayCardProps {
    token: string;
    onDismiss: () => void;
}

export const TokenDisplayCard = ({ token, onDismiss }: TokenDisplayCardProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const success = await copyToClipboard(token);
        if (success) {
            setCopied(true);
            toast.success('Token copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } else {
            toast.error('Failed to copy token.');
        }
    };

    return (
        <div className="relative p-4 my-6 bg-blue-50 rounded-lg border border-blue-200">
            <button
                onClick={onDismiss}
                className="absolute top-2 right-2 p-1 text-blue-400 hover:text-blue-600"
                aria-label="Dismiss"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2m-4-2h2m-2-4h2m2-4h2m-6 4h2m6-4h2m4-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V9z" />
                    </svg>
                </div>
                <div className="flex-1 ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Your Bearer Token</h3>
                    <p className="mt-1 text-sm text-blue-700">
                        Use this token to authenticate the `ai-cost-optimizer` library with the backend.
                        This will only be shown once per session.
                    </p>
                    <div className="flex gap-x-2 items-center mt-2">
                        <input
                            type="text"
                            readOnly
                            value={`Bearer ${token}`}
                            className="flex-1 text-xs input"
                        />
                        <button
                            onClick={handleCopy}
                            className="p-2 text-xs btn-secondary"
                        >
                            {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                            <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-blue-600">
                        Set this token as the `USER_TOKEN` environment variable in your application.
                    </p>
                </div>
            </div>
        </div>
    );
}; 