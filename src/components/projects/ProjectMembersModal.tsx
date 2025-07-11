import React, { useState } from 'react';
import { FiPlus, FiUsers, FiTrash2 } from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { Project, ProjectMember } from '../../types/project.types';
import { ProjectService } from '../../services/project.service';

interface ProjectMembersModalProps {
    project: Project;
    onClose: () => void;
    onUpdateMembers: (projectId: string, members: ProjectMember[]) => void;
}

export const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({
    project,
    onClose,
    onUpdateMembers
}) => {
    const [members, setMembers] = useState<ProjectMember[]>(project.members || []);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member' | 'viewer'>('member');
    const [inviteLoading, setInviteLoading] = useState(false);

    const roles = [
        {
            value: 'admin',
            label: 'Admin',
            description: 'Full access to project settings and members',
            color: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-200'
        },
        {
            value: 'member',
            label: 'Member',
            description: 'Can view and edit project content',
            color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-200'
        },
        {
            value: 'viewer',
            label: 'Viewer',
            description: 'Read-only access to project',
            color: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200'
        }
    ];

    const getRoleColor = (role: string) => {
        const roleConfig = roles.find(r => r.value === role);
        return roleConfig?.color || 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    };

    const updateMembersAndNotifyParent = (updatedMembers: ProjectMember[]) => {
        setMembers(updatedMembers);
        onUpdateMembers(project._id, updatedMembers);
    };

    const handleAddMember = async () => {
        if (!newMemberEmail.trim()) return;

        setInviteLoading(true);
        try {
            // Use the individual add member endpoint which accepts email
            await ProjectService.addMember(project._id, newMemberEmail.trim(), newMemberRole);

            // Add to local state for immediate UI update
            const newMember: ProjectMember = {
                userId: '', // Will be populated when user accepts invitation
                email: newMemberEmail.trim(),
                role: newMemberRole,
                joinedAt: new Date().toISOString(),
                permissions: [],
                status: 'pending',
                invitedAt: new Date().toISOString()
            };

            const updatedMembers = [...members, newMember];
            updateMembersAndNotifyParent(updatedMembers);
            setNewMemberEmail('');
            setNewMemberRole('member');
        } catch (error) {
            console.error('Error adding member:', error);
            // Show error to user
            alert('Failed to add member. Please try again.');
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRemoveMember = async (index: number) => {
        const member = members[index];
        const userId = member.userId || member.email;

        try {
            // Use the individual remove member endpoint
            await ProjectService.removeMember(project._id, userId);

            // Update local state
            const updatedMembers = members.filter((_, i) => i !== index);
            updateMembersAndNotifyParent(updatedMembers);
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Failed to remove member. Please try again.');
        }
    };

    const handleUpdateMemberRole = async (index: number, newRole: string) => {
        const member = members[index];
        const userId = member.userId || member.email;

        try {
            // Use the individual update member role endpoint
            await ProjectService.updateMemberRole(project._id, userId, newRole);

            // Update local state
            const updatedMembers = members.map((member, i) =>
                i === index
                    ? { ...member, role: newRole as 'admin' | 'member' | 'viewer' }
                    : member
            );
            updateMembersAndNotifyParent(updatedMembers);
        } catch (error) {
            console.error('Error updating member role:', error);
            alert('Failed to update member role. Please try again.');
        }
    };

    const getMemberEmail = (member: ProjectMember) => {
        return member.email || member.userId || 'Unknown';
    };

    const getMemberRole = (member: ProjectMember) => {
        return member.role || 'member';
    };

    const getMemberStatus = (member: ProjectMember) => {
        return member.status || 'active';
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Manage Project Members" size="lg">
            <div className="flex flex-col h-full max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3 items-center mb-4">
                        <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {project.name} - Members
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Manage who has access to this project
                            </p>
                        </div>
                    </div>

                    {/* Add New Member */}
                    <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                        <h3 className="mb-3 font-medium text-blue-900 dark:text-blue-100">
                            Invite New Member
                        </h3>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <input
                                    type="email"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                    placeholder="Enter email address"
                                    className="px-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                                />
                            </div>
                            <select
                                value={newMemberRole}
                                onChange={(e) => setNewMemberRole(e.target.value as any)}
                                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                {roles.map(role => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddMember}
                                disabled={!newMemberEmail.trim() || inviteLoading}
                                className="flex gap-2 items-center px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {inviteLoading ? (
                                    <div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent"></div>
                                ) : (
                                    <FiPlus className="w-4 h-4" />
                                )}
                                Invite
                            </button>
                        </div>
                    </div>
                </div>

                {/* Members List */}
                <div className="overflow-y-auto flex-1 p-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Current Members ({members.length})
                            </h3>
                        </div>

                        {members.length === 0 ? (
                            <div className="py-12 text-center">
                                <FiUsers className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                                    No members yet
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Invite team members to collaborate on this project
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {members.map((member, index) => {
                                    const email = getMemberEmail(member);
                                    const role = getMemberRole(member);
                                    const status = getMemberStatus(member);

                                    return (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-4 rounded-lg border border-gray-200 transition-colors dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <div className="flex gap-3 items-center">
                                                <div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900/20">
                                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                                        {email.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex gap-2 items-center">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {email}
                                                        </p>
                                                        {status === 'pending' && (
                                                            <span className="px-2 py-1 text-xs text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-900/20 dark:text-yellow-200">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {roles.find(r => r.value === role)?.description || 'Project member'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 items-center">
                                                <select
                                                    value={role}
                                                    onChange={(e) => handleUpdateMemberRole(index, e.target.value)}
                                                    className="px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                >
                                                    {roles.map(roleOption => (
                                                        <option key={roleOption.value} value={roleOption.value}>
                                                            {roleOption.label}
                                                        </option>
                                                    ))}
                                                </select>

                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(role)}`}>
                                                    {role}
                                                </span>

                                                <button
                                                    onClick={() => handleRemoveMember(index)}
                                                    className="p-2 text-red-600 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="Remove member"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Role Descriptions */}
                    <div className="p-4 mt-8 bg-gray-50 rounded-lg dark:bg-gray-800">
                        <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                            Role Permissions
                        </h4>
                        <div className="space-y-2">
                            {roles.map(role => (
                                <div key={role.value} className="flex gap-3 items-center">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${role.color}`}>
                                        {role.label}
                                    </span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {role.description}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 rounded-lg transition-colors dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}; 