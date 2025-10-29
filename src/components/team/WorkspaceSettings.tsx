import React, { useState } from 'react';
import { Workspace } from '../../types/team.types';
import { BuildingOfficeIcon, Cog6ToothIcon, CreditCardIcon, ExclamationTriangleIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { teamService } from '../../services/team.service';
import { toast } from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface WorkspaceSettingsProps {
    workspace: Workspace;
    userRole: string | null;
}

export const WorkspaceSettings: React.FC<WorkspaceSettingsProps> = ({ workspace, userRole }) => {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(workspace.name);
    const [settings, setSettings] = useState(workspace.settings);
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [password, setPassword] = useState('');
    const [transferPassword, setTransferPassword] = useState('');
    const [selectedNewOwner, setSelectedNewOwner] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [transferring, setTransferring] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const canEdit = userRole === 'owner' || userRole === 'admin';
    const isOwner = userRole === 'owner';

    // Fetch team members for transfer ownership
    const { data: members = [] } = useQuery({
        queryKey: ['team-members'],
        queryFn: () => teamService.getWorkspaceMembers(),
        enabled: isOwner,
    });

    // Filter eligible members for ownership transfer (admins only, not current owner)
    const eligibleMembers = members.filter(
        (m) => m.role === 'admin' && m.status === 'active' && m.userId
    );

    const handleSave = async () => {
        try {
            setSaving(true);
            await teamService.updateWorkspace({ name, settings });
            toast.success('Workspace updated successfully');
            queryClient.invalidateQueries({ queryKey: ['workspace'] });
            setEditing(false);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to update workspace');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (deleteConfirmation !== 'DELETE') {
            toast.error('Please type DELETE to confirm');
            return;
        }

        try {
            setDeleting(true);
            await teamService.deleteWorkspace(password, deleteConfirmation);
            toast.success('Workspace deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            navigate('/dashboard');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to delete workspace');
        } finally {
            setDeleting(false);
        }
    };

    const handleTransferOwnership = async () => {
        if (!selectedNewOwner) {
            toast.error('Please select a new owner');
            return;
        }
        if (!transferPassword) {
            toast.error('Please enter your password');
            return;
        }

        try {
            setTransferring(true);
            await teamService.transferOwnership(selectedNewOwner, transferPassword);
            toast.success('Ownership transferred successfully');
            queryClient.invalidateQueries({ queryKey: ['workspace', 'workspaces', 'team-members'] });
            setShowTransferModal(false);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to transfer ownership');
        } finally {
            setTransferring(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Workspace Info */}
            <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center glow-accent">
                        <BuildingOfficeIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-display font-bold gradient-text">Workspace Information</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">Workspace Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!editing || !canEdit}
                            className="input w-full"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-secondary">Owner:</span>
                            <p className="text-primary font-medium">{workspace.ownerId.name}</p>
                        </div>
                        <div>
                            <span className="text-secondary">Members:</span>
                            <p className="text-primary font-medium">{workspace.memberCount}</p>
                        </div>
                        <div>
                            <span className="text-secondary">Your Role:</span>
                            <p className="text-primary font-medium capitalize">{userRole}</p>
                        </div>
                        <div>
                            <span className="text-secondary">Slug:</span>
                            <p className="text-primary font-mono text-xs">{workspace.slug}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings */}
            {canEdit && (
                <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center glow-accent">
                            <Cog6ToothIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-display font-bold gradient-text">General Settings</h3>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-3 glass-hover rounded-xl cursor-pointer">
                            <div>
                                <div className="font-medium text-primary">Allow Member Invites</div>
                                <div className="text-sm text-secondary">Members can invite others to workspace</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.allowMemberInvites}
                                onChange={(e) => setSettings({ ...settings, allowMemberInvites: e.target.checked })}
                                disabled={!editing}
                                className="w-5 h-5"
                            />
                        </label>
                        <label className="flex items-center justify-between p-3 glass-hover rounded-xl cursor-pointer">
                            <div>
                                <div className="font-medium text-primary">Require Email Verification</div>
                                <div className="text-sm text-secondary">New members must verify email</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.requireEmailVerification}
                                onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                                disabled={!editing}
                                className="w-5 h-5"
                            />
                        </label>
                    </div>

                    <div className="mt-4 flex gap-2">
                        {!editing ? (
                            <button
                                onClick={() => setEditing(true)}
                                className="btn-gradient px-4 py-2 rounded-xl font-medium hover:shadow-lg active:scale-95 transition-all"
                            >
                                Edit Settings
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn-gradient px-4 py-2 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-95 transition-all"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={() => { setEditing(false); setName(workspace.name); setSettings(workspace.settings); }}
                                    className="glass-hover px-4 py-2 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Billing Info */}
            <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center glow-accent">
                        <CreditCardIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-display font-bold gradient-text">Billing</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-secondary">Seats Included:</span>
                        <p className="text-primary font-medium">{workspace.billing.seatsIncluded}</p>
                    </div>
                    <div>
                        <span className="text-secondary">Price per Seat:</span>
                        <p className="text-primary font-medium">${workspace.billing.pricePerSeat}/month</p>
                    </div>
                </div>
            </div>

            {/* Danger Zone - Owner Only */}
            {isOwner && (
                <div className="glass rounded-xl p-6 border border-red-500/30 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                            <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-display font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
                    </div>
                    <p className="text-sm text-secondary mb-4">
                        Workspace owner actions. These cannot be undone.
                    </p>
                    <div className="space-y-2">
                        <button
                            onClick={() => setShowTransferModal(true)}
                            className="w-full px-4 py-2 glass-hover rounded-xl text-amber-600 dark:text-amber-400 font-medium border border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10 active:scale-95 transition-all"
                        >
                            Transfer Ownership
                        </button>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 rounded-xl text-red-600 dark:text-red-400 font-medium border border-red-500/30 hover:border-red-500/50 active:scale-95 transition-all"
                        >
                            Delete Workspace
                        </button>
                    </div>
                </div>
            )}

            {!canEdit && (
                <div className="glass rounded-xl p-4 border border-primary-200/30 text-center">
                    <p className="text-sm text-secondary">
                        🔒 You have view-only access. Contact workspace owner or admin to make changes.
                    </p>
                </div>
            )}

            {/* Delete Workspace Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="glass rounded-2xl p-6 max-w-md w-full mx-4 border border-red-500/30 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Delete Workspace</h3>
                            <button onClick={() => setShowDeleteModal(false)} className="text-secondary hover:text-primary">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    ⚠️ <strong>Warning:</strong> This action cannot be undone. All workspace data, members, and settings will be permanently deleted.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-2">
                                    Type <strong className="text-red-600">DELETE</strong> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    className="input w-full"
                                    placeholder="DELETE"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-2">
                                    Enter your password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input w-full"
                                    placeholder="Password"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteConfirmation('');
                                        setPassword('');
                                    }}
                                    className="flex-1 px-4 py-2 glass-hover rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting || deleteConfirmation !== 'DELETE' || !password}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium hover:shadow-lg active:scale-95 transition-all"
                                >
                                    {deleting ? 'Deleting...' : 'Delete Workspace'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Ownership Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="glass rounded-2xl p-6 max-w-lg w-full border border-primary-200/30 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold gradient-text">Transfer Ownership</h3>
                            <button
                                onClick={() => {
                                    setShowTransferModal(false);
                                    setSelectedNewOwner('');
                                    setTransferPassword('');
                                }}
                                className="text-secondary hover:text-primary transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    ⚠️ <strong>Important:</strong> You will lose owner privileges and become an admin. The new owner will have full control over the workspace.
                                </p>
                            </div>

                            {eligibleMembers.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-secondary mb-4">
                                        No eligible members found. You need at least one active admin to transfer ownership.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setShowTransferModal(false);
                                            setSelectedNewOwner('');
                                            setTransferPassword('');
                                        }}
                                        className="btn-gradient px-6 py-2 rounded-xl hover:shadow-lg active:scale-95 transition-all"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-3">
                                            Select New Owner (Admins Only)
                                        </label>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {eligibleMembers.map((member) => (
                                                <button
                                                    key={member._id}
                                                    onClick={() => setSelectedNewOwner(member.userId?._id || '')}
                                                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedNewOwner === member.userId?._id
                                                        ? 'border-primary-500 bg-primary-500/10 shadow-lg'
                                                        : 'border-primary-200/30 glass hover:border-primary-300/50 hover:bg-primary-50/5'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center text-white font-semibold">
                                                                {member.userId?.name?.[0] || member.email[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-primary">
                                                                    {member.userId?.name || 'Unknown'}
                                                                </div>
                                                                <div className="text-sm text-secondary">
                                                                    {member.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {selectedNewOwner === member.userId?._id && (
                                                            <CheckCircleIcon className="w-6 h-6 text-primary-500 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-2">
                                            Enter your password to confirm
                                        </label>
                                        <input
                                            type="password"
                                            value={transferPassword}
                                            onChange={(e) => setTransferPassword(e.target.value)}
                                            className="input w-full"
                                            placeholder="Password"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowTransferModal(false);
                                                setSelectedNewOwner('');
                                                setTransferPassword('');
                                            }}
                                            className="flex-1 px-4 py-2 glass-hover rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleTransferOwnership}
                                            disabled={transferring || !selectedNewOwner || !transferPassword}
                                            className="flex-1 px-4 py-2 btn-gradient disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium hover:shadow-lg active:scale-95 transition-all"
                                        >
                                            {transferring ? 'Transferring...' : 'Transfer Ownership'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

