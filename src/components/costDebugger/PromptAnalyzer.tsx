import React, { useState, useEffect } from 'react';
import { AIProvider, PromptAnalysis, DeadWeightAnalysis } from '../../types';

interface PromptAnalyzerProps {
    onAnalyze: (promptData: {
        prompt: string;
        provider: AIProvider;
        model: string;
        systemMessage?: string;
        conversationHistory?: Array<{ role: string; content: string }>;
        toolCalls?: Array<{ name: string; arguments: string }>;
        metadata?: Record<string, any>;
    }) => void;
    analysis: PromptAnalysis | null;
    deadWeight: DeadWeightAnalysis | null;
    isAnalyzing: boolean;
}

const PROVIDER_MODELS: Record<AIProvider, string[]> = {
    [AIProvider.OpenAI]: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    [AIProvider.Anthropic]: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    [AIProvider.AWSBedrock]: ['anthropic.claude-3-sonnet', 'anthropic.claude-3-haiku', 'amazon.nova-pro-v1'],
    [AIProvider.Google]: ['gemini-pro', 'gemini-flash'],
    [AIProvider.Cohere]: ['command', 'command-light'],
    [AIProvider.Gemini]: ['gemini-pro', 'gemini-flash'],
    [AIProvider.DeepSeek]: ['deepseek-chat', 'deepseek-coder'],
    [AIProvider.Groq]: ['llama3-8b-8192', 'llama3-70b-8192'],
    [AIProvider.HuggingFace]: ['meta-llama/Llama-2-7b-chat-hf'],
    [AIProvider.Ollama]: ['llama2', 'codellama'],
    [AIProvider.Replicate]: ['meta/llama-2-70b-chat'],
    [AIProvider.Azure]: ['gpt-4', 'gpt-35-turbo']
};

export const PromptAnalyzer: React.FC<PromptAnalyzerProps> = ({
    onAnalyze,
    analysis,
    deadWeight,
    isAnalyzing
}) => {
    const [prompt, setPrompt] = useState('');
    const [provider, setProvider] = useState<AIProvider>(AIProvider.OpenAI);
    const [model, setModel] = useState('gpt-4');
    const [systemMessage, setSystemMessage] = useState('');
    const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
    const [toolCalls, setToolCalls] = useState<Array<{ name: string; arguments: string }>>([]);
    const [metadata, setMetadata] = useState<Record<string, any>>({});
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [realTimeTokens, setRealTimeTokens] = useState(0);
    const [realTimeCost, setRealTimeCost] = useState(0);

    // Update model when provider changes
    useEffect(() => {
        const models = PROVIDER_MODELS[provider];
        if (models && models.length > 0) {
            setModel(models[0]);
        }
    }, [provider, model]);

    // Real-time token/cost estimation
    useEffect(() => {
        if (prompt.trim()) {
            // Simple estimation: ~4 characters per token
            const estimatedTokens = Math.ceil(prompt.length / 4);
            setRealTimeTokens(estimatedTokens);

            // Rough cost estimation (this would be more accurate with real pricing)
            const estimatedCost = estimatedTokens * 0.000002; // Rough estimate
            setRealTimeCost(estimatedCost);
        } else {
            setRealTimeTokens(0);
            setRealTimeCost(0);
        }
    }, [prompt]);

    const handleAnalyze = () => {
        if (prompt.trim()) {
            onAnalyze({
                prompt,
                provider,
                model,
                systemMessage: systemMessage.trim() || undefined,
                conversationHistory: conversationHistory.length > 0 ? conversationHistory : undefined,
                toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                metadata: Object.keys(metadata).length > 0 ? { ...metadata, timestamp: new Date().toISOString() } : { timestamp: new Date().toISOString() }
            });
        }
    };

    const addConversationMessage = () => {
        setConversationHistory([...conversationHistory, { role: 'user', content: '' }]);
    };

    const updateConversationMessage = (index: number, field: 'role' | 'content', value: string) => {
        const updated = [...conversationHistory];
        updated[index] = { ...updated[index], [field]: value };
        setConversationHistory(updated);
    };

    const removeConversationMessage = (index: number) => {
        setConversationHistory(conversationHistory.filter((_, i) => i !== index));
    };

    const addToolCall = () => {
        setToolCalls([...toolCalls, { name: '', arguments: '' }]);
    };

    const updateToolCall = (index: number, field: 'name' | 'arguments', value: string) => {
        const updated = [...toolCalls];
        updated[index] = { ...updated[index], [field]: value };
        setToolCalls(updated);
    };

    const removeToolCall = (index: number) => {
        setToolCalls(toolCalls.filter((_, i) => i !== index));
    };

    const addMetadataField = () => {
        const key = `field_${Object.keys(metadata).length + 1}`;
        setMetadata({ ...metadata, [key]: '' });
    };

    const updateMetadataField = (oldKey: string, newKey: string, value: string) => {
        const updated = { ...metadata };
        if (oldKey !== newKey) {
            delete updated[oldKey];
        }
        updated[newKey] = value;
        setMetadata(updated);
    };

    const removeMetadataField = (key: string) => {
        const updated = { ...metadata };
        delete updated[key];
        setMetadata(updated);
    };

    const clearAll = () => {
        setPrompt('');
        setSystemMessage('');
        setConversationHistory([]);
        setToolCalls([]);
        setMetadata({});
        setRealTimeTokens(0);
        setRealTimeCost(0);
    };

    return (
        <div className="prompt-analyzer">
            <div className="analyzer-header">
                <h2>🔍 Prompt Analyzer</h2>
                <p>Analyze your AI prompts for cost optimization opportunities</p>
            </div>

            <div className="input-section">
                <label className="input-label">💬 Your Prompt</label>
                <textarea
                    className="prompt-textarea"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your AI prompt here..."
                    rows={6}
                />
            </div>

            <div className="provider-selection">
                <div className="selection-group">
                    <label className="input-label">🏢 Provider</label>
                    <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value as AIProvider)}
                        className="provider-select"
                    >
                        {Object.values(AIProvider).map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>

                <div className="selection-group">
                    <label className="input-label">📋 Model</label>
                    <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="model-select"
                    >
                        {PROVIDER_MODELS[provider]?.map((m: string) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="advanced-toggle">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="toggle-button"
                >
                    {showAdvanced ? '▼' : '▶'} Advanced Options
                </button>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
                <div className="advanced-options">
                    {/* System Message */}
                    <div className="input-section">
                        <label className="input-label">⚙️ System Message (Optional)</label>
                        <textarea
                            className="system-textarea"
                            value={systemMessage}
                            onChange={(e) => setSystemMessage(e.target.value)}
                            placeholder="Define the AI's role or behavior..."
                            rows={3}
                        />
                    </div>

                    {/* Conversation History */}
                    <div className="input-section">
                        <div className="history-header">
                            <label className="input-label">💬 Conversation History (Optional)</label>
                            <button
                                type="button"
                                onClick={addConversationMessage}
                                className="add-message-btn"
                            >
                                + Add Message
                            </button>
                        </div>

                        {conversationHistory.map((message, index) => (
                            <div key={index} className="conversation-message">
                                <select
                                    value={message.role}
                                    onChange={(e) => updateConversationMessage(index, 'role', e.target.value)}
                                    className="role-select"
                                >
                                    <option value="user">User</option>
                                    <option value="assistant">Assistant</option>
                                    <option value="system">System</option>
                                </select>

                                <textarea
                                    value={message.content}
                                    onChange={(e) => updateConversationMessage(index, 'content', e.target.value)}
                                    placeholder={`${message.role} message...`}
                                    className="message-textarea"
                                    rows={2}
                                />

                                <button
                                    type="button"
                                    onClick={() => removeConversationMessage(index)}
                                    className="remove-message-btn"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Tool Calls */}
                    <div className="input-section">
                        <div className="history-header">
                            <label className="input-label">🔧 Tool Calls (Optional)</label>
                            <button
                                type="button"
                                onClick={addToolCall}
                                className="add-message-btn"
                            >
                                + Add Tool Call
                            </button>
                        </div>

                        {toolCalls.map((toolCall, index) => (
                            <div key={index} className="conversation-message">
                                <input
                                    type="text"
                                    value={toolCall.name}
                                    onChange={(e) => updateToolCall(index, 'name', e.target.value)}
                                    placeholder="Tool name (e.g., search_web)"
                                    className="input w-32 flex-shrink-0"
                                />

                                <textarea
                                    value={toolCall.arguments}
                                    onChange={(e) => updateToolCall(index, 'arguments', e.target.value)}
                                    placeholder='Tool arguments (JSON format, e.g., {"query": "search term"})'
                                    className="input flex-1 min-h-[60px] resize-y"
                                    rows={2}
                                />

                                <button
                                    type="button"
                                    onClick={() => removeToolCall(index)}
                                    className="remove-message-btn"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Metadata */}
                    <div className="input-section">
                        <div className="history-header">
                            <label className="input-label">📋 Metadata (Optional)</label>
                            <button
                                type="button"
                                onClick={addMetadataField}
                                className="add-message-btn"
                            >
                                + Add Field
                            </button>
                        </div>

                        {Object.entries(metadata).map(([key, value]) => (
                            <div key={key} className="conversation-message">
                                <input
                                    type="text"
                                    value={key}
                                    onChange={(e) => updateMetadataField(key, e.target.value, value as string)}
                                    placeholder="Field name"
                                    className="input w-32 flex-shrink-0"
                                />

                                <input
                                    type="text"
                                    value={value as string}
                                    onChange={(e) => updateMetadataField(key, key, e.target.value)}
                                    placeholder="Field value"
                                    className="input flex-1"
                                />

                                <button
                                    type="button"
                                    onClick={() => removeMetadataField(key)}
                                    className="remove-message-btn"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
                <button
                    onClick={handleAnalyze}
                    disabled={!prompt.trim() || isAnalyzing}
                    className="analyze-btn"
                >
                    {isAnalyzing ? '🔍 Analyzing...' : '🚀 Analyze Prompt'}
                </button>

                <button
                    onClick={clearAll}
                    type="button"
                    className="clear-btn"
                >
                    🗑️ Clear All
                </button>
            </div>

            {/* Quick Results */}
            {realTimeTokens > 0 && (
                <div className="quick-results">
                    <div className="result-item">
                        <span className="label">Estimated Tokens:</span>
                        <span className="value">{realTimeTokens.toLocaleString()}</span>
                    </div>
                    <div className="result-item">
                        <span className="label">Estimated Cost:</span>
                        <span className="value">${realTimeCost.toFixed(6)}</span>
                    </div>
                </div>
            )}

            {/* Analysis Results */}
            {analysis && (
                <div className="analysis-results">
                    <h3>📊 Analysis Results</h3>
                    <div className="results-grid">
                        <div className="result-card">
                            <h4>Token Breakdown</h4>
                            <p>Total: {analysis.totalTokens?.toLocaleString() || '0'} tokens</p>
                            <p>Cost: ${analysis.totalCost?.toFixed(6) || '0.000000'}</p>
                        </div>

                        <div className="result-card">
                            <h4>Quality Score</h4>
                            <p>Overall: {analysis.qualityMetrics?.overallScore?.toFixed(1) || '0'}/100</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Dead Weight Summary */}
            {deadWeight && (
                <div className="dead-weight-summary">
                    <h3>💀 Dead Weight Detected</h3>
                    <p>Potential savings: ${deadWeight.estimatedSavings?.toFixed(6) || '0.000000'}</p>
                </div>
            )}
        </div>
    );
};
