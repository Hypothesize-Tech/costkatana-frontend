import React, { useState, useEffect, useCallback } from 'react';
import { SessionPlayerData, AIInteraction } from '../../types/sessionReplay.types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Play, Pause, SkipBack, SkipForward, Code2, BarChart3, MessageSquare, Zap, DollarSign, Clock, Activity } from 'lucide-react';

interface SessionReplayPlayerProps {
    sessionData: SessionPlayerData;
}

export const SessionReplayPlayer: React.FC<SessionReplayPlayerProps> = ({ sessionData }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [selectedTab, setSelectedTab] = useState<'interaction' | 'code' | 'metrics'>('interaction');

    const allEvents = [...sessionData.timeline.aiInteractions].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const currentEvent = allEvents[currentIndex];
    const progress = (currentIndex / (allEvents.length - 1)) * 100 || 0;

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => {
                if (prev >= allEvents.length - 1) {
                    setIsPlaying(false);
                    return prev;
                }
                return prev + 1;
            });
        }, 2000 / playbackSpeed);

        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed, allEvents.length]);

    const handlePlayPause = useCallback(() => {
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const handleSeek = useCallback((index: number) => {
        setCurrentIndex(Math.max(0, Math.min(index, allEvents.length - 1)));
    }, [allEvents.length]);

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    const formatCost = (cost?: number) => {
        if (!cost) return '$0.00';
        return `$${cost.toFixed(6)}`;
    };

    const renderAIInteraction = (interaction: AIInteraction) => {
        const totalTokens = (interaction.tokens?.input || 0) + (interaction.tokens?.output || 0);

        return (
            <div className="space-y-4">
                {/* Interaction Header with Metrics */}
                <div className="glass rounded-xl p-4 sm:p-5 md:p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-display font-semibold gradient-text-primary flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                AI Interaction
                            </h3>
                            <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                                {formatTimestamp(interaction.timestamp)}
                            </p>
                        </div>
                        <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-primary text-white rounded-lg text-xs sm:text-sm font-bold shadow-lg whitespace-nowrap">
                            {interaction.model}
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div className="bg-success-50 dark:bg-success-900/20 rounded-lg p-4 border border-success-200/30">
                            <div className="flex items-center gap-2 text-success-700 dark:text-success-400 mb-1">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-xs font-medium">Cost</span>
                            </div>
                            <div className="text-2xl font-bold text-success-700 dark:text-success-400">
                                {formatCost(interaction.cost)}
                            </div>
                        </div>

                        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border border-primary-200/30">
                            <div className="flex items-center gap-2 text-primary-700 dark:text-primary-400 mb-1">
                                <Zap className="w-4 h-4" />
                                <span className="text-xs font-medium">Tokens</span>
                            </div>
                            <div className="text-2xl font-bold gradient-text-primary">
                                {totalTokens.toLocaleString()}
                            </div>
                            <div className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                                {interaction.tokens?.input || 0} in • {interaction.tokens?.output || 0} out
                            </div>
                        </div>

                        {interaction.latency && (
                            <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-lg p-4 border border-secondary-200/30">
                                <div className="flex items-center gap-2 text-secondary-700 dark:text-secondary-300 mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-xs font-medium">Latency</span>
                                </div>
                                <div className="text-2xl font-bold text-secondary-800 dark:text-secondary-200">
                                    {interaction.latency}ms
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Parameters if available */}
                    {interaction.parameters && Object.keys(interaction.parameters).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-primary-200/30">
                            <div className="text-xs font-medium text-secondary-600 dark:text-secondary-400 mb-2">Parameters</div>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(interaction.parameters).map(([key, value]) => (
                                    <span key={key} className="px-2 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded text-xs">
                                        {key}: {String(value)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="glass rounded-xl p-4 sm:p-5 md:p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30">
                    <h4 className="text-sm sm:text-base font-display font-semibold gradient-text-primary mb-2 sm:mb-3">Prompt</h4>
                    <div className="bg-secondary-50 dark:bg-secondary-900/50 rounded-lg p-3 sm:p-4 max-h-48 sm:max-h-64 overflow-y-auto border border-secondary-200/30 dark:border-secondary-700/30">
                        <pre className="whitespace-pre-wrap text-xs sm:text-sm text-secondary-800 dark:text-secondary-200 break-words">{interaction.prompt}</pre>
                    </div>
                </div>

                <div className="glass rounded-xl p-4 sm:p-5 md:p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30">
                    <h4 className="text-sm sm:text-base font-display font-semibold gradient-text-primary mb-2 sm:mb-3">Response</h4>
                    <div className="bg-secondary-50 dark:bg-secondary-900/50 rounded-lg p-3 sm:p-4 max-h-48 sm:max-h-64 overflow-y-auto border border-secondary-200/30 dark:border-secondary-700/30">
                        <pre className="whitespace-pre-wrap text-xs sm:text-sm text-secondary-800 dark:text-secondary-200 break-words">{interaction.response}</pre>
                    </div>
                </div>
            </div>
        );
    };

    const renderCodeSnapshot = () => {
        const codeSnapshotsAtTime = sessionData.codeSnapshots.filter(
            (snapshot) => new Date(snapshot.timestamp) <= new Date(currentEvent?.timestamp || new Date())
        );
        const latestSnapshot = codeSnapshotsAtTime[codeSnapshotsAtTime.length - 1];

        if (!latestSnapshot) {
            return (
                <div className="glass rounded-xl p-8 bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30 text-center">
                    <p className="text-secondary-600 dark:text-secondary-400">No code snapshots available at this time</p>
                </div>
            );
        }

        return (
            <div className="space-y-3 sm:space-y-4">
                <div className="glass rounded-xl p-4 sm:p-5 md:p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                        <h3 className="text-base sm:text-lg font-display font-semibold gradient-text-primary">Code Context</h3>
                        <span className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 font-mono truncate">{latestSnapshot.filePath}</span>
                    </div>
                </div>

                <div className="glass rounded-xl overflow-hidden bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30">
                    <SyntaxHighlighter
                        language={latestSnapshot.language || 'typescript'}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, maxHeight: '400px', background: 'transparent', fontSize: '12px' }}
                    >
                        {latestSnapshot.content}
                    </SyntaxHighlighter>
                </div>
            </div>
        );
    };

    const renderMetrics = () => {
        const metricsAtTime = sessionData.timeline.systemMetrics.filter(
            (metric) => new Date(metric.timestamp) <= new Date(currentEvent?.timestamp || new Date())
        );
        const latestMetric = metricsAtTime[metricsAtTime.length - 1];

        if (!latestMetric) {
            return (
                <div className="glass rounded-xl p-8 bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30 text-center">
                    <p className="text-secondary-600 dark:text-secondary-400">No system metrics available at this time</p>
                </div>
            );
        }

        return (
            <div className="space-y-3 sm:space-y-4">
                <div className="glass rounded-xl p-4 sm:p-5 md:p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30">
                    <h3 className="text-base sm:text-lg font-display font-semibold gradient-text-primary mb-4 sm:mb-5 md:mb-6">System Metrics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 sm:p-4 border border-primary-200/30">
                            <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 mb-1">CPU Usage</div>
                            <div className="text-xl sm:text-2xl font-bold gradient-text-primary">
                                {latestMetric.cpu?.toFixed(2)}%
                            </div>
                        </div>
                        <div className="bg-success-50 dark:bg-success-900/20 rounded-lg p-3 sm:p-4 border border-success-200/30">
                            <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 mb-1">Memory Usage</div>
                            <div className="text-xl sm:text-2xl font-bold text-success-700 dark:text-success-400">
                                {latestMetric.memory?.toFixed(2)}%
                            </div>
                        </div>
                        <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-lg p-3 sm:p-4 border border-secondary-200/30">
                            <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 mb-1">Network Sent</div>
                            <div className="text-xl sm:text-2xl font-bold text-secondary-800 dark:text-secondary-200">
                                {(latestMetric.network?.sent || 0) / 1024} KB
                            </div>
                        </div>
                        <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-lg p-3 sm:p-4 border border-secondary-200/30">
                            <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 mb-1">Network Received</div>
                            <div className="text-xl sm:text-2xl font-bold text-secondary-800 dark:text-secondary-200">
                                {(latestMetric.network?.received || 0) / 1024} KB
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="p-4 sm:p-5 md:p-6 border-b border-primary-200/30">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-display font-bold gradient-text-primary truncate">{sessionData.label || sessionData.sessionId}</h2>
                        <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3">
                            <span className="px-2 sm:px-3 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-lg text-xs sm:text-sm font-medium">
                                Duration: {Math.floor(sessionData.duration / 1000 / 60)}m
                            </span>
                            <span className="px-2 sm:px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-lg text-xs sm:text-sm font-medium">
                                Interactions: {allEvents.length}
                            </span>
                            <span className="px-2 sm:px-3 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 rounded-lg text-xs sm:text-sm font-medium">
                                Cost: {formatCost(sessionData.summary?.totalCost)}
                            </span>
                            <span className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium ${sessionData.trackingEnabled
                                ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                                : 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-400'
                                }`}>
                                {sessionData.trackingEnabled ? '● Tracking On' : '○ Tracking Off'}
                            </span>
                            {sessionData.sessionReplayEnabled && (
                                <span className="px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                                    ● Replay Enabled
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-3 sm:px-4 md:px-6 border-b border-primary-200/30 bg-secondary-50/30 dark:bg-secondary-900/20 overflow-x-auto">
                <div className="flex gap-1 sm:gap-2 min-w-max">
                    <button
                        onClick={() => setSelectedTab('interaction')}
                        className={`py-2 sm:py-3 px-3 sm:px-6 font-display font-semibold text-xs sm:text-sm transition-all border-b-2 flex items-center gap-1 sm:gap-2 whitespace-nowrap ${selectedTab === 'interaction'
                            ? 'border-primary-500 gradient-text-primary'
                            : 'border-transparent text-secondary-600 dark:text-secondary-400 hover:text-primary-500 dark:hover:text-primary-400'
                            }`}
                    >
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">AI Interaction</span>
                        <span className="sm:hidden">AI</span>
                    </button>
                    <button
                        onClick={() => setSelectedTab('code')}
                        className={`py-2 sm:py-3 px-3 sm:px-6 font-display font-semibold text-xs sm:text-sm transition-all border-b-2 flex items-center gap-1 sm:gap-2 whitespace-nowrap ${selectedTab === 'code'
                            ? 'border-primary-500 gradient-text-primary'
                            : 'border-transparent text-secondary-600 dark:text-secondary-400 hover:text-primary-500 dark:hover:text-primary-400'
                            }`}
                    >
                        <Code2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Code Context</span>
                        <span className="sm:hidden">Code</span>
                    </button>
                    <button
                        onClick={() => setSelectedTab('metrics')}
                        className={`py-2 sm:py-3 px-3 sm:px-6 font-display font-semibold text-xs sm:text-sm transition-all border-b-2 flex items-center gap-1 sm:gap-2 whitespace-nowrap ${selectedTab === 'metrics'
                            ? 'border-primary-500 gradient-text-primary'
                            : 'border-transparent text-secondary-600 dark:text-secondary-400 hover:text-primary-500 dark:hover:text-primary-400'
                            }`}
                    >
                        <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">System Metrics</span>
                        <span className="sm:hidden">Metrics</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                {selectedTab === 'interaction' && currentEvent && renderAIInteraction(currentEvent)}
                {selectedTab === 'code' && renderCodeSnapshot()}
                {selectedTab === 'metrics' && renderMetrics()}
            </div>

            {/* Controls */}
            <div className="p-3 sm:p-4 md:p-6 border-t border-primary-200/30 bg-secondary-50/50 dark:bg-secondary-900/20">
                {/* Progress bar */}
                <div className="mb-3 sm:mb-4">
                    <div className="relative w-full h-2 sm:h-3 bg-secondary-200 dark:bg-secondary-800 rounded-full cursor-pointer overflow-hidden">
                        <div
                            className="absolute h-full bg-gradient-primary rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                        <input
                            type="range"
                            min="0"
                            max={allEvents.length - 1}
                            value={currentIndex}
                            onChange={(e) => handleSeek(parseInt(e.target.value))}
                            className="absolute w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between text-xs text-secondary-600 dark:text-secondary-400 mt-1 sm:mt-2 font-medium gap-1 sm:gap-0">
                        <span>Event {currentIndex + 1} of {allEvents.length}</span>
                        <span>{formatTimestamp(currentEvent?.timestamp || sessionData.startedAt)}</span>
                    </div>
                </div>

                {/* Playback controls */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                    <button
                        onClick={() => handleSeek(currentIndex - 1)}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-medium"
                    >
                        <SkipBack className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                    </button>
                    <button
                        onClick={handlePlayPause}
                        className="flex items-center gap-1 sm:gap-2 px-4 sm:px-8 py-2 sm:py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-xl transition-all text-xs sm:text-sm font-semibold glow-primary"
                    >
                        {isPlaying ? (
                            <>
                                <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Pause</span>
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Play</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => handleSeek(currentIndex + 1)}
                        disabled={currentIndex >= allEvents.length - 1}
                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-medium"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-secondary-100 dark:bg-secondary-800 rounded-lg border border-secondary-300 dark:border-secondary-700">
                        <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-600 dark:text-secondary-400" />
                        <select
                            value={playbackSpeed}
                            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                            className="bg-transparent text-xs sm:text-sm text-secondary-800 dark:text-secondary-200 font-medium cursor-pointer outline-none"
                        >
                            <option value="0.5">0.5x</option>
                            <option value="1">1x</option>
                            <option value="1.5">1.5x</option>
                            <option value="2">2x</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

