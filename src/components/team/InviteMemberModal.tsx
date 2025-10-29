import React, { useState } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { teamService } from '../../services/team.service';
import { RoleBadge } from './RoleBadge';
import { Project } from '../../types/team.types';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    availableProjects: Project[];
}

type Step = 1 | 2 | 3;

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    availableProjects,
}) => {
    const [step, setStep] = useState<Step>(1);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'developer' | 'viewer'>('developer');
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleReset = () => {
        setStep(1);
        setEmail('');
        setRole('developer');
        setSelectedProjects([]);
        setError('');
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleNext = () => {
        if (step === 1) {
            if (!email || !email.includes('@')) {
                setError('Please enter a valid email address');
                return;
            }
            setError('');
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        }
    };

    const handleBack = () => {
        setError('');
        if (step > 1) setStep((prev) => (prev - 1) as Step);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            await teamService.inviteMember({
                email,
                role,
                projectIds: selectedProjects.length > 0 ? selectedProjects : undefined,
            });

            handleReset();
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to invite member');
        } finally {
            setLoading(false);
        }
    };

    const toggleProject = (projectId: string) => {
        setSelectedProjects((prev) =>
            prev.includes(projectId)
                ? prev.filter((id) => id !== projectId)
                : [...prev, projectId]
        );
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                    onClick={handleClose}
                />

                {/* Modal */}
                <div className="relative w-full max-w-2xl glass rounded-2xl shadow-2xl border border-primary-200/30 backdrop-blur-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-primary-200/30">
                        <div>
                            <h2 className="text-2xl font-display font-bold gradient-text">
                                Invite Team Member
                            </h2>
                            <p className="text-sm text-secondary mt-1">
                                Step {step} of 3
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 text-secondary hover:text-primary rounded-lg glass-hover transition-all"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 pt-4">
                        <div className="flex items-center gap-2">
                            {[1, 2, 3].map((s) => (
                                <div
                                    key={s}
                                    className={`flex-1 h-2 rounded-full transition-all ${s <= step
                                        ? 'bg-gradient-accent glow-accent-sm'
                                        : 'glass border border-primary-200/30'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Step 1: Email and Role */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-display font-medium gradient-text mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="colleague@example.com"
                                        className="input w-full"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-display font-medium gradient-text mb-3">
                                        Select Role
                                    </label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {(['admin', 'developer', 'viewer'] as const).map((r) => (
                                            <button
                                                key={r}
                                                onClick={() => setRole(r)}
                                                className={`p-4 rounded-xl border-2 transition-all text-left ${role === r
                                                    ? 'border-primary-500 bg-primary-500/10 glass glow-accent-sm shadow-lg'
                                                    : 'border-primary-200/30 glass hover:border-primary-300/50 hover:bg-primary-50/5'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <RoleBadge role={r} showDescription />
                                                    {role === r && (
                                                        <CheckCircleIcon className="w-6 h-6 text-primary-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Project Assignment */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-display font-semibold gradient-text mb-2">
                                        Assign Projects (Optional)
                                    </h3>
                                    <p className="text-sm text-secondary">
                                        Select projects this member can access. Admins have access to all projects automatically.
                                    </p>
                                </div>

                                {role === 'admin' ? (
                                    <div className="glass rounded-xl p-4 border border-primary-500/30">
                                        <p className="text-sm text-primary flex items-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Admins have access to all projects by default
                                        </p>
                                    </div>
                                ) : (
                                    <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                                        {availableProjects.length === 0 ? (
                                            <div className="glass rounded-xl p-8 border border-dashed border-primary-200/50 text-center text-secondary">
                                                No projects available
                                            </div>
                                        ) : (
                                            availableProjects.map((project) => (
                                                <label
                                                    key={project._id}
                                                    className="flex items-start gap-3 p-3 rounded-xl glass border border-primary-200/30 hover:border-primary-300/50 cursor-pointer transition-all"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProjects.includes(project._id)}
                                                        onChange={() => toggleProject(project._id)}
                                                        className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-primary-300"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-primary">
                                                            {project.name}
                                                        </div>
                                                        {project.description && (
                                                            <div className="text-sm text-secondary mt-1">
                                                                {project.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-display font-semibold gradient-text mb-4">
                                        Review Invitation
                                    </h3>
                                </div>

                                <div className="space-y-4 glass rounded-xl p-6 border border-primary-200/30">
                                    <div>
                                        <div className="text-sm text-secondary mb-1">Email</div>
                                        <div className="text-base font-medium text-primary">
                                            {email}
                                        </div>
                                    </div>

                                    <div className="border-t border-primary-200/30 pt-4">
                                        <div className="text-sm text-secondary mb-2">Role</div>
                                        <RoleBadge role={role} />
                                    </div>

                                    {role !== 'admin' && selectedProjects.length > 0 && (
                                        <div className="border-t border-primary-200/30 pt-4">
                                            <div className="text-sm text-secondary mb-2">
                                                Assigned Projects ({selectedProjects.length})
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProjects.map((projectId) => {
                                                    const project = availableProjects.find((p) => p._id === projectId);
                                                    return (
                                                        <span
                                                            key={projectId}
                                                            className="px-3 py-1.5 glass rounded-lg text-sm font-medium text-primary border border-primary-200/30"
                                                        >
                                                            {project?.name}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="glass rounded-xl p-4 border border-primary-500/30">
                                    <p className="text-sm text-primary">
                                        📧 An invitation email will be sent to <strong>{email}</strong> with instructions to join your workspace.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mt-4 glass rounded-xl p-4 border border-red-500/30">
                                <p className="text-sm text-red-600 dark:text-red-400">⚠️ {error}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-6 border-t border-primary-200/30">
                        <button
                            onClick={step === 1 ? handleClose : handleBack}
                            className="px-6 py-2.5 text-secondary hover:text-primary glass-hover rounded-xl transition-all font-medium"
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </button>

                        <button
                            onClick={step === 3 ? handleSubmit : handleNext}
                            disabled={loading}
                            className="btn-gradient px-6 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? 'Sending...' : step === 3 ? 'Send Invitation' : 'Continue'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
