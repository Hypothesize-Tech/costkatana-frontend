import React, { useState } from 'react';
import { SessionReplay } from '../../types/sessionReplay.types';
import { AIInteractionCard } from './AIInteractionCard';

interface StatCardProps {
    label: string;
    value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
    return (
        <div className="bg-white dark:bg-secondary-800 rounded-lg p-2 sm:p-3 border border-secondary-200 dark:border-secondary-700">
            <div className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">{label}</div>
            <div className="text-sm sm:text-base md:text-lg font-semibold text-secondary-900 dark:text-secondary-100 break-words">{value}</div>
        </div>
    );
};

interface Props {
    session: SessionReplay;
}

export const SessionDetailsExpanded: React.FC<Props> = ({ session }) => {
    const [expandedInteraction, setExpandedInteraction] = useState<number | null>(null);

    const interactions = session.replayData?.aiInteractions || [];

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                <StatCard
                    label="Total Cost"
                    value={`$${session.summary?.totalCost?.toFixed(4) || '0.0000'}`}
                />
                <StatCard
                    label="Input Tokens"
                    value={session.summary?.totalTokens?.input?.toLocaleString() || '0'}
                />
                <StatCard
                    label="Output Tokens"
                    value={session.summary?.totalTokens?.output?.toLocaleString() || '0'}
                />
                <StatCard
                    label="Total Spans"
                    value={session.summary?.totalSpans || 0}
                />
            </div>

            {/* AI Interactions List */}
            <div className="space-y-2">
                <h4 className="font-semibold text-sm text-secondary-700 dark:text-secondary-300">
                    AI Interactions ({interactions.length})
                </h4>

                {interactions.length === 0 ? (
                    <div className="text-center py-8 text-secondary-500 dark:text-secondary-400 text-sm">
                        No AI interactions recorded yet
                    </div>
                ) : (
                    interactions.map((interaction, idx) => (
                        <AIInteractionCard
                            key={idx}
                            interaction={interaction}
                            isExpanded={expandedInteraction === idx}
                            onToggle={() => setExpandedInteraction(expandedInteraction === idx ? null : idx)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

