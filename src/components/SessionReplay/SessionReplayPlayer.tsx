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
                <div className="glass rounded-xl p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-display font-semibold gradient-text-primary flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                AI Interaction
                            </h3>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                                {formatTimestamp(interaction.timestamp)}
                            </p>
                        </div>
                        <div className="px-4 py-2 bg-gradient-primary text-white rounded-lg font-bold shadow-lg">
                            {interaction.model}
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-4">
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

                <div className="glass rounded-xl p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30">
                    <h4 className="text-md font-display font-semibold gradient-text-primary mb-3">Prompt</h4>
                    <div className="bg-secondary-50 dark:bg-secondary-900/50 rounded-lg p-4 max-h-64 overflow-y-auto border border-secondary-200/30 dark:border-secondary-700/30">
                        <pre className="whitespace-pre-wrap text-sm text-secondary-800 dark:text-secondary-200">{interaction.prompt}</pre>
                    </div>
                </div>

                <div className="glass rounded-xl p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30">
                    <h4 className="text-md font-display font-semibold gradient-text-primary mb-3">Response</h4>
                    <div className="bg-secondary-50 dark:bg-secondary-900/50 rounded-lg p-4 max-h-64 overflow-y-auto border border-secondary-200/30 dark:border-secondary-700/30">
                        <pre className="whitespace-pre-wrap text-sm text-secondary-800 dark:text-secondary-200">{interaction.response}</pre>
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
            <div className="space-y-4">
                <div className="glass rounded-xl p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-display font-semibold gradient-text-primary">Code Context</h3>
                        <span className="text-sm text-secondary-600 dark:text-secondary-400 font-mono">{latestSnapshot.filePath}</span>
                    </div>
                </div>

                <div className="glass rounded-xl overflow-hidden bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30">
                    <SyntaxHighlighter
                        language={latestSnapshot.language || 'typescript'}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, maxHeight: '500px', background: 'transparent' }}
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
            <div className="space-y-4">
                <div className="glass rounded-xl p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30">
                    <h3 className="text-lg font-display font-semibold gradient-text-primary mb-6">System Metrics</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border border-primary-200/30">
                            <div className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">CPU Usage</div>
                            <div className="text-2xl font-bold gradient-text-primary">
                                {latestMetric.cpu?.toFixed(2)}%
                            </div>
                        </div>
                        <div className="bg-success-50 dark:bg-success-900/20 rounded-lg p-4 border border-success-200/30">
                            <div className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Memory Usage</div>
                            <div className="text-2xl font-bold text-success-700 dark:text-success-400">
                                {latestMetric.memory?.toFixed(2)}%
                            </div>
                        </div>
                        <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-lg p-4 border border-secondary-200/30">
                            <div className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Network Sent</div>
                            <div className="text-2xl font-bold text-secondary-800 dark:text-secondary-200">
                                {(latestMetric.network?.sent || 0) / 1024} KB
                            </div>
                        </div>
                        <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-lg p-4 border border-secondary-200/30">
                            <div className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Network Received</div>
                            <div className="text-2xl font-bold text-secondary-800 dark:text-secondary-200">
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
            <div className="p-6 border-b border-primary-200/30">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-display font-bold gradient-text-primary">{sessionData.label || sessionData.sessionId}</h2>
                        <div className="flex flex-wrap gap-3 mt-3">
                            <span className="px-3 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-lg text-sm font-medium">
                                Duration: {Math.floor(sessionData.duration / 1000 / 60)}m
                            </span>
                            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-lg text-sm font-medium">
                                Interactions: {allEvents.length}
                            </span>
                            <span className="px-3 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 rounded-lg text-sm font-medium">
                                Cost: {formatCost(sessionData.summary?.totalCost)}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${sessionData.trackingEnabled
                                ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                                : 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-400'
                                }`}>
                                {sessionData.trackingEnabled ? '● Tracking On' : '○ Tracking Off'}
                            </span>
                            {sessionData.sessionReplayEnabled && (
                                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                                    ● Replay Enabled
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-primary-200/30 bg-secondary-50/30 dark:bg-secondary-900/20">
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedTab('interaction')}
                        className={`py-3 px-6 font-display font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${selectedTab === 'interaction'
                            ? 'border-primary-500 gradient-text-primary'
                            : 'border-transparent text-secondary-600 dark:text-secondary-400 hover:text-primary-500 dark:hover:text-primary-400'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        AI Interaction
                    </button>
                    <button
                        onClick={() => setSelectedTab('code')}
                        className={`py-3 px-6 font-display font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${selectedTab === 'code'
                            ? 'border-primary-500 gradient-text-primary'
                            : 'border-transparent text-secondary-600 dark:text-secondary-400 hover:text-primary-500 dark:hover:text-primary-400'
                            }`}
                    >
                        <Code2 className="w-4 h-4" />
                        Code Context
                    </button>
                    <button
                        onClick={() => setSelectedTab('metrics')}
                        className={`py-3 px-6 font-display font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${selectedTab === 'metrics'
                            ? 'border-primary-500 gradient-text-primary'
                            : 'border-transparent text-secondary-600 dark:text-secondary-400 hover:text-primary-500 dark:hover:text-primary-400'
                            }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        System Metrics
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {selectedTab === 'interaction' && currentEvent && renderAIInteraction(currentEvent)}
                {selectedTab === 'code' && renderCodeSnapshot()}
                {selectedTab === 'metrics' && renderMetrics()}
            </div>

            {/* Controls */}
            <div className="p-6 border-t border-primary-200/30 bg-secondary-50/50 dark:bg-secondary-900/20">
                {/* Progress bar */}
                <div className="mb-4">
                    <div className="relative w-full h-3 bg-secondary-200 dark:bg-secondary-800 rounded-full cursor-pointer overflow-hidden">
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
                    <div className="flex justify-between text-xs text-secondary-600 dark:text-secondary-400 mt-2 font-medium">
                        <span>Event {currentIndex + 1} of {allEvents.length}</span>
                        <span>{formatTimestamp(currentEvent?.timestamp || sessionData.startedAt)}</span>
                    </div>
                </div>

                {/* Playback controls */}
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => handleSeek(currentIndex - 1)}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                    >
                        <SkipBack className="w-4 h-4" />
                        Previous
                    </button>
                    <button
                        onClick={handlePlayPause}
                        className="flex items-center gap-2 px-8 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-xl transition-all font-semibold glow-primary"
                    >
                        {isPlaying ? (
                            <>
                                <Pause className="w-5 h-5" />
                                Pause
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5" />
                                Play
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => handleSeek(currentIndex + 1)}
                        disabled={currentIndex >= allEvents.length - 1}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                    >
                        Next
                        <SkipForward className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary-100 dark:bg-secondary-800 rounded-lg border border-secondary-300 dark:border-secondary-700">
                        <Activity className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                        <select
                            value={playbackSpeed}
                            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                            className="bg-transparent text-secondary-800 dark:text-secondary-200 font-medium cursor-pointer outline-none"
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

