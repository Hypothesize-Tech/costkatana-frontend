import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PlayCircleIcon, BugAntIcon } from '@heroicons/react/24/outline';
import { SessionReplayPage } from './SessionReplayPage';
import { Sessions as DebugSessions } from './Sessions';

export const SessionsUnified: React.FC = () => {
    const { sessionId } = useParams<{ sessionId?: string }>();
    const [activeTab, setActiveTab] = useState<'replays' | 'debug'>('replays');

    // If sessionId is provided in URL, show the replay player directly
    if (sessionId) {
        return <SessionReplayPage />;
    }

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 mb-8">
                    <h1 className="text-3xl font-display font-bold gradient-text-primary mb-2">Sessions</h1>
                    <p className="text-secondary-600 dark:text-secondary-300">View session replays and debug AI traces</p>
                </div>

                {/* Tabs */}
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel mb-8">
                    <nav className="flex space-x-2 p-2">
                        <button
                            onClick={() => setActiveTab('replays')}
                            className={`flex-1 py-3 px-4 font-display font-semibold text-sm transition-all duration-300 rounded-lg ${activeTab === 'replays'
                                ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10'
                                }`}
                        >
                            <div className="flex items-center justify-center">
                                <PlayCircleIcon className="mr-2 w-5 h-5" />
                                Session Replays
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('debug')}
                            className={`flex-1 py-3 px-4 font-display font-semibold text-sm transition-all duration-300 rounded-lg ${activeTab === 'debug'
                                ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10'
                                }`}
                        >
                            <div className="flex items-center justify-center">
                                <BugAntIcon className="mr-2 w-5 h-5" />
                                Debug Traces
                            </div>
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'replays' ? (
                        <div className="mt-[-24px]"> {/* Negative margin to remove extra spacing */}
                            <SessionReplayPage />
                        </div>
                    ) : (
                        <div className="mt-[-24px]">
                            <DebugSessions />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

