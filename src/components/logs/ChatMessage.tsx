import React from 'react';
import { FiCopy, FiCheckCircle, FiUser, FiCpu, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { ChatMessage as ChatMessageType } from '../../services/logQueryChat.service';

interface ChatMessageProps {
    message: ChatMessageType;
    type: 'user' | 'ai';
    onApply?: (visualization: ChatMessageType['visualization'], data: any[]) => void;
    onSuggestedQueryClick?: (query: string) => void;
}

const COLORS = ['#06ec9e', '#009454', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, type, onApply, onSuggestedQueryClick }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderVisualizationPreview = () => {
        if (!message.visualization || type !== 'ai') return null;

        const { type: vizType, data } = message.visualization;

        if (!data) return null;

        // Stat card preview
        if (vizType === 'stat-card') {
            const value = typeof data === 'object' && !Array.isArray(data) ?
                Object.values(data)[0] : data;

            return (
                <div className="mt-3 md:mt-4 p-4 md:p-6 bg-gradient-to-br from-primary-500/10 via-primary-400/5 to-transparent rounded-xl border-2 border-primary-500/30 shadow-lg">
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-md">
                            <FiTrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Result</span>
                    </div>
                    <div className="text-2xl md:text-4xl font-black gradient-text-primary mb-2">
                        {typeof value === 'number' ?
                            (value < 1 ? value.toFixed(4) : value.toLocaleString()) :
                            String(value)}
                    </div>
                    <div className="text-xs md:text-sm text-light-text-secondary dark:text-dark-text-secondary font-medium">
                        Based on {message.resultsCount || 0} log entr{message.resultsCount !== 1 ? 'ies' : 'y'}
                    </div>
                </div>
            );
        }

        // Chart previews
        if (Array.isArray(data) && data.length > 0) {
            // Line chart preview
            if (vizType === 'line') {
                return (
                    <div className="mt-3 md:mt-4 bg-light-panel dark:bg-dark-panel p-3 md:p-5 rounded-xl border-2 border-primary-200/30 dark:border-primary-500/20 shadow-lg">
                        <div className="text-xs md:text-sm font-bold text-light-text-primary dark:text-dark-text-primary mb-2 md:mb-3">Trend Analysis</div>
                        <ResponsiveContainer width="100%" height={140}>
                            <LineChart data={data.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    style={{ fontSize: '11px' }}
                                    tick={{ fill: '#64748b' }}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    style={{ fontSize: '11px' }}
                                    tick={{ fill: '#64748b' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '2px solid #06ec9e',
                                        borderRadius: '8px',
                                        padding: '8px 12px'
                                    }}
                                />
                                <Line type="monotone" dataKey="value" stroke="#06ec9e" strokeWidth={3} dot={{ fill: '#06ec9e', r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-3 text-center font-medium">
                            Showing {Math.min(data.length, 10)} of {data.length} data points
                        </div>
                    </div>
                );
            }

            // Bar chart preview
            if (vizType === 'bar') {
                return (
                    <div className="mt-3 md:mt-4 bg-light-panel dark:bg-dark-panel p-3 md:p-5 rounded-xl border-2 border-primary-200/30 dark:border-primary-500/20 shadow-lg">
                        <div className="text-xs md:text-sm font-bold text-light-text-primary dark:text-dark-text-primary mb-2 md:mb-3">Comparison Analysis</div>
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={data.slice(0, 8)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    style={{ fontSize: '11px' }}
                                    tick={{ fill: '#64748b' }}
                                    angle={-35}
                                    textAnchor="end"
                                    height={70}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    style={{ fontSize: '11px' }}
                                    tick={{ fill: '#64748b' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '2px solid #06ec9e',
                                        borderRadius: '8px',
                                        padding: '8px 12px'
                                    }}
                                />
                                <Bar dataKey="value" fill="#06ec9e" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-3 text-center font-medium">
                            Top {Math.min(data.length, 8)} of {data.length} results
                        </div>
                    </div>
                );
            }

            // Pie chart preview
            if (vizType === 'pie') {
                return (
                    <div className="mt-3 md:mt-4 bg-light-panel dark:bg-dark-panel p-3 md:p-5 rounded-xl border-2 border-primary-200/30 dark:border-primary-500/20 shadow-lg">
                        <div className="text-xs md:text-sm font-bold text-light-text-primary dark:text-dark-text-primary mb-2 md:mb-3">Distribution Analysis</div>
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie
                                    data={data.slice(0, 6)}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={70}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name.slice(0, 10)} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {data.slice(0, 6).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '2px solid #06ec9e',
                                        borderRadius: '8px',
                                        padding: '8px 12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-3 text-center font-medium">
                            Distribution across {data.length} categories
                        </div>
                    </div>
                );
            }

            // Table preview
            if (vizType === 'table') {
                const displayData = data.slice(0, 3);
                const keys = displayData.length > 0 ? Object.keys(displayData[0]).slice(0, 4) : [];

                return (
                    <div className="mt-3 md:mt-4 bg-light-panel dark:bg-dark-panel p-3 md:p-5 rounded-xl border-2 border-primary-200/30 dark:border-primary-500/20 shadow-lg overflow-x-auto">
                        <div className="text-xs md:text-sm font-bold text-light-text-primary dark:text-dark-text-primary mb-2 md:mb-3">Data Table</div>
                        <table className="min-w-full text-xs md:text-sm">
                            <thead>
                                <tr className="border-b-2 border-primary-200/30 dark:border-primary-500/20">
                                    {keys.map((key) => (
                                        <th key={key} className="px-3 py-2.5 text-left text-light-text-primary dark:text-dark-text-primary font-bold uppercase text-xs tracking-wider">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayData.map((row, idx) => (
                                    <tr key={idx} className="border-b border-primary-200/20 dark:border-primary-500/10 hover:bg-primary-500/5 transition-colors">
                                        {keys.map((key) => (
                                            <td key={key} className="px-3 py-3 text-light-text-secondary dark:text-dark-text-secondary font-medium">
                                                {String(row[key]).slice(0, 30)}
                                                {String(row[key]).length > 30 ? '...' : ''}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-4 text-center font-medium">
                            Showing 3 of {data.length} rows • Apply to dashboard for full view
                        </div>
                    </div>
                );
            }
        }

        return null;
    };

    return (
        <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-4 md:mb-6 animate-fade-in`}>
            <div className={`max-w-[95%] sm:max-w-[90%] md:max-w-[85%] ${type === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Avatar and Message Container */}
                <div className="flex items-start gap-3">
                    {type === 'ai' && (
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg glow-primary flex-shrink-0">
                            <FiCpu className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                    )}

                    <div className="flex-1">
                        <div
                            className={`rounded-xl md:rounded-2xl shadow-lg ${type === 'user'
                                ? 'bg-gradient-primary text-white px-3 py-3 md:px-5 md:py-4'
                                : 'bg-light-panel dark:bg-dark-panel border-2 border-primary-200/30 dark:border-primary-500/20 px-3 py-3 md:px-5 md:py-4'
                                }`}
                        >
                            {/* Message Header for AI */}
                            {type === 'ai' && (
                                <div className="flex items-center gap-2 mb-2 md:mb-3 pb-2 border-b border-primary-200/30 dark:border-primary-500/20">
                                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">AI Assistant</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                </div>
                            )}

                            <p className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap ${type === 'user'
                                ? 'text-white font-medium'
                                : 'text-light-text-primary dark:text-dark-text-primary'
                                }`}>
                                {message.content}
                            </p>

                            {renderVisualizationPreview()}

                            {type === 'ai' && (
                                <>
                                    <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-4 pt-3 md:pt-4 border-t-2 border-primary-200/30 dark:border-primary-500/20">
                                        {message.visualization && onApply && (
                                            <button
                                                onClick={() => onApply(message.visualization, message.visualization?.data || [])}
                                                className="flex-1 px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-bold bg-gradient-primary text-white rounded-lg md:rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 glow-primary shadow-lg flex items-center justify-center gap-1.5 md:gap-2"
                                            >
                                                <FiTrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                <span className="hidden sm:inline">Apply to Dashboard</span>
                                                <span className="sm:hidden">Apply</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={handleCopy}
                                            className="p-2 md:p-2.5 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 transition-all duration-300 rounded-lg md:rounded-xl hover:bg-primary-500/10 hover:scale-110"
                                            title="Copy response"
                                        >
                                            {copied ? (
                                                <FiCheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                                            ) : (
                                                <FiCopy className="w-4 h-4 md:w-5 md:h-5" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Suggested Queries */}
                                    {message.suggestedQueries && message.suggestedQueries.length > 0 && onSuggestedQueryClick && (
                                        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-primary-200/30 dark:border-primary-500/20">
                                            <div className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2 md:mb-3">
                                                Suggested Follow-up Questions
                                            </div>
                                            <div className="flex flex-col gap-1.5 md:gap-2">
                                                {message.suggestedQueries.map((query, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => onSuggestedQueryClick(query)}
                                                        className="group flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-light-surface dark:bg-dark-surface hover:bg-primary-500/10 dark:hover:bg-primary-500/10 rounded-lg transition-all duration-300 text-left border border-primary-200/30 dark:border-primary-500/20 hover:border-primary-500/50 hover:shadow-md"
                                                    >
                                                        <FiArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                                                        <span className="text-xs md:text-sm text-light-text-primary dark:text-dark-text-primary font-medium flex-1 text-left">
                                                            {query}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className={`flex items-center gap-1.5 md:gap-2 mt-1.5 md:mt-2 px-2 ${type === 'user' ? 'justify-end' : 'justify-start'
                            }`}>
                            {type === 'user' && (
                                <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                                    <FiUser className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                                </div>
                            )}
                            <span className="text-xs text-light-text-muted dark:text-dark-text-muted font-medium">
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    {type === 'user' && (
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-lg flex-shrink-0">
                            <FiUser className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

