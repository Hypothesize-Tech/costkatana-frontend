import React, { useState, useEffect } from 'react';
import {
    XMarkIcon,
    PlusIcon,
    TrashIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from '@heroicons/react/24/outline';
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
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6">
            <div className="flex justify-between items-center mb-3 sm:mb-4 md:mb-6 gap-3 sm:gap-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-display font-bold gradient-text-primary">
                    {webhook ? 'Edit Webhook' : 'Create Webhook'}
                </h2>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-light-text-secondary dark:text-dark-text-secondary hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300 p-1.5 sm:p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[36px] min-w-[36px] flex items-center justify-center flex-shrink-0 [touch-action:manipulation]"
                >
                    <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
            </div>

            {/* Basic Information */}
            <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4 md:mb-6">
                <div>
                    <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                        Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input w-full"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="input resize-none w-full"
                        rows={2}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                        URL *
                    </label>
                    <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="input w-full"
                        placeholder="https://example.com/webhook"
                        required
                    />
                </div>

                <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="rounded text-[#06ec9e] focus:ring-[#06ec9e] dark:text-emerald-400 dark:focus:ring-emerald-400"
                        />
                        <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Active</span>
                    </label>
                </div>
            </div>

            {/* Events Selection */}
            <div className="mb-3 sm:mb-4 md:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    Events *
                </label>
                <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50 p-2.5 sm:p-3 md:p-4 max-h-64 overflow-y-auto">
                    {eventCategories.map(category => (
                        <div key={category} className="mb-2.5 sm:mb-3 md:mb-4 last:mb-0">
                            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                <h4 className="font-medium text-xs sm:text-sm md:text-base text-light-text-primary dark:text-dark-text-primary capitalize">
                                    {category.replace(/_/g, ' ')}
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => selectAllInCategory(category)}
                                    className="text-xs text-[#06ec9e] dark:text-emerald-400 hover:text-[#009454] dark:hover:text-emerald-300 font-medium transition-colors min-h-[32px] px-2 [touch-action:manipulation]"
                                >
                                    Select all
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2">
                                {availableEvents
                                    .filter(e => e.category === category)
                                    .map(event => (
                                        <label
                                            key={event.value}
                                            className="flex items-center space-x-2 text-xs sm:text-sm cursor-pointer hover:bg-white/30 dark:hover:bg-dark-card/30 p-1 rounded transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.events.includes(event.value)}
                                                onChange={() => toggleEvent(event.value)}
                                                className="rounded text-[#06ec9e] focus:ring-[#06ec9e] dark:text-emerald-400 dark:focus:ring-emerald-400"
                                            />
                                            <span className="text-light-text-primary dark:text-dark-text-primary">{event.name}</span>
                                        </label>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Authentication Section */}
            <div className="mb-3 sm:mb-4 md:mb-6">
                <button
                    type="button"
                    onClick={() => toggleSection('authentication')}
                    className="flex items-center justify-between w-full text-left p-2 sm:p-2.5 rounded-lg hover:bg-white/30 dark:hover:bg-dark-card/30 transition-colors [touch-action:manipulation] min-h-[44px]"
                >
                    <h3 className="text-sm sm:text-base md:text-lg font-medium text-light-text-primary dark:text-dark-text-primary">Authentication</h3>
                    {expandedSections.authentication ? (
                        <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                    ) : (
                        <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                    )}
                </button>

                {expandedSections.authentication && (
                    <div className="mt-2 sm:mt-3 md:mt-4 space-y-2.5 sm:space-y-3 md:space-y-4 pl-1 sm:pl-2">
                        <div>
                            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                                Authentication Type
                            </label>
                            <select
                                value={formData.auth.type}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    auth: { ...formData.auth, type: e.target.value as 'none' | 'basic' | 'bearer' | 'custom_header' }
                                })}
                                className="input w-full"
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
                                    className="input w-full"
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
                                    className="input w-full"
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
                                className="input w-full"
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
                                    className="input w-full"
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
                                    className="input w-full"
                                />
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Custom Headers Section */}
            <div className="mb-3 sm:mb-4 md:mb-6">
                <button
                    type="button"
                    onClick={() => toggleSection('headers')}
                    className="flex items-center justify-between w-full text-left p-2 sm:p-2.5 rounded-lg hover:bg-white/30 dark:hover:bg-dark-card/30 transition-colors [touch-action:manipulation] min-h-[44px]"
                >
                    <h3 className="text-sm sm:text-base md:text-lg font-medium text-light-text-primary dark:text-dark-text-primary">Custom Headers</h3>
                    {expandedSections.headers ? (
                        <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                    ) : (
                        <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                    )}
                </button>

                {expandedSections.headers && (
                    <div className="mt-2 sm:mt-3 md:mt-4 pl-1 sm:pl-2">
                        <div className="space-y-2 mb-3 sm:mb-4">
                            {Object.entries(formData.headers).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-white/30 dark:bg-dark-card/30">
                                    <span className="flex-1 text-xs sm:text-sm text-light-text-primary dark:text-dark-text-primary break-all">
                                        <strong>{key}:</strong> {value}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeHeader(key)}
                                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center [touch-action:manipulation]"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                placeholder="Header Name"
                                value={newHeader.key}
                                onChange={(e) => setNewHeader({ ...newHeader, key: e.target.value })}
                                className="input flex-1"
                            />
                            <input
                                type="text"
                                placeholder="Header Value"
                                value={newHeader.value}
                                onChange={(e) => setNewHeader({ ...newHeader, value: e.target.value })}
                                className="input flex-1"
                            />
                            <button
                                type="button"
                                onClick={addHeader}
                                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 text-white rounded-lg hover:shadow-lg hover:shadow-[#06ec9e]/30 dark:hover:shadow-emerald-500/50 transition-all duration-300 min-h-[36px] flex items-center justify-center gap-2 [touch-action:manipulation] active:scale-95"
                            >
                                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Add</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Filters Section */}
            <div className="mb-3 sm:mb-4 md:mb-6">
                <button
                    type="button"
                    onClick={() => toggleSection('filters')}
                    className="flex items-center justify-between w-full text-left p-2 sm:p-2.5 rounded-lg hover:bg-white/30 dark:hover:bg-dark-card/30 transition-colors [touch-action:manipulation] min-h-[44px]"
                >
                    <h3 className="text-sm sm:text-base md:text-lg font-medium text-light-text-primary dark:text-dark-text-primary">Filters</h3>
                    {expandedSections.filters ? (
                        <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                    ) : (
                        <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                    )}
                </button>

                {expandedSections.filters && (
                    <div className="mt-2 sm:mt-3 md:mt-4 space-y-2.5 sm:space-y-3 md:space-y-4 pl-1 sm:pl-2">
                        <div>
                            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                                Severity Levels
                            </label>
                            <div className="space-y-2">
                                {['low', 'medium', 'high', 'critical'].map(severity => (
                                    <label key={severity} className="flex items-center space-x-2 cursor-pointer hover:bg-white/30 dark:hover:bg-dark-card/30 p-1 rounded transition-colors">
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
                                            className="rounded text-[#06ec9e] focus:ring-[#06ec9e] dark:text-emerald-400 dark:focus:ring-emerald-400"
                                        />
                                        <span className="capitalize text-sm text-light-text-primary dark:text-dark-text-primary">{severity}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                                Tags
                            </label>
                            <div className="space-y-2 mb-2">
                                {formData.filters.tags.map(tag => (
                                    <div key={tag} className="flex items-center gap-2 p-2 rounded-lg bg-white/30 dark:bg-dark-card/30">
                                        <span className="flex-1 text-xs sm:text-sm text-light-text-primary dark:text-dark-text-primary px-2 py-1">
                                            {tag}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center [touch-action:manipulation]"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="Add tag"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    className="input flex-1"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 text-white rounded-lg hover:shadow-lg hover:shadow-[#06ec9e]/30 dark:hover:shadow-emerald-500/50 transition-all duration-300 min-h-[36px] flex items-center justify-center gap-2 [touch-action:manipulation] active:scale-95"
                                >
                                    <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">Add</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
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
                                className="input w-full"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Advanced Settings */}
            <div className="mb-3 sm:mb-4 md:mb-6">
                <button
                    type="button"
                    onClick={() => toggleSection('advanced')}
                    className="flex items-center justify-between w-full text-left p-2 sm:p-2.5 rounded-lg hover:bg-white/30 dark:hover:bg-dark-card/30 transition-colors [touch-action:manipulation] min-h-[44px]"
                >
                    <h3 className="text-sm sm:text-base md:text-lg font-medium text-light-text-primary dark:text-dark-text-primary">Advanced Settings</h3>
                    {expandedSections.advanced ? (
                        <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                    ) : (
                        <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                    )}
                </button>

                {expandedSections.advanced && (
                    <div className="mt-2 sm:mt-3 md:mt-4 space-y-2.5 sm:space-y-3 md:space-y-4 pl-1 sm:pl-2">
                        <div>
                            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
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
                                className="input w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
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
                                className="input w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
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
                                className="input w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
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
                                className="input w-full"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-primary-200/30 dark:border-primary-500/20">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn-secondary w-full sm:w-auto min-h-[44px] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl [touch-action:manipulation] active:scale-95"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto min-h-[44px] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 text-white hover:shadow-lg hover:shadow-[#06ec9e]/30 dark:hover:shadow-emerald-500/50 transition-all duration-300 [touch-action:manipulation] active:scale-95"
                >
                    {webhook ? 'Update Webhook' : 'Create Webhook'}
                </button>
            </div>
        </form>
    );
};
