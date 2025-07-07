import React, { useState, useEffect } from 'react';
import {
    FiPlay,
    FiCopy,
    FiDownload,
    FiSend,
    FiEye,
    FiRefreshCw,
    FiZap,
    FiClock,
    FiCheck,
    FiSearch,
    FiSettings,
    FiTarget,
    FiBookmark
} from 'react-icons/fi';
import { PromptTemplate } from '../../types/promptTemplate.types';
import { PromptTemplateService } from '../../services/promptTemplate.service';

interface TemplateUsageProps {
    initialTemplate?: PromptTemplate;
    onTemplateUsed?: (template: PromptTemplate, variables: Record<string, string>, generatedPrompt: string) => void;
}

interface UsageSession {
    templateId: string;
    variables: Record<string, string>;
    generatedPrompt: string;
    estimatedTokens: number;
    estimatedCost: number;
    timestamp: string;
}

export const TemplateUsage: React.FC<TemplateUsageProps> = ({
    initialTemplate,
    onTemplateUsed
}) => {
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(initialTemplate || null);
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copying, setCopying] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [recentSessions, setRecentSessions] = useState<UsageSession[]>([]);
    const [estimatedTokens, setEstimatedTokens] = useState(0);
    const [estimatedCost, setEstimatedCost] = useState(0);

    const categories = [
        { value: 'all', label: 'All Templates' },
        { value: 'coding', label: 'Coding' },
        { value: 'writing', label: 'Writing' },
        { value: 'analysis', label: 'Analysis' },
        { value: 'creative', label: 'Creative' },
        { value: 'business', label: 'Business' }
    ];

    useEffect(() => {
        loadTemplates();
        loadRecentSessions();
    }, []);

    useEffect(() => {
        if (selectedTemplate) {
            // Initialize variables with default values
            const initialVars: Record<string, string> = {};
            selectedTemplate.variables.forEach(variable => {
                initialVars[variable.name] = variable.defaultValue || '';
            });
            setVariables(initialVars);
            generatePrompt(selectedTemplate, initialVars);
        }
    }, [selectedTemplate]);

    useEffect(() => {
        if (selectedTemplate) {
            generatePrompt(selectedTemplate, variables);
        }
    }, [variables]);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const data = await PromptTemplateService.getTemplates();
            setTemplates(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading templates:', error);
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    const loadRecentSessions = () => {
        const stored = localStorage.getItem('templateUsageSessions');
        if (stored) {
            setRecentSessions(JSON.parse(stored));
        }
    };

    const saveSession = (session: UsageSession) => {
        const updatedSessions = [session, ...recentSessions.slice(0, 9)]; // Keep last 10
        setRecentSessions(updatedSessions);
        localStorage.setItem('templateUsageSessions', JSON.stringify(updatedSessions));
    };

    const generatePrompt = async (template: PromptTemplate, vars: Record<string, string>) => {
        if (!template) return;

        setGenerating(true);
        try {
            let prompt = template.content;
            
            // Replace variables
            template.variables.forEach(variable => {
                const value = vars[variable.name] || variable.defaultValue || `[${variable.name}]`;
                const regex = new RegExp(`{{${variable.name}}}`, 'g');
                prompt = prompt.replace(regex, value);
            });

            setGeneratedPrompt(prompt);
            
            // Estimate tokens and cost (simplified calculation)
            const tokens = Math.ceil(prompt.length / 4); // Rough estimation
            const cost = tokens * 0.00002; // Rough GPT-4 pricing
            
            setEstimatedTokens(tokens);
            setEstimatedCost(cost);

        } catch (error) {
            console.error('Error generating prompt:', error);
        } finally {
            setGenerating(false);
        }
    };

    const handleVariableChange = (name: string, value: string) => {
        setVariables(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUseTemplate = async () => {
        if (!selectedTemplate) return;

        const session: UsageSession = {
            templateId: selectedTemplate._id,
            variables: { ...variables },
            generatedPrompt,
            estimatedTokens,
            estimatedCost,
            timestamp: new Date().toISOString()
        };

        saveSession(session);
        
        if (onTemplateUsed) {
            onTemplateUsed(selectedTemplate, variables, generatedPrompt);
        }

        // Track usage in analytics
        try {
            await PromptTemplateService.useTemplate(selectedTemplate._id, variables);
        } catch (error) {
            console.error('Error tracking template usage:', error);
        }
    };

    const handleCopyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(generatedPrompt);
            setCopying(true);
            setTimeout(() => setCopying(false), 2000);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
        }
    };

    const handleDownloadPrompt = () => {
        const blob = new Blob([generatedPrompt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedTemplate?.name.replace(/\s+/g, '_') || 'prompt'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = !searchQuery ||
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const getCategoryColor = (category: string) => {
        const colors = {
            coding: '#3B82F6',
            writing: '#10B981',
            analysis: '#8B5CF6',
            creative: '#F59E0B',
            business: '#6366F1',
            general: '#6B7280'
        };
        return colors[category as keyof typeof colors] || colors.general;
    };

    return (
        <div className="template-usage">
            <style>{`
                .template-usage {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    height: 100vh;
                    background: #f8fafc;
                }

                .sidebar {
                    background: white;
                    border-right: 1px solid #e5e7eb;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .sidebar-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                }

                .sidebar-title {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .sidebar-search {
                    position: relative;
                    margin-bottom: 1rem;
                }

                .search-input {
                    width: 100%;
                    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    transition: border-color 0.2s ease;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .search-icon {
                    position: absolute;
                    left: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #6b7280;
                    width: 16px;
                    height: 16px;
                }

                .category-filter {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    background: white;
                    font-size: 0.9rem;
                    color: #374151;
                }

                .template-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                }

                .template-item {
                    padding: 1rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    margin-bottom: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: white;
                }

                .template-item:hover {
                    border-color: #667eea;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
                }

                .template-item.selected {
                    border-color: #667eea;
                    background: #eef2ff;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
                }

                .template-name {
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                    line-height: 1.3;
                }

                .template-category {
                    display: inline-block;
                    padding: 0.2rem 0.5rem;
                    border-radius: 50px;
                    font-size: 0.7rem;
                    font-weight: 500;
                    text-transform: uppercase;
                    color: white;
                    margin-bottom: 0.5rem;
                }

                .template-description {
                    color: #6b7280;
                    font-size: 0.8rem;
                    line-height: 1.4;
                    margin-bottom: 0.5rem;
                }

                .template-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.7rem;
                    color: #9ca3af;
                }

                .main-content {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .content-header {
                    background: white;
                    padding: 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .content-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .action-buttons {
                    display: flex;
                    gap: 0.75rem;
                }

                .btn {
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border: none;
                    font-size: 0.9rem;
                }

                .btn-primary {
                    background: #667eea;
                    color: white;
                }

                .btn-primary:hover {
                    background: #5a67d8;
                    transform: translateY(-1px);
                }

                .btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                    border: 1px solid #d1d5db;
                }

                .btn-secondary:hover {
                    background: #e5e7eb;
                }

                .btn-success {
                    background: #10b981;
                    color: white;
                }

                .btn-success:hover {
                    background: #059669;
                }

                .btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none !important;
                }

                .workspace {
                    flex: 1;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    padding: 1.5rem;
                    overflow: hidden;
                }

                .variables-panel {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid #e5e7eb;
                    overflow-y: auto;
                }

                .panel-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .variable-group {
                    margin-bottom: 1.5rem;
                }

                .variable-label {
                    display: block;
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                }

                .variable-description {
                    font-size: 0.8rem;
                    color: #6b7280;
                    margin-bottom: 0.5rem;
                }

                .variable-input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    transition: border-color 0.2s ease;
                    font-family: inherit;
                    resize: vertical;
                    min-height: 60px;
                }

                .variable-input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .variable-input.required {
                    border-left: 4px solid #f59e0b;
                }

                .preview-panel {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid #e5e7eb;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .preview-content {
                    flex: 1;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 1rem;
                    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                    font-size: 0.9rem;
                    line-height: 1.6;
                    color: #374151;
                    overflow-y: auto;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    margin-bottom: 1rem;
                }

                .preview-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .stat-item {
                    background: #f8fafc;
                    padding: 1rem;
                    border-radius: 8px;
                    text-align: center;
                    border: 1px solid #e2e8f0;
                }

                .stat-value {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #1f2937;
                    display: block;
                    margin-bottom: 0.25rem;
                }

                .stat-label {
                    font-size: 0.8rem;
                    color: #6b7280;
                }

                .cost-stat .stat-value {
                    color: #059669;
                }

                .tokens-stat .stat-value {
                    color: #2563eb;
                }

                .recent-sessions {
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e5e7eb;
                }

                .session-item {
                    padding: 0.75rem;
                    background: #f9fafb;
                    border-radius: 6px;
                    margin-bottom: 0.5rem;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    border: 1px solid #e5e7eb;
                }

                .session-item:hover {
                    background: #f3f4f6;
                }

                .session-template {
                    font-weight: 500;
                    color: #1f2937;
                    font-size: 0.85rem;
                    margin-bottom: 0.25rem;
                }

                .session-time {
                    font-size: 0.75rem;
                    color: #6b7280;
                }

                .empty-state {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: #6b7280;
                }

                .empty-icon {
                    width: 48px;
                    height: 48px;
                    margin: 0 auto 1rem;
                    color: #d1d5db;
                }

                .loading-state {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 200px;
                    color: #6b7280;
                }

                .loading-spinner {
                    animation: spin 1s linear infinite;
                    margin-right: 0.5rem;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 1024px) {
                    .template-usage {
                        grid-template-columns: 1fr;
                        height: auto;
                    }
                    
                    .sidebar {
                        border-right: none;
                        border-bottom: 1px solid #e5e7eb;
                        max-height: 40vh;
                    }
                    
                    .workspace {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                }

                @media (max-width: 768px) {
                    .workspace {
                        padding: 1rem;
                    }
                    
                    .preview-stats {
                        grid-template-columns: 1fr;
                        gap: 0.5rem;
                    }
                    
                    .action-buttons {
                        flex-wrap: wrap;
                        gap: 0.5rem;
                    }
                    
                    .btn {
                        padding: 0.5rem 1rem;
                        font-size: 0.8rem;
                    }
                }
            `}</style>

            <div className="sidebar">
                <div className="sidebar-header">
                    <h2 className="sidebar-title">
                        <FiPlay />
                        Use Templates
                    </h2>
                    
                    <div className="sidebar-search">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <select
                        className="category-filter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="template-list">
                    {loading ? (
                        <div className="loading-state">
                            <FiRefreshCw className="loading-spinner" />
                            Loading templates...
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="empty-state">
                            <FiTarget className="empty-icon" />
                            <p>No templates found</p>
                        </div>
                    ) : (
                        filteredTemplates.map(template => (
                            <div
                                key={template._id}
                                className={`template-item ${selectedTemplate?._id === template._id ? 'selected' : ''}`}
                                onClick={() => setSelectedTemplate(template)}
                            >
                                <div className="template-name">{template.name}</div>
                                <span
                                    className="template-category"
                                    style={{ backgroundColor: getCategoryColor(template.category) }}
                                >
                                    {template.category}
                                </span>
                                <div className="template-description">
                                    {template.description || 'No description available'}
                                </div>
                                <div className="template-meta">
                                    <span>{template.variables.length} variables</span>
                                    <span>{template.usage.count} uses</span>
                                </div>
                            </div>
                        ))
                    )}

                    {recentSessions.length > 0 && (
                        <div className="recent-sessions">
                            <h4 className="panel-title">
                                <FiClock />
                                Recent Sessions
                            </h4>
                            {recentSessions.slice(0, 5).map((session, index) => {
                                const template = templates.find(t => t._id === session.templateId);
                                return (
                                    <div
                                        key={index}
                                        className="session-item"
                                        onClick={() => {
                                            if (template) {
                                                setSelectedTemplate(template);
                                                setVariables(session.variables);
                                            }
                                        }}
                                    >
                                        <div className="session-template">
                                            {template?.name || 'Unknown Template'}
                                        </div>
                                        <div className="session-time">
                                            {new Date(session.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="main-content">
                <div className="content-header">
                    <h1 className="content-title">
                        <FiZap />
                        {selectedTemplate ? selectedTemplate.name : 'Select a Template'}
                    </h1>
                    
                    {selectedTemplate && (
                        <div className="action-buttons">
                            <button
                                className="btn btn-secondary"
                                onClick={handleCopyPrompt}
                                disabled={!generatedPrompt || copying}
                            >
                                {copying ? <FiCheck /> : <FiCopy />}
                                {copying ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={handleDownloadPrompt}
                                disabled={!generatedPrompt}
                            >
                                <FiDownload />
                                Download
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={handleUseTemplate}
                                disabled={!generatedPrompt}
                            >
                                <FiSend />
                                Use Template
                            </button>
                        </div>
                    )}
                </div>

                {selectedTemplate ? (
                    <div className="workspace">
                        <div className="variables-panel">
                            <h3 className="panel-title">
                                <FiSettings />
                                Template Variables
                            </h3>
                            
                            {selectedTemplate.variables.length === 0 ? (
                                <div className="empty-state">
                                    <p>This template has no variables to configure.</p>
                                </div>
                            ) : (
                                selectedTemplate.variables.map(variable => (
                                    <div key={variable.name} className="variable-group">
                                        <label className="variable-label">
                                            {variable.name}
                                            {variable.required && <span style={{ color: '#f59e0b' }}> *</span>}
                                        </label>
                                        {variable.description && (
                                            <div className="variable-description">
                                                {variable.description}
                                            </div>
                                        )}
                                        <textarea
                                            className={`variable-input ${variable.required ? 'required' : ''}`}
                                            value={variables[variable.name] || ''}
                                            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                                            placeholder={variable.defaultValue || `Enter ${variable.name}...`}
                                            rows={3}
                                        />
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="preview-panel">
                            <h3 className="panel-title">
                                <FiEye />
                                Generated Prompt
                            </h3>
                            
                            <div className="preview-content">
                                {generating ? 'Generating...' : generatedPrompt || 'Select a template to see the preview'}
                            </div>

                            <div className="preview-stats">
                                <div className="stat-item tokens-stat">
                                    <span className="stat-value">{estimatedTokens.toLocaleString()}</span>
                                    <div className="stat-label">Est. Tokens</div>
                                </div>
                                <div className="stat-item cost-stat">
                                    <span className="stat-value">${estimatedCost.toFixed(4)}</span>
                                    <div className="stat-label">Est. Cost</div>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{selectedTemplate.usage.count}</span>
                                    <div className="stat-label">Total Uses</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <FiBookmark className="empty-icon" />
                        <h3>Select a Template to Get Started</h3>
                        <p>Choose a template from the sidebar to fill in variables and generate your prompt.</p>
                    </div>
                )}
            </div>
        </div>
    );
}; 