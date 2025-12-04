import React from 'react';

export const TeamManagementShimmer: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Header with Workspace Switcher */}
            <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                    {/* Workspace Switcher Shimmer */}
                    <div className="w-48 h-10 rounded-lg skeleton" />
                    {/* Role Badge Shimmer */}
                    <div className="flex items-center gap-2">
                        <div className="w-20 h-4 rounded skeleton" />
                        <div className="w-16 h-6 rounded-full skeleton" />
                    </div>
                </div>

                {/* Section Tabs Shimmer */}
                <div className="flex gap-2">
                    <div className="w-40 h-10 rounded-xl skeleton" />
                    <div className="w-32 h-10 rounded-xl skeleton" />
                </div>
            </div>

            {/* Team Members Section Shimmer */}
            <>
                {/* Members Header Shimmer */}
                <div className="glass rounded-xl p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <div className="w-32 h-6 rounded skeleton" />
                        <div className="w-36 h-10 rounded-xl skeleton" />
                    </div>
                </div>

                {/* Search Shimmer */}
                <div className="glass rounded-xl p-1.5 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded skeleton" />
                        <div className="w-full h-11 rounded-lg skeleton pl-12" />
                    </div>
                </div>

                {/* Members Table Shimmer */}
                <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="glass-hover">
                                <tr className="border-b border-primary-200/30">
                                    <th className="px-6 py-4 text-left">
                                        <div className="w-20 h-4 rounded skeleton" />
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="w-12 h-4 rounded skeleton" />
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="w-16 h-4 rounded skeleton" />
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="w-16 h-4 rounded skeleton" />
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        <div className="w-16 h-4 rounded skeleton ml-auto" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-200/20">
                                {[1, 2, 3, 4, 5].map((row) => (
                                    <tr key={row} className="glass-hover transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full skeleton" />
                                                <div className="flex-1">
                                                    <div className="w-32 h-5 rounded skeleton mb-2" />
                                                    <div className="w-40 h-4 rounded skeleton" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-16 h-6 rounded-full skeleton" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-20 h-6 rounded-full skeleton" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-24 h-4 rounded skeleton" />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="w-8 h-8 rounded-lg skeleton ml-auto" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        </div>
    );
};

// Workspace Settings Shimmer
export const WorkspaceSettingsShimmer: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Workspace Info Card */}
            <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="mb-6">
                    <div className="w-40 h-6 rounded skeleton mb-4" />
                    <div className="w-full h-4 rounded skeleton mb-2" />
                    <div className="w-3/4 h-4 rounded skeleton" />
                </div>

                {/* Workspace Details */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4 rounded-lg border glass border-primary-200/30">
                            <div className="w-24 h-4 rounded skeleton mb-2" />
                            <div className="w-32 h-5 rounded skeleton" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Workspace Actions */}
            <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="w-32 h-6 rounded skeleton mb-4" />
                <div className="flex gap-4">
                    <div className="w-32 h-10 rounded-lg skeleton" />
                    <div className="w-32 h-10 rounded-lg skeleton" />
                </div>
            </div>
        </div>
    );
};

export default TeamManagementShimmer;


