import React, { useState } from 'react';
import {
    PhotoIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowDownTrayIcon,
    RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { visualComplianceService } from '../../services/visualCompliance.service';
import { useNotifications } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { BatchComplianceResult, Industry } from '../../types/visualCompliance.types';

export const VisualComplianceBatch: React.FC = () => {
    const [referenceImage, setReferenceImage] = useState<File | null>(null);
    const [referencePreview, setReferencePreview] = useState<string | null>(null);
    const [evidenceImages, setEvidenceImages] = useState<File[]>([]);
    const [evidencePreviews, setEvidencePreviews] = useState<string[]>([]);
    const [industry, setIndustry] = useState<Industry>('retail');
    const [complianceCriteria, setComplianceCriteria] = useState<string[]>([
        'All products should be facing forward',
        'Shelves should be fully stocked'
    ]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<BatchComplianceResult[]>([]);
    const { showNotification } = useNotifications();

    const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setReferenceImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setReferencePreview(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleEvidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 10) {
            showNotification('Maximum 10 images allowed', 'error');
            return;
        }
        setEvidenceImages(files);
        setEvidencePreviews([]);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setEvidencePreviews(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!referenceImage || evidenceImages.length === 0) {
            showNotification('Please upload images', 'error');
            return;
        }

        setLoading(true);
        setResults([]);

        try {
            const refBase64 = await visualComplianceService.prepareImageFile(referenceImage);

            const requests = await Promise.all(
                evidenceImages.map(async (file) => {
                    const evidBase64 = await visualComplianceService.prepareImageFile(file);
                    return {
                        referenceImage: refBase64,
                        evidenceImage: evidBase64,
                        complianceCriteria: complianceCriteria.filter(c => c.trim()),
                        industry
                    };
                })
            );

            const response = await visualComplianceService.batchCheck(requests);

            if (response.success) {
                setResults(response.results);
                showNotification(`Processed ${response.summary.successful} of ${response.summary.total} checks`, 'success');
            } else {
                throw new Error('Batch processing failed');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const csvRows = [
            ['Index', 'Success', 'Score', 'Pass/Fail', 'Cost', 'Feedback'].join(','),
            ...results.map((r, i) => [
                i + 1,
                r.success ? 'Yes' : 'No',
                r.data?.compliance_score || 'N/A',
                r.data?.pass_fail ? 'Pass' : 'Fail',
                r.data?.metadata.cost.toFixed(4) || '0',
                `"${(r.data?.feedback_message || r.error || '').replace(/"/g, '""')}"`
            ].join(','))
        ];

        const csv = csvRows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-batch-${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const successfulResults = results.filter(r => r.success && r.data);
    const totalCost = successfulResults.reduce((sum, r) => sum + (r.data?.metadata.cost || 0), 0);
    const avgScore = successfulResults.length > 0
        ? successfulResults.reduce((sum, r) => sum + (r.data?.compliance_score || 0), 0) / successfulResults.length
        : 0;
    const passRate = successfulResults.length > 0
        ? (successfulResults.filter(r => r.data?.pass_fail).length / successfulResults.length) * 100
        : 0;

    return (
        <div className="space-y-6">
            <div className="glass rounded-xl border border-purple-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-purple-50/10 to-pink-50/10 dark:from-purple-900/10 dark:to-pink-900/10">
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-8 rounded-t-xl border-b border-purple-200/30">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                            <RocketLaunchIcon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                                Batch Visual Compliance Check
                            </h2>
                            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-base mt-2">
                                Process up to 10 evidence images against a single reference standard • Ultra-fast AI analysis
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Reference Image */}
                        <div>
                            <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                                Reference Image (Standard)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleReferenceChange}
                                className="hidden"
                                id="batch-reference"
                            />
                            <label
                                htmlFor="batch-reference"
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-300/50 dark:border-purple-600/50 rounded-xl cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-200 glass bg-gradient-to-br from-purple-50/30 to-transparent dark:from-purple-900/10 dark:to-transparent hover:shadow-lg"
                            >
                                {referencePreview ? (
                                    <img
                                        src={referencePreview}
                                        alt="Reference preview"
                                        className="w-full h-full object-contain rounded-xl p-2"
                                    />
                                ) : (
                                    <>
                                        <PhotoIcon className="w-12 h-12 text-purple-500 dark:text-purple-400 mb-2" />
                                        <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                            Click to upload reference image
                                        </p>
                                    </>
                                )}
                            </label>
                        </div>

                        {/* Evidence Images */}
                        <div>
                            <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                                Evidence Images (Up to 10)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleEvidenceChange}
                                className="hidden"
                                id="batch-evidence"
                            />
                            <label
                                htmlFor="batch-evidence"
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-pink-300/50 dark:border-pink-600/50 rounded-xl cursor-pointer hover:border-pink-400 dark:hover:border-pink-500 transition-all duration-200 glass bg-gradient-to-br from-pink-50/30 to-transparent dark:from-pink-900/10 dark:to-transparent hover:shadow-lg"
                            >
                                <PhotoIcon className="w-12 h-12 text-pink-500 dark:text-pink-400 mb-2" />
                                <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                    Click to upload evidence images ({evidenceImages.length} selected)
                                </p>
                            </label>
                            {evidenceImages.length > 0 && (
                                <div className="mt-4 grid grid-cols-5 gap-3">
                                    {evidencePreviews.map((preview, i) => (
                                        <div key={i} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Evidence ${i + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border-2 border-pink-200/50 dark:border-pink-700/50 glass shadow-md group-hover:scale-105 transition-transform duration-200"
                                            />
                                            <span className="absolute top-1 right-1 bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs font-display font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                                                {i + 1}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Industry */}
                        <div>
                            <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                                Industry
                            </label>
                            <select
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value as Industry)}
                                className="input"
                            >
                                <option value="retail">Retail</option>
                                <option value="jewelry">Jewelry</option>
                                <option value="grooming">Grooming/Salon</option>
                                <option value="fmcg">FMCG</option>
                                <option value="documents">Documents</option>
                            </select>
                        </div>

                        {/* Compliance Criteria */}
                        <div>
                            <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                                Compliance Criteria
                            </label>
                            <div className="space-y-2">
                                {complianceCriteria.map((criterion, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        value={criterion}
                                        onChange={(e) => {
                                            const updated = [...complianceCriteria];
                                            updated[index] = e.target.value;
                                            setComplianceCriteria(updated);
                                        }}
                                        className="input"
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !referenceImage || evidenceImages.length === 0}
                            className="btn btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="small" />
                                    Processing...
                                </>
                            ) : (
                                'Process Batch'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Results */}
            {results.length > 0 && (
                <div className="glass rounded-xl border border-success-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-success-50/10 to-emerald-50/10 dark:from-success-900/10 dark:to-emerald-900/10">
                    <div className="bg-gradient-to-r from-success-500/10 to-emerald-500/10 p-8 rounded-t-xl border-b border-success-200/30 dark:border-success-800/30">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                    <CheckCircleIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-display font-bold bg-gradient-to-r from-success-600 to-emerald-600 dark:from-success-400 dark:to-emerald-400 bg-clip-text text-transparent">
                                    Batch Processing Results
                                </h3>
                            </div>
                            <button
                                onClick={exportToCSV}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-semibold text-white bg-gradient-to-r from-success-500 to-emerald-600 shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="glass rounded-xl p-5 border border-accent-200/30 backdrop-blur-xl bg-gradient-to-br from-accent-50/50 to-transparent dark:from-accent-900/20 dark:to-transparent hover:scale-105 transition-transform duration-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-xs font-display font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">Total Cost</div>
                                </div>
                                <div className="text-2xl font-display font-bold gradient-text-accent">
                                    ${totalCost.toFixed(4)}
                                </div>
                            </div>
                            <div className="glass rounded-xl p-5 border border-purple-200/30 backdrop-blur-xl bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/20 dark:to-transparent hover:scale-105 transition-transform duration-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <div className="text-xs font-display font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">Avg Score</div>
                                </div>
                                <div className="text-2xl font-display font-bold text-purple-600 dark:text-purple-400">
                                    {avgScore.toFixed(1)}%
                                </div>
                            </div>
                            <div className="glass rounded-xl p-5 border border-success-200/30 backdrop-blur-xl bg-gradient-to-br from-success-50/50 to-transparent dark:from-success-900/20 dark:to-transparent hover:scale-105 transition-transform duration-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircleIcon className="w-4 h-4 text-success-600 dark:text-success-400" />
                                    <div className="text-xs font-display font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">Pass Rate</div>
                                </div>
                                <div className="text-2xl font-display font-bold gradient-text-success">
                                    {passRate.toFixed(1)}%
                                </div>
                            </div>
                            <div className="glass rounded-xl p-5 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-900/20 dark:to-transparent hover:scale-105 transition-transform duration-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-xs font-display font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">Successful</div>
                                </div>
                                <div className="text-2xl font-display font-bold text-primary-600 dark:text-primary-400">
                                    {successfulResults.length}/{results.length}
                                </div>
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-primary-200/30 dark:border-primary-700/30">
                                        <th className="text-left py-3 px-4 text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">#</th>
                                        <th className="text-left py-3 px-4 text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">Image</th>
                                        <th className="text-left py-3 px-4 text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">Score</th>
                                        <th className="text-left py-3 px-4 text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">Cost</th>
                                        <th className="text-left py-3 px-4 text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">Feedback</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((result, index) => (
                                        <tr key={index} className="border-b border-primary-100/30 dark:border-primary-800/30 hover:bg-primary-50/20 dark:hover:bg-primary-900/10 transition-colors">
                                            <td className="py-3 px-4 font-body text-light-text-primary dark:text-dark-text-primary">{index + 1}</td>
                                            <td className="py-3 px-4">
                                                {evidencePreviews[index] && (
                                                    <img
                                                        src={evidencePreviews[index]}
                                                        alt={`Evidence ${index + 1}`}
                                                        className="w-16 h-16 object-cover rounded-lg border border-primary-200/30 dark:border-primary-700/30"
                                                    />
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {result.data ? (
                                                    <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">{result.data.compliance_score.toFixed(1)}%</span>
                                                ) : (
                                                    <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">N/A</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {result.success && result.data ? (
                                                    result.data.pass_fail ? (
                                                        <span className="flex items-center gap-1 gradient-text-success font-display font-semibold">
                                                            <CheckCircleIcon className="w-5 h-5" />
                                                            Pass
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-danger-600 dark:text-danger-400 font-display font-semibold">
                                                            <XCircleIcon className="w-5 h-5" />
                                                            Fail
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="font-body text-danger-600 dark:text-danger-400">Error</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-body text-light-text-primary dark:text-dark-text-primary">
                                                {result.data ? `$${result.data.metadata.cost.toFixed(4)}` : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                {result.data?.feedback_message || result.error || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
