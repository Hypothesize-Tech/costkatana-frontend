import React, { useState } from 'react';
import {
    FiClock,
    FiUser,
    FiFileText,
    FiCopy,
    FiDownload,
    FiRotateCcw,
    FiEye,
    FiX
} from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { PromptTemplate } from '../../types/promptTemplate.types';

interface TemplateVersion {
    id: string;
    version: number;
    content: string;
    changes: string[];
    author: {
        id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    changesSummary: string;
    isActive: boolean;
}

interface TemplateVersionHistoryProps {
    template: PromptTemplate;
    onClose: () => void;
    onRevert: (versionId: string) => void;
    onCompare: (versionId1: string, versionId2: string) => void;
}

export const TemplateVersionHistory: React.FC<TemplateVersionHistoryProps> = ({
    template,
    onClose,
    onRevert,
    onCompare
}) => {
    const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
    const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set());
    const [viewingContent, setViewingContent] = useState<string | null>(null);

    // Mock version history - in real app, this would come from API
    const versions: TemplateVersion[] = [
        {
            id: 'v3',
            version: 3,
            content: template.content,
            changes: ['Updated prompt structure', 'Added new variables', 'Improved clarity'],
            author: { id: '1', name: 'John Doe', email: 'john@example.com' },
            createdAt: template.updatedAt,
            changesSummary: 'Major content restructure and variable updates',
            isActive: true
        },
        {
            id: 'v2',
            version: 2,
            content: 'Previous version of the template content...',
            changes: ['Fixed grammar issues', 'Added context examples'],
            author: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
            createdAt: '2024-01-15T10:30:00Z',
            changesSummary: 'Grammar fixes and example additions',
            isActive: false
        },
        {
            id: 'v1',
            version: 1,
            content: 'Original template content...',
            changes: ['Initial version'],
            author: { id: '1', name: 'John Doe', email: 'john@example.com' },
            createdAt: '2024-01-10T09:00:00Z',
            changesSummary: 'Initial template creation',
            isActive: false
        }
    ];

    const toggleVersionExpansion = (versionId: string) => {
        const newExpanded = new Set(expandedVersions);
        if (newExpanded.has(versionId)) {
            newExpanded.delete(versionId);
        } else {
            newExpanded.add(versionId);
        }
        setExpandedVersions(newExpanded);
    };

    const toggleVersionSelection = (versionId: string) => {
        const newSelected = new Set(selectedVersions);
        if (newSelected.has(versionId)) {
            newSelected.delete(versionId);
        } else {
            if (newSelected.size < 2) {
                newSelected.add(versionId);
            } else {
                // Replace oldest selection
                const [first] = Array.from(newSelected);
                newSelected.delete(first);
                newSelected.add(versionId);
            }
        }
        setSelectedVersions(newSelected);
    };

    const handleCompare = () => {
        if (selectedVersions.size === 2) {
            const [version1, version2] = Array.from(selectedVersions);
            onCompare(version1, version2);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCopyContent = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            // Could add toast notification here
        } catch (error) {
            console.error('Failed to copy content:', error);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Version History" size="xl">
            <div className="flex flex-col h-full max-h-[80vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {template.name} - Version History
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Track changes and revert to previous versions
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {selectedVersions.size === 2 && (
                                <button
                                    onClick={handleCompare}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                >
                                    Compare Selected
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Version List */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-4">
                        {versions.map((version) => (
                            <div
                                key={version.id}
                                className={`border rounded-lg transition-all ${version.isActive
                                    ? 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                                    } ${selectedVersions.has(version.id)
                                        ? 'ring-2 ring-blue-500 ring-opacity-50'
                                        : ''
                                    }`}
                            >
                                <div className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedVersions.has(version.id)}
                                                onChange={() => toggleVersionSelection(version.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="flex items-center gap-2">
                                                <FiFileText className="w-5 h-5 text-gray-400" />
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    Version {version.version}
                                                </span>
                                                {version.isActive && (
                                                    <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-800 dark:text-blue-200">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <FiUser className="w-4 h-4" />
                                                    <span>{version.author.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <FiClock className="w-4 h-4" />
                                                    <span>{formatDate(version.createdAt)}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setViewingContent(version.content)}
                                                    className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    title="View content"
                                                >
                                                    <FiEye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleCopyContent(version.content)}
                                                    className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    title="Copy content"
                                                >
                                                    <FiCopy className="w-4 h-4" />
                                                </button>
                                                {!version.isActive && (
                                                    <button
                                                        onClick={() => onRevert(version.id)}
                                                        className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        title="Revert to this version"
                                                    >
                                                        <FiRotateCcw className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => toggleVersionExpansion(version.id)}
                                                    className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    {expandedVersions.has(version.id) ? (
                                                        <FiX className="w-4 h-4" />
                                                    ) : (
                                                        <FiX className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {version.changesSummary}
                                        </p>
                                    </div>

                                    {expandedVersions.has(version.id) && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                Changes in this version:
                                            </h4>
                                            <ul className="space-y-1">
                                                {version.changes.map((change, index) => (
                                                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                                        • {change}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Viewer Modal */}
                {viewingContent && (
                    <Modal
                        isOpen={true}
                        onClose={() => setViewingContent(null)}
                        title="Version Content"
                        size="lg"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Template Content
                                </h3>
                                <button
                                    onClick={() => handleCopyContent(viewingContent)}
                                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <FiCopy className="w-4 h-4" />
                                    Copy
                                </button>
                            </div>
                            <pre className="p-4 text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 rounded-lg dark:bg-gray-800 dark:text-gray-100 max-h-96 overflow-y-auto">
                                {viewingContent}
                            </pre>
                        </div>
                    </Modal>
                )}
            </div>
        </Modal>
    );
}; 