import React from "react";

// Team Management Header Shimmer
export const TeamManagementHeaderShimmer: React.FC = () => {
    return (
        <div className="glass rounded-xl p-4 md:p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                {/* Workspace Switcher */}
                <div className="w-full sm:w-48 h-10 rounded-lg skeleton" />
                {/* Role Badge */}
                <div className="flex items-center gap-2">
                    <div className="w-20 h-4 rounded skeleton" />
                    <div className="w-16 h-6 rounded-full skeleton" />
                </div>
            </div>

            {/* Section Tabs */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="w-full sm:w-40 h-10 rounded-xl skeleton" />
                <div className="w-full sm:w-32 h-10 rounded-xl skeleton" />
            </div>
        </div>
    );
};

// Workspace Settings Section Shimmer
export const WorkspaceSettingsShimmer: React.FC = () => {
    return (
        <div className="space-y-4 md:space-y-6">
            {/* Workspace Info */}
            <div className="glass rounded-xl p-4 md:p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl skeleton" />
                    <div className="w-40 md:w-48 h-5 md:h-6 rounded skeleton" />
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="mb-2 w-28 md:w-32 h-4 rounded skeleton" />
                        <div className="w-full h-11 rounded-lg skeleton" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i}>
                                <div className="mb-1 w-20 h-3 rounded skeleton" />
                                <div className="w-32 h-5 rounded skeleton" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Settings */}
            <div className="glass rounded-xl p-4 md:p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl skeleton" />
                    <div className="w-32 md:w-40 h-5 md:h-6 rounded skeleton" />
                </div>

                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 glass-hover rounded-xl">
                            <div className="flex-1 w-full sm:w-auto">
                                <div className="mb-1 w-full sm:w-48 h-5 rounded skeleton" />
                                <div className="w-full sm:w-64 h-4 rounded skeleton" />
                            </div>
                            <div className="w-5 h-5 rounded skeleton" />
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <div className="w-full sm:w-32 h-10 rounded-xl skeleton" />
                </div>
            </div>

            {/* Billing Info */}
            <div className="glass rounded-xl p-4 md:p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl skeleton" />
                    <div className="w-20 md:w-24 h-5 md:h-6 rounded skeleton" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <div key={i}>
                            <div className="mb-1 w-28 h-3 rounded skeleton" />
                            <div className="w-32 h-5 rounded skeleton" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="glass rounded-xl p-4 md:p-6 border border-red-500/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl skeleton" />
                    <div className="w-28 md:w-32 h-5 md:h-6 rounded skeleton" />
                </div>
                <div className="mb-4 w-full h-4 rounded skeleton" />
                <div className="space-y-2">
                    <div className="w-full h-10 rounded-xl skeleton" />
                    <div className="w-full h-10 rounded-xl skeleton" />
                </div>
            </div>
        </div>
    );
};

// Team Members Table Shimmer (just the table, for when header/search are already shown)
export const TeamMembersTableShimmer: React.FC = () => {
    return (
        <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl overflow-hidden">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[640px]">
                    <thead className="glass-hover">
                        <tr className="border-b border-primary-200/30">
                            {["Member", "Role", "Status", "Joined", "Actions"].map((header, idx) => (
                                <th key={idx} className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                                    <div className="w-16 sm:w-20 h-4 rounded skeleton" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-200/20">
                        {[1, 2, 3, 4, 5].map((row) => (
                            <tr key={row} className="glass-hover transition-all">
                                {/* Member Column */}
                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full skeleton flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="mb-1 w-20 sm:w-24 h-4 sm:h-5 rounded skeleton" />
                                            <div className="w-32 sm:w-40 h-3 sm:h-4 rounded skeleton" />
                                        </div>
                                    </div>
                                </td>
                                {/* Role Column */}
                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                    <div className="w-14 sm:w-16 h-5 sm:h-6 rounded-full skeleton" />
                                </td>
                                {/* Status Column */}
                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                    <div className="w-16 sm:w-20 h-5 sm:h-6 rounded-full skeleton" />
                                </td>
                                {/* Joined Column */}
                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                    <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                                </td>
                                {/* Actions Column */}
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg skeleton ml-auto" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Team Members Section Shimmer (full section with header, search, and table)
export const TeamMembersShimmer: React.FC = () => {
    return (
        <>
            {/* Members Header */}
            <div className="glass rounded-xl p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <div className="w-28 sm:w-32 h-5 sm:h-6 rounded skeleton" />
                    <div className="w-full sm:w-32 h-10 rounded-xl skeleton" />
                </div>
            </div>

            {/* Search */}
            <div className="glass rounded-xl p-1.5 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="w-full h-11 rounded-lg skeleton" />
            </div>

            {/* Members List Table */}
            <TeamMembersTableShimmer />
        </>
    );
};

// Main Team Management Shimmer Component
export const TeamManagementShimmer: React.FC<{
    activeSection?: "workspace" | "members";
}> = ({ activeSection = "members" }) => {
    return (
        <div className="space-y-4 md:space-y-6 px-4 sm:px-0">
            <TeamManagementHeaderShimmer />

            {/* Workspace Settings Section */}
            {activeSection === "workspace" && <WorkspaceSettingsShimmer />}

            {/* Team Members Section */}
            {activeSection === "members" && <TeamMembersShimmer />}
        </div>
    );
};

