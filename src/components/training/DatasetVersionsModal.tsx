import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { trainingService, TrainingDataset } from '../../services/training.service';

interface DatasetVersionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    dataset: TrainingDataset | null;
    onVersionCreated: (dataset: TrainingDataset) => void;
}

interface DatasetVersion {
    id: string;
    name: string;
    version: string;
    versionNotes?: string;
    createdAt: string;
    status: string;
    itemCount: number;
}

export const DatasetVersionsModal: React.FC<DatasetVersionsModalProps> = ({
    isOpen,
    onClose,
    dataset,
    onVersionCreated,
}) => {
    const [versions, setVersions] = useState<DatasetVersion[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateVersion, setShowCreateVersion] = useState(false);
    const [newVersion, setNewVersion] = useState({
        version: '',
        versionNotes: ''
    });

    useEffect(() => {
        if (isOpen && dataset) {
            loadVersions();
        }
    }, [isOpen, dataset]);

    const loadVersions = async () => {
        if (!dataset) return;

        setLoading(true);
        try {
            const versionData = await trainingService.datasets.getDatasetVersions(dataset._id);
            setVersions(versionData);
        } catch (error) {
            console.error('Failed to load versions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateVersion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dataset || !newVersion.version) return;

        try {
            const newDataset = await trainingService.datasets.createDatasetVersion(
                dataset._id,
                {
                    version: newVersion.version,
                    versionNotes: newVersion.versionNotes || undefined,
                }
            );

            onVersionCreated(newDataset);
            setNewVersion({ version: '', versionNotes: '' });
            setShowCreateVersion(false);
            await loadVersions(); // Reload versions
        } catch (error) {
            console.error('Failed to create version:', error);
        }
    };

    const generateNextVersion = () => {
        if (!dataset) return;

        // Simple version increment logic
        const currentVersion = dataset.version;
        const parts = currentVersion.split('.');
        const lastPart = parseInt(parts[parts.length - 1]) + 1;
        parts[parts.length - 1] = lastPart.toString();

        setNewVersion(prev => ({ ...prev, version: parts.join('.') }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass rounded-3xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl border border-primary-200/30 backdrop-blur-xl">
                {/* Header */}
                <div className="glass flex items-center justify-between p-8 border-b border-primary-200/30 backdrop-blur-xl rounded-t-3xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center glow-secondary">
                            <span className="text-white text-xl">📊</span>
                        </div>
                        <h2 className="text-2xl font-display font-bold gradient-text-secondary">
                            Dataset Versions - {dataset?.name}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn-icon-secondary"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 bg-light-bg-primary dark:bg-dark-bg-primary">
                    {/* Create New Version */}
                    {!showCreateVersion ? (
                        <div className="mb-6">
                            <button
                                onClick={() => {
                                    setShowCreateVersion(true);
                                    generateNextVersion();
                                }}
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <PlusIcon className="h-4 w-4" />
                                <span>Create New Version</span>
                            </button>
                        </div>
                    ) : (
                        <div className="glass rounded-xl p-6 border border-info-200/30 shadow-lg backdrop-blur-xl space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-info flex items-center justify-center glow-info">
                                    <PlusIcon className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="text-xl font-display font-bold gradient-text-info">Create New Version</h3>
                            </div>
                            <form onSubmit={handleCreateVersion} className="space-y-6">
                                <div>
                                    <label className="form-label">
                                        Version Number
                                    </label>
                                    <input
                                        type="text"
                                        value={newVersion.version}
                                        onChange={(e) => setNewVersion(prev => ({ ...prev, version: e.target.value }))}
                                        placeholder="e.g., 1.1.0"
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">
                                        Version Notes
                                    </label>
                                    <textarea
                                        value={newVersion.versionNotes}
                                        onChange={(e) => setNewVersion(prev => ({ ...prev, versionNotes: e.target.value }))}
                                        placeholder="Describe what changed in this version..."
                                        rows={3}
                                        className="input"
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        className="btn-primary inline-flex items-center gap-2"
                                    >
                                        <span>✨</span>
                                        Create Version
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateVersion(false)}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Versions List */}
                    <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center glow-accent">
                                <span className="text-white text-sm">📜</span>
                            </div>
                            <h3 className="text-xl font-display font-bold gradient-text-accent">Version History</h3>
                        </div>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto"></div>
                                <p className="mt-4 font-body text-light-text-secondary dark:text-dark-text-secondary">Loading versions...</p>
                            </div>
                        ) : versions.length === 0 ? (
                            <div className="text-center py-8">
                                <DocumentDuplicateIcon className="h-12 w-12 text-accent-400 mx-auto mb-4 animate-pulse" />
                                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">No versions found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {versions.map((version) => (
                                    <div
                                        key={version.id}
                                        className={`glass p-4 rounded-lg border transition-all hover:shadow-lg ${version.id === dataset?._id
                                                ? 'border-primary-300/50 shadow-lg glow-primary'
                                                : 'border-secondary-200/30 hover:border-secondary-300/50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-display font-bold gradient-text-primary">
                                                            v{version.version}
                                                        </h4>
                                                        {version.id === dataset?._id && (
                                                            <span className="badge-primary">
                                                                Current
                                                            </span>
                                                        )}
                                                        <span className={`badge-${version.status === 'ready' ? 'success' : version.status === 'draft' ? 'warning' : 'secondary'}`}>
                                                            {version.status}
                                                        </span>
                                                    </div>
                                                    {version.versionNotes && (
                                                        <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mt-2">
                                                            {version.versionNotes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <div className="badge-info text-xs">
                                                    {version.itemCount} items
                                                </div>
                                                <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                                                    {new Date(version.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
