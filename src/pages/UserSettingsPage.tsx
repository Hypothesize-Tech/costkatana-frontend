import React, { useState } from 'react';
import SessionReplaySettings from '../components/settings/SessionReplaySettings';

export const UserSettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'session-replay' | 'notifications'>('general');

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                    <p className="text-gray-400">Manage your account preferences and session replay configuration</p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${activeTab === 'general'
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('session-replay')}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${activeTab === 'session-replay'
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Session Replay
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${activeTab === 'notifications'
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Notifications
                    </button>
                </div>

                {/* Content */}
                <div>
                    {activeTab === 'general' && (
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-white mb-4">General Settings</h3>
                            <p className="text-gray-400">General account settings coming soon...</p>
                        </div>
                    )}

                    {activeTab === 'session-replay' && (
                        <SessionReplaySettings />
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Notification Settings</h3>
                            <p className="text-gray-400">Notification settings coming soon...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserSettingsPage;

