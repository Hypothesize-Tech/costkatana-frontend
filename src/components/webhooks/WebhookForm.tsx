import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { IWebhook } from '../../types/webhook.types';
import { webhookApi } from '../../services/webhook.api';

interface WebhookFormProps {
    webhook?: IWebhook | null;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export const WebhookForm: React.FC<WebhookFormProps> = ({
    webhook,
    onSubmit,
    onCancel
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        url: '',
        active: true,
        events: [] as string[],
        auth: {
            type: 'none' as 'none' | 'basic' | 'bearer' | 'custom_header',
            credentials: {
                username: '',
                password: '',
                token: '',
                headerName: '',
                headerValue: ''
            }
        },
        filters: {
            severity: [] as string[],
            tags: [] as string[],
            minCost: 0
        },
        headers: {} as Record<string, string>,
        useDefaultPayload: true,
        payloadTemplate: '',
        timeout: 30000,
        retryConfig: {
            maxRetries: 5,
            backoffMultiplier: 2,
            initialDelay: 5000
        }
    });

    const [availableEvents, setAvailableEvents] = useState<any[]>([]);
    const [eventCategories, setEventCategories] = useState<string[]>([]);
    const [expandedSections, setExpandedSections] = useState({
        authentication: false,
        filters: false,
        headers: false,
        payload: false,
        advanced: false
    });
    const [newHeader, setNewHeader] = useState({ key: '', value: '' });
    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        loadAvailableEvents();
        if (webhook) {
            setFormData({
                name: webhook.name,
                description: webhook.description || '',
                url: webhook.url,
                active: webhook.active,
                events: webhook.events,
                auth: webhook.auth ? {
                    type: webhook.auth.type as 'none' | 'basic' | 'bearer' | 'custom_header',
                    credentials: {
                        username: '',
                        password: '',
                        token: '',
                        headerName: '',
                        headerValue: ''
                    }
                } : formData.auth,
                filters: webhook.filters ? {
                    severity: webhook.filters.severity || [],
                    tags: webhook.filters.tags || [],
                    minCost: webhook.filters.minCost || 0
                } : formData.filters,
                headers: webhook.headers || {},
                useDefaultPayload: webhook.useDefaultPayload,
                payloadTemplate: webhook.payloadTemplate || '',
                timeout: webhook.timeout,
                retryConfig: webhook.retryConfig ? { ...webhook.retryConfig } : formData.retryConfig
            });
        }
    }, [webhook]);

    const loadAvailableEvents = async () => {
        try {
            const data = await webhookApi.getAvailableEvents();
            setAvailableEvents(data.events);
            setEventCategories(data.categories);
        } catch (error) {
            console.error('Error loading events:', error);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const addHeader = () => {
        if (newHeader.key && newHeader.value) {
            setFormData(prev => ({
                ...prev,
                headers: {
                    ...prev.headers,
                    [newHeader.key]: newHeader.value
                }
            }));
            setNewHeader({ key: '', value: '' });
        }
    };

    const removeHeader = (key: string) => {
        setFormData(prev => {
            const { [key]: _, ...rest } = prev.headers;
            return { ...prev, headers: rest };
        });
    };

    const addTag = () => {
        if (newTag && !formData.filters.tags.includes(newTag)) {
            setFormData(prev => ({
                ...prev,
                filters: {
                    ...prev.filters,
                    tags: [...prev.filters.tags, newTag]
                }
            }));
            setNewTag('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            filters: {
                ...prev.filters,
                tags: prev.filters.tags.filter(t => t !== tag)
            }
        }));
    };

    const toggleEvent = (eventValue: string) => {
        setFormData(prev => ({
            ...prev,
            events: prev.events.includes(eventValue)
                ? prev.events.filter(e => e !== eventValue)
                : [...prev.events, eventValue]
        }));
    };

    const selectAllInCategory = (category: string) => {
        const categoryEvents = availableEvents
            .filter(e => e.category === category)
            .map(e => e.value);

        setFormData(prev => ({
            ...prev,
            events: [...new Set([...prev.events, ...categoryEvents])]
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                    {webhook ? 'Edit Webhook' : 'Create Webhook'}
                </h2>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Basic Information */}
            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL *
                    </label>
                    <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/webhook"
                        required
                    />
                </div>

                <div>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                </div>
            </div>

            {/* Events Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Events *
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {eventCategories.map(category => (
                        <div key={category} className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900 capitalize">
                                    {category.replace(/_/g, ' ')}
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => selectAllInCategory(category)}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                    Select all
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {availableEvents
                                    .filter(e => e.category === category)
                                    .map(event => (
                                        <label
                                            key={event.value}
                                            className="flex items-center space-x-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.events.includes(event.value)}
                                                onChange={() => toggleEvent(event.value)}
                                                className="rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <span>{event.name}</span>
                                        </label>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Authentication Section */}
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => toggleSection('authentication')}
                    className="flex items-center justify-between w-full text-left"
                >
                    <h3 className="text-lg font-medium">Authentication</h3>
                    {expandedSections.authentication ? <ChevronUp /> : <ChevronDown />}
                </button>

                {expandedSections.authentication && (
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Authentication Type
                            </label>
                            <select
                                value={formData.auth.type}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    auth: { ...formData.auth, type: e.target.value as any }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="none">None</option>
                                <option value="basic">Basic Auth</option>
                                <option value="bearer">Bearer Token</option>
                                <option value="custom_header">Custom Header</option>
                            </select>
                        </div>

                        {formData.auth.type === 'basic' && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={formData.auth.credentials.username}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        auth: {
                                            ...formData.auth,
                                            credentials: {
                                                ...formData.auth.credentials,
                                                username: e.target.value
                                            }
                                        }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={formData.auth.credentials.password}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        auth: {
                                            ...formData.auth,
                                            credentials: {
                                                ...formData.auth.credentials,
                                                password: e.target.value
                                            }
                                        }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </>
                        )}

                        {formData.auth.type === 'bearer' && (
                            <input
                                type="password"
                                placeholder="Bearer Token"
                                value={formData.auth.credentials.token}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    auth: {
                                        ...formData.auth,
                                        credentials: {
                                            ...formData.auth.credentials,
                                            token: e.target.value
                                        }
                                    }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        )}

                        {formData.auth.type === 'custom_header' && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Header Name"
                                    value={formData.auth.credentials.headerName}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        auth: {
                                            ...formData.auth,
                                            credentials: {
                                                ...formData.auth.credentials,
                                                headerName: e.target.value
                                            }
                                        }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="password"
                                    placeholder="Header Value"
                                    value={formData.auth.credentials.headerValue}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        auth: {
                                            ...formData.auth,
                                            credentials: {
                                                ...formData.auth.credentials,
                                                headerValue: e.target.value
                                            }
                                        }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Custom Headers Section */}
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => toggleSection('headers')}
                    className="flex items-center justify-between w-full text-left"
                >
                    <h3 className="text-lg font-medium">Custom Headers</h3>
                    {expandedSections.headers ? <ChevronUp /> : <ChevronDown />}
                </button>

                {expandedSections.headers && (
                    <div className="mt-4">
                        <div className="space-y-2 mb-4">
                            {Object.entries(formData.headers).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <span className="flex-1 text-sm">
                                        <strong>{key}:</strong> {value}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeHeader(key)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Header Name"
                                value={newHeader.key}
                                onChange={(e) => setNewHeader({ ...newHeader, key: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <input
                                type="text"
                                placeholder="Header Value"
                                value={newHeader.value}
                                onChange={(e) => setNewHeader({ ...newHeader, value: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={addHeader}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Filters Section */}
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => toggleSection('filters')}
                    className="flex items-center justify-between w-full text-left"
                >
                    <h3 className="text-lg font-medium">Filters</h3>
                    {expandedSections.filters ? <ChevronUp /> : <ChevronDown />}
                </button>

                {expandedSections.filters && (
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Severity Levels
                            </label>
                            <div className="space-y-2">
                                {['low', 'medium', 'high', 'critical'].map(severity => (
                                    <label key={severity} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.filters.severity.includes(severity)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({
                                                        ...formData,
                                                        filters: {
                                                            ...formData.filters,
                                                            severity: [...formData.filters.severity, severity]
                                                        }
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        filters: {
                                                            ...formData.filters,
                                                            severity: formData.filters.severity.filter(s => s !== severity)
                                                        }
                                                    });
                                                }
                                            }}
                                            className="rounded text-blue-600"
                                        />
                                        <span className="capitalize">{severity}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tags
                            </label>
                            <div className="space-y-2 mb-2">
                                {formData.filters.tags.map(tag => (
                                    <div key={tag} className="flex items-center gap-2">
                                        <span className="flex-1 text-sm bg-gray-100 px-2 py-1 rounded">
                                            {tag}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add tag"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Minimum Cost ($)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.filters.minCost}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    filters: {
                                        ...formData.filters,
                                        minCost: parseFloat(e.target.value) || 0
                                    }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Advanced Settings */}
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => toggleSection('advanced')}
                    className="flex items-center justify-between w-full text-left"
                >
                    <h3 className="text-lg font-medium">Advanced Settings</h3>
                    {expandedSections.advanced ? <ChevronUp /> : <ChevronDown />}
                </button>

                {expandedSections.advanced && (
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Timeout (ms)
                            </label>
                            <input
                                type="number"
                                min="5000"
                                max="120000"
                                step="1000"
                                value={formData.timeout}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    timeout: parseInt(e.target.value) || 30000
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Retries
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={formData.retryConfig.maxRetries}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    retryConfig: {
                                        ...formData.retryConfig,
                                        maxRetries: parseInt(e.target.value) || 5
                                    }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Backoff Multiplier
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                step="0.5"
                                value={formData.retryConfig.backoffMultiplier}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    retryConfig: {
                                        ...formData.retryConfig,
                                        backoffMultiplier: parseFloat(e.target.value) || 2
                                    }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Initial Retry Delay (ms)
                            </label>
                            <input
                                type="number"
                                min="1000"
                                max="60000"
                                step="1000"
                                value={formData.retryConfig.initialDelay}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    retryConfig: {
                                        ...formData.retryConfig,
                                        initialDelay: parseInt(e.target.value) || 5000
                                    }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    {webhook ? 'Update Webhook' : 'Create Webhook'}
                </button>
            </div>
        </form>
    );
};
