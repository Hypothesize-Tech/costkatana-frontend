import React, { useMemo } from 'react';
import { SessionPlayerData, AIInteraction, TrackingHistoryEntry } from '../../types/sessionReplay.types';

interface TimelineViewProps {
    sessionData: SessionPlayerData;
    onSelectEvent: (index: number) => void;
    currentIndex: number;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ sessionData, onSelectEvent, currentIndex }) => {
    const timelineEvents = useMemo(() => {
        const events: Array<{
            type: 'ai_interaction' | 'tracking_change';
            timestamp: string;
            data: AIInteraction | TrackingHistoryEntry;
            index: number;
        }> = [];

        sessionData.timeline.aiInteractions.forEach((interaction, index) => {
            events.push({
                type: 'ai_interaction',
                timestamp: interaction.timestamp,
                data: interaction,
                index
            });
        });

        sessionData.trackingHistory.forEach((entry) => {
            events.push({
                type: 'tracking_change',
                timestamp: entry.timestamp,
                data: entry,
                index: -1
            });
        });

        return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [sessionData]);

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    };

    const formatDuration = (timestamp: string) => {
        const start = new Date(sessionData.startedAt);
        const current = new Date(timestamp);
        const diff = current.getTime() - start.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const renderAIInteractionEvent = (interaction: AIInteraction, index: number, isSelected: boolean) => {
        return (
            <button
                onClick={() => onSelectEvent(index)}
                className={`w-full text-left p-3 rounded-lg transition-all ${isSelected
                    ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                    : 'bg-secondary-50 dark:bg-secondary-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-secondary-200/30 dark:border-secondary-700/30'
                    }`}
            >
                <div className="flex items-start gap-3">
                    <div className="mt-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-gradient-primary text-white'
                            }`}>
                            AI
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <span className={`font-semibold truncate ${isSelected
                                ? 'text-white'
                                : 'text-secondary-900 dark:text-secondary-100'
                                }`}>
                                {interaction.model}
                            </span>
                            <span className={`text-xs ml-2 ${isSelected
                                ? 'text-white/80'
                                : 'text-secondary-500 dark:text-secondary-400'
                                }`}>
                                {formatTimestamp(interaction.timestamp)}
                            </span>
                        </div>
                        <div className={`text-sm mb-1 ${isSelected
                            ? 'text-white/90'
                            : 'text-secondary-600 dark:text-secondary-400'
                            }`}>
                            {interaction.tokens ? `${interaction.tokens.input + interaction.tokens.output} tokens` : 'No token info'}
                            {interaction.cost && ` • $${interaction.cost.toFixed(6)}`}
                        </div>
                        <div className={`text-sm truncate ${isSelected
                            ? 'text-white/80'
                            : 'text-secondary-700 dark:text-secondary-300'
                            }`}>
                            {interaction.prompt.substring(0, 80)}...
                        </div>
                    </div>
                </div>
            </button>
        );
    };

    const renderTrackingChangeEvent = (entry: TrackingHistoryEntry) => {
        return (
            <div className="p-3 rounded-lg bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200/30 dark:border-secondary-700/30">
                <div className="flex items-start gap-3">
                    <div className="mt-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${entry.sessionReplayEnabled
                            ? 'bg-gradient-to-r from-success-500 to-success-600'
                            : 'bg-gradient-to-r from-warning-500 to-warning-600'
                            }`}>
                            {entry.sessionReplayEnabled ? 'ON' : 'OFF'}
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-secondary-900 dark:text-secondary-100">Tracking State Changed</span>
                            <span className="text-xs text-secondary-500 dark:text-secondary-400">{formatTimestamp(entry.timestamp)}</span>
                        </div>
                        <div className="text-sm text-secondary-700 dark:text-secondary-300">
                            {entry.sessionReplayEnabled ? 'Session replay enabled' : 'Session replay disabled'}
                        </div>
                        {entry.request && (
                            <div className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                                {entry.request.model} • {entry.request.tokens} tokens • ${entry.request.cost.toFixed(6)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-primary-200/30">
                <h3 className="text-lg font-display font-semibold gradient-text-primary">Timeline</h3>
                <div className="text-sm text-secondary-600 dark:text-secondary-400 mt-1 font-medium">
                    {timelineEvents.length} events
                </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {timelineEvents.map((event, idx) => {
                    if (event.type === 'ai_interaction') {
                        const interaction = event.data as AIInteraction;
                        return (
                            <div key={idx} className="relative">
                                {/* Timeline connector */}
                                {idx < timelineEvents.length - 1 && (
                                    <div className="absolute left-[19px] top-[44px] w-0.5 h-[calc(100%+12px)] bg-gradient-to-b from-primary-300 to-primary-200 dark:from-primary-700 dark:to-primary-800" />
                                )}
                                {/* Duration badge */}
                                <div className="absolute -left-2 top-[12px] text-xs text-secondary-500 dark:text-secondary-500 font-mono font-medium">
                                    {formatDuration(interaction.timestamp)}
                                </div>
                                <div className="ml-16">
                                    {renderAIInteractionEvent(interaction, event.index, currentIndex === event.index)}
                                </div>
                            </div>
                        );
                    } else {
                        const entry = event.data as TrackingHistoryEntry;
                        return (
                            <div key={idx} className="relative">
                                {idx < timelineEvents.length - 1 && (
                                    <div className="absolute left-[19px] top-[44px] w-0.5 h-[calc(100%+12px)] bg-gradient-to-b from-primary-300 to-primary-200 dark:from-primary-700 dark:to-primary-800" />
                                )}
                                <div className="absolute -left-2 top-[12px] text-xs text-secondary-500 dark:text-secondary-500 font-mono font-medium">
                                    {formatDuration(entry.timestamp)}
                                </div>
                                <div className="ml-16">
                                    {renderTrackingChangeEvent(entry)}
                                </div>
                            </div>
                        );
                    }
                })}
            </div>

            {/* Summary */}
            <div className="p-4 border-t border-primary-200/30 bg-secondary-50/50 dark:bg-secondary-900/20">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-success-50 dark:bg-success-900/20 rounded-lg p-3 border border-success-200/30">
                        <div className="text-xs text-secondary-600 dark:text-secondary-400 mb-1 font-medium">Total Cost</div>
                        <div className="text-lg font-bold text-success-700 dark:text-success-400">
                            ${sessionData.summary?.totalCost?.toFixed(4) || '0.00'}
                        </div>
                    </div>
                    <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 border border-primary-200/30">
                        <div className="text-xs text-secondary-600 dark:text-secondary-400 mb-1 font-medium">Total Tokens</div>
                        <div className="text-lg font-bold gradient-text-primary">
                            {sessionData.summary?.totalTokens
                                ? (sessionData.summary.totalTokens.input + sessionData.summary.totalTokens.output).toLocaleString()
                                : '0'}
                        </div>
                    </div>
                    <div className="bg-secondary-100 dark:bg-secondary-800/50 rounded-lg p-3 border border-secondary-200/30">
                        <div className="text-xs text-secondary-600 dark:text-secondary-400 mb-1 font-medium">Duration</div>
                        <div className="text-lg font-bold text-secondary-800 dark:text-secondary-200">
                            {Math.floor(sessionData.duration / 1000 / 60)}m
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

