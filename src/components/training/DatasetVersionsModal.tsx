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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Dataset Versions - {dataset?.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Create New Version */}
                    {!showCreateVersion ? (
                        <div className="mb-6">
                            <button
                                onClick={() => {
                                    setShowCreateVersion(true);
                                    generateNextVersion();
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                <PlusIcon className="h-4 w-4" />
                                <span>Create New Version</span>
                            </button>
                        </div>
                    ) : (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Version</h3>
                            <form onSubmit={handleCreateVersion} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Version Number
                                    </label>
                                    <input
                                        type="text"
                                        value={newVersion.version}
                                        onChange={(e) => setNewVersion(prev => ({ ...prev, version: e.target.value }))}
                                        placeholder="e.g., 1.1.0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Version Notes
                                    </label>
                                    <textarea
                                        value={newVersion.versionNotes}
                                        onChange={(e) => setNewVersion(prev => ({ ...prev, versionNotes: e.target.value }))}
                                        placeholder="Describe what changed in this version..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Create Version
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateVersion(false)}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Versions List */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Version History</h3>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">Loading versions...</p>
                            </div>
                        ) : versions.length === 0 ? (
                            <div className="text-center py-8">
                                <DocumentDuplicateIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No versions found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {versions.map((version) => (
                                    <div
                                        key={version.id}
                                        className={`p-4 border rounded-lg ${version.id === dataset?._id
                                            ? 'border-blue-300 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="font-medium text-gray-900">
                                                            v{version.version}
                                                        </h4>
                                                        {version.id === dataset?._id && (
                                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                                                Current
                                                            </span>
                                                        )}
                                                        <span className={`px-2 py-0.5 text-xs rounded ${version.status === 'ready'
                                                            ? 'bg-green-100 text-green-800'
                                                            : version.status === 'draft'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {version.status}
                                                        </span>
                                                    </div>
                                                    {version.versionNotes && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {version.versionNotes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-600">
                                                    {version.itemCount} items
                                                </div>
                                                <div className="text-xs text-gray-500">
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
