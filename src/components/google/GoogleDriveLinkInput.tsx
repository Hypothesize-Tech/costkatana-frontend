import React, { useState } from 'react';
import { LinkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface GoogleDriveLinkInputProps {
    connectionId: string;
    onFileAdded: (file: any) => void;
    onError?: (error: string) => void;
}

export const GoogleDriveLinkInput: React.FC<GoogleDriveLinkInputProps> = ({
    connectionId,
    onFileAdded,
    onError
}) => {
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!link.trim()) {
            setError('Please enter a Google Drive link or file ID');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const { googleService } = await import('../../services/google.service');
            const result = await googleService.getFileFromLink(connectionId, link.trim());

            setSuccess(`Added: ${result.file.name}`);
            setLink('');
            onFileAdded(result.file);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || 'Failed to access file';
            setError(errorMsg);
            onError?.(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Instructions Toggle */}
            <button
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
                <InformationCircleIcon className="w-5 h-5" />
                {showInstructions ? 'Hide' : 'Show'} instructions
            </button>

            {/* Instructions Panel */}
            {showInstructions && (
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200/30 dark:border-primary-500/20 rounded-lg p-4">
                    <h4 className="font-display font-semibold text-secondary-900 dark:text-white mb-2">
                        How to add Google Drive files:
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                        <li>Go to Google Drive and find the file you want to analyze</li>
                        <li>Right-click the file and select <strong className="text-light-text-primary dark:text-dark-text-primary">"Share"</strong></li>
                        <li>Under "General access", click <strong className="text-light-text-primary dark:text-dark-text-primary">"Change"</strong></li>
                        <li>Select <strong className="text-light-text-primary dark:text-dark-text-primary">"Anyone with the link"</strong> (set to Viewer)</li>
                        <li>Click <strong className="text-light-text-primary dark:text-dark-text-primary">"Copy link"</strong> and paste it below</li>
                    </ol>
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-lg">
                        <p className="text-xs text-amber-900 dark:text-amber-200 font-display font-semibold mb-1">
                            ⚠️ Important for files you don't own:
                        </p>
                        <p className="text-xs text-amber-800 dark:text-amber-300 font-body leading-relaxed">
                            If someone shared a file with you, the owner must explicitly share it with your Google account email.
                            "Anyone with the link" is not sufficient for programmatic API access.
                            Ask them to add your email (<strong>your connected Google account</strong>) as a viewer.
                        </p>
                    </div>
                    <div className="mt-3 p-3 bg-white dark:bg-dark-card rounded-lg border border-primary-200/30 dark:border-primary-500/20">
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2 font-display font-semibold">
                            Supported link formats:
                        </p>
                        <ul className="text-xs text-light-text-secondary dark:text-dark-text-secondary space-y-1 font-mono">
                            <li>• https://drive.google.com/file/d/FILE_ID/view</li>
                            <li>• https://docs.google.com/document/d/FILE_ID/edit</li>
                            <li>• https://docs.google.com/spreadsheets/d/FILE_ID/edit</li>
                            <li>• FILE_ID (direct file ID)</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Link Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label htmlFor="drive-link" className="block text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                        Google Drive Link or File ID
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LinkIcon className="h-5 w-5 text-secondary-400 dark:text-secondary-500" />
                            </div>
                            <input
                                type="text"
                                id="drive-link"
                                value={link}
                                onChange={(e) => {
                                    setLink(e.target.value);
                                    setError(null);
                                }}
                                placeholder="Paste Google Drive link or file ID..."
                                className="block w-full pl-10 pr-3 py-2.5 border border-primary-200/30 dark:border-primary-500/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary placeholder:text-secondary-400 dark:placeholder:text-secondary-500 font-body transition-all duration-200"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !link.trim()}
                            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 dark:disabled:bg-secondary-700 disabled:cursor-not-allowed text-white rounded-lg font-display font-semibold text-sm transition-colors"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Adding...
                                </span>
                            ) : (
                                'Add File'
                            )}
                        </button>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-800 dark:text-green-200 font-body">{success}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-red-800 dark:text-red-200 font-display font-semibold">
                                {error}
                            </p>
                            {(error.includes('Access denied') || error.includes('not found')) && (
                                <div className="mt-2 space-y-1 text-xs text-red-700 dark:text-red-300 font-body">
                                    <p className="font-semibold">💡 How to fix this:</p>
                                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                                        <li>Open the file in Google Drive</li>
                                        <li>Click "Share" button</li>
                                        <li>Change "General access" to <strong>"Anyone with the link"</strong></li>
                                        <li>Set permission to <strong>"Viewer"</strong></li>
                                        <li>Copy the new link and try again</li>
                                    </ul>
                                    <p className="mt-2 italic">
                                        Note: If you don't own the file, ask the owner to change the sharing settings.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </form>

            {/* Tips */}
            <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary space-y-1 font-body">
                <p>💡 <strong className="font-display font-semibold">Tip:</strong> Files must be shared with "Anyone with the link" or directly with your Google account.</p>
                <p>🔒 <strong className="font-display font-semibold">Privacy:</strong> We only access files you explicitly share with us.</p>
            </div>
        </div>
    );
};
