import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    UserPlusIcon,
    MagnifyingGlassIcon,
    ClockIcon,
    CheckCircleIcon,
    Cog6ToothIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import { teamService } from '../../services/team.service';
import { TeamMember } from '../../types/team.types';
import { RoleBadge } from './RoleBadge';
import { InviteMemberModal } from './InviteMemberModal';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { WorkspaceSettings } from './WorkspaceSettings';
import { MemberActionsDropdown } from './MemberActionsDropdown';
import { useNotification } from '../../contexts/NotificationContext';
import { TeamManagementShimmer, WorkspaceSettingsShimmer, TeamMembersTableShimmer } from '../shimmer/TeamManagementShimmer';

export const TeamManagement: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<'workspace' | 'members'>('members');
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    // Fetch workspace details and user's role
    const { data: workspace, isLoading: isLoadingWorkspace } = useQuery({
        queryKey: ['workspace'],
        queryFn: () => teamService.getWorkspaceDetails(),
    });

    // Fetch all user's workspaces
    const { data: userWorkspaces = [], isLoading: isLoadingWorkspaces } = useQuery({
        queryKey: ['user-workspaces'],
        queryFn: () => teamService.getUserWorkspaces(),
    });

    // Fetch team members
    const { data: members = [], isLoading: isLoadingMembers } = useQuery({
        queryKey: ['team-members'],
        queryFn: () => teamService.getWorkspaceMembers(),
    });

    const isLoading = isLoadingWorkspace || isLoadingWorkspaces || isLoadingMembers;

    // Fetch projects for assignment
    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            // This would be your actual project fetching logic
            return [];
        },
    });

    const currentRole = workspace?.currentUserRole;

    // Remove member mutation
    const removeMemberMutation = useMutation({
        mutationFn: (memberId: string) => teamService.removeMember(memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
            showNotification('Member removed successfully', 'success');
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            showNotification(err.response?.data?.message || 'Failed to remove member', 'error');
        },
    });

    // Resend invitation mutation
    const resendInvitationMutation = useMutation({
        mutationFn: (memberId: string) => teamService.resendInvitation(memberId),
        onSuccess: () => {
            showNotification('Invitation resent successfully', 'success');
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            showNotification(err.response?.data?.message || 'Failed to resend invitation', 'error');
        },
    });

    const filteredMembers = members.filter(
        (member) =>
            member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRemoveMember = (member: TeamMember) => {
        if (member.role === 'owner') {
            showNotification('Cannot remove workspace owner', 'error');
            return;
        }

        if (window.confirm(`Are you sure you want to remove ${member.email}?`)) {
            removeMemberMutation.mutate(member._id);
        }
    };

    const handleResendInvitation = (member: TeamMember) => {
        resendInvitationMutation.mutate(member._id);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 glass rounded-lg text-xs font-medium border border-green-200/30 text-green-600 dark:text-green-400">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        Active
                    </span>
                );
            case 'invited':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 glass rounded-lg text-xs font-medium border border-yellow-200/30 text-yellow-600 dark:text-yellow-400">
                        <ClockIcon className="w-3.5 h-3.5" />
                        Pending
                    </span>
                );
            case 'suspended':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 glass rounded-lg text-xs font-medium border border-red-200/30 text-red-600 dark:text-red-400">
                        Suspended
                    </span>
                );
            default:
                return null;
        }
    };

    const handleWorkspaceSwitch = () => {
        // Invalidate all workspace-related queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['workspace'] });
        queryClient.invalidateQueries({ queryKey: ['user-workspaces'] });
        queryClient.invalidateQueries({ queryKey: ['team-members'] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
    };

    // Show shimmer while loading initial data
    if (isLoading && !workspace) {
        return <TeamManagementShimmer activeSection={activeSection} />;
    }

    return (
        <div className="space-y-6">
            {/* Header with Workspace Switcher */}
            <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                    <WorkspaceSwitcher workspaces={userWorkspaces} onSwitch={handleWorkspaceSwitch} />
                    {currentRole && (
                        <div className="text-sm text-secondary flex items-center gap-2">
                            Your role: <RoleBadge role={currentRole} size="sm" />
                        </div>
                    )}
                </div>

                {/* Section Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveSection('workspace')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all border ${activeSection === 'workspace'
                            ? 'bg-gradient-primary text-white shadow-lg border-primary-500/50'
                            : 'glass border-primary-200/30 text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:border-primary-500/50 hover:bg-primary-500/10'
                            }`}
                    >
                        <Cog6ToothIcon className="w-5 h-5" />
                        Workspace Settings
                    </button>
                    <button
                        onClick={() => setActiveSection('members')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all border ${activeSection === 'members'
                            ? 'bg-gradient-primary text-white shadow-lg border-primary-500/50'
                            : 'glass border-primary-200/30 text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:border-primary-500/50 hover:bg-primary-500/10'
                            }`}
                    >
                        <UserGroupIcon className="w-5 h-5" />
                        Team Members
                    </button>
                </div>
            </div>

            {/* Workspace Settings Section */}
            {activeSection === 'workspace' && (
                isLoadingWorkspace ? (
                    <WorkspaceSettingsShimmer />
                ) : workspace ? (
                    <WorkspaceSettings workspace={workspace} userRole={currentRole} />
                ) : null
            )}

            {/* Team Members Section */}
            {activeSection === 'members' && (
                <>
                    {/* Members Header */}
                    <div className="glass rounded-xl p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-display font-bold gradient-text">
                                Team Members
                            </h3>
                            <button
                                onClick={() => setIsInviteModalOpen(true)}
                                className="bg-gradient-primary text-white inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                            >
                                <UserPlusIcon className="w-5 h-5" />
                                Invite Member
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="glass rounded-xl p-1.5 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search members by name or email..."
                                className="input pl-12"
                            />
                        </div>
                    </div>

                    {/* Members List */}
                    {isLoadingMembers ? (
                        <TeamMembersTableShimmer />
                    ) : filteredMembers.length === 0 ? (
                        <div className="glass rounded-xl p-12 border-2 border-dashed border-primary-200/50 shadow-lg backdrop-blur-xl text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-accent/10 flex items-center justify-center">
                                <UserPlusIcon className="w-8 h-8 text-primary-500" />
                            </div>
                            <h3 className="text-lg font-display font-semibold gradient-text mb-2">
                                {searchQuery ? 'No members found' : 'No team members yet'}
                            </h3>
                            <p className="text-secondary mb-6">
                                {searchQuery
                                    ? 'Try adjusting your search'
                                    : 'Invite your first team member to get started'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => setIsInviteModalOpen(true)}
                                    className="bg-gradient-primary text-white inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                                >
                                    <UserPlusIcon className="w-5 h-5" />
                                    Invite Member
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="glass-hover">
                                        <tr className="border-b border-primary-200/30">
                                            <th className="px-6 py-4 text-left text-xs font-display font-semibold text-secondary uppercase tracking-wider">
                                                Member
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-display font-semibold text-secondary uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-display font-semibold text-secondary uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-display font-semibold text-secondary uppercase tracking-wider">
                                                Joined
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-display font-semibold text-secondary uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary-200/20">
                                        {filteredMembers.map((member) => (
                                            <tr
                                                key={member._id}
                                                className="glass-hover transition-all"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-accent glow-accent-sm flex items-center justify-center text-white font-semibold">
                                                            {member.userId?.name?.[0] || member.email[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-primary">
                                                                {member.userId?.name || 'Pending'}
                                                            </div>
                                                            <div className="text-sm text-secondary">
                                                                {member.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <RoleBadge role={member.role} size="sm" />
                                                </td>
                                                <td className="px-6 py-4">{getStatusBadge(member.status)}</td>
                                                <td className="px-6 py-4 text-sm text-secondary">
                                                    {member.joinedAt
                                                        ? new Date(member.joinedAt).toLocaleDateString()
                                                        : new Date(member.invitedAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <MemberActionsDropdown
                                                        member={member}
                                                        onResend={handleResendInvitation}
                                                        onRemove={handleRemoveMember}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Invite Modal */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['team-members'] });
                    showNotification('Invitation sent successfully!', 'success');
                }}
                availableProjects={projects}
            />
        </div>
    );
};

export default TeamManagement;
