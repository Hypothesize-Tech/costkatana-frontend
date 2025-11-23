import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import { ChevronDownIcon, CheckIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { UserWorkspace } from '../../types/team.types';
import { RoleBadge } from './RoleBadge';
import { useNotification } from '../../contexts/NotificationContext';
import { teamService } from '../../services/team.service';

interface WorkspaceSwitcherProps {
    workspaces: UserWorkspace[];
    onSwitch?: () => void;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ workspaces, onSwitch }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [switching, setSwitching] = useState(false);
    const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { showNotification } = useNotification();

    const primaryWorkspace = workspaces.find((w) => w.isPrimary);

    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        placement: 'bottom-start',
        strategy: 'fixed',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, 8],
                },
            },
            {
                name: 'preventOverflow',
                options: {
                    padding: 16,
                },
            },
            {
                name: 'flip',
                options: {
                    fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
                },
            },
        ],
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                referenceElement &&
                !referenceElement.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, referenceElement]);

    const handleSwitch = async (workspaceId: string) => {
        if (switching) return;

        try {
            setSwitching(true);
            await teamService.switchWorkspace(workspaceId);
            showNotification('Workspace switched successfully', 'success');
            setIsOpen(false);

            // Call the onSwitch callback to refresh data without page reload
            if (onSwitch) {
                onSwitch();
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            showNotification(err.response?.data?.message || 'Failed to switch workspace', 'error');
        } finally {
            setSwitching(false);
        }
    };

    if (!primaryWorkspace || workspaces.length <= 1) {
        return (
            <div className="glass rounded-xl px-4 py-3 border border-primary-200/30 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-accent glow-accent-sm flex items-center justify-center">
                        <BuildingOfficeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="text-sm font-display font-bold text-primary">
                            {primaryWorkspace?.workspace.name || 'My Workspace'}
                        </div>
                        {primaryWorkspace && (
                            <div className="mt-0.5">
                                <RoleBadge role={primaryWorkspace.role} size="sm" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const dropdownContent = isOpen && (
        <div
            ref={(node) => {
                setPopperElement(node);
                if (dropdownRef) {
                    (dropdownRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                }
            }}
            style={{
                ...styles.popper,
                zIndex: 9999,
            }}
            {...attributes.popper}
        >
            <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl overflow-hidden min-w-[320px] max-h-[400px] overflow-y-auto">
                {workspaces.map((userWorkspace) => (
                    <button
                        key={userWorkspace.workspace._id}
                        onClick={() => handleSwitch(userWorkspace.workspace._id)}
                        disabled={switching || userWorkspace.isPrimary}
                        className={`w-full px-4 py-3 text-left glass-hover transition-all flex items-center gap-3 border-b border-primary-100/20 dark:border-gray-700/30 last:border-b-0 ${userWorkspace.isPrimary
                            ? 'bg-gradient-to-r from-primary-500/10 to-accent-500/10 glow-accent-sm'
                            : ''
                            } ${switching || userWorkspace.isPrimary
                                ? 'cursor-not-allowed opacity-60'
                                : 'hover:bg-primary-50/20 dark:hover:bg-primary-900/10'
                            }`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-accent glow-accent-sm flex items-center justify-center flex-shrink-0">
                            {userWorkspace.isPrimary ? (
                                <CheckIcon className="w-6 h-6 text-white" />
                            ) : (
                                <BuildingOfficeIcon className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-display font-bold text-primary flex items-center gap-2 mb-1">
                                <span className="truncate">{userWorkspace.workspace.name}</span>
                                {userWorkspace.isPrimary && (
                                    <span className="text-xs px-2 py-0.5 glass rounded-lg border border-primary-500/30 text-primary-500 font-medium flex-shrink-0">
                                        Active
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <RoleBadge role={userWorkspace.role} size="sm" />
                                <span className="text-xs text-secondary">
                                    {userWorkspace.workspace.memberCount} member{userWorkspace.workspace.memberCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <button
                ref={setReferenceElement}
                onClick={() => setIsOpen(!isOpen)}
                className="glass rounded-xl px-4 py-3 border border-primary-200/30 hover:border-primary-300/50 hover:shadow-lg backdrop-blur-xl transition-all flex items-center gap-3 min-w-[280px]"
                disabled={switching}
            >
                <div className="w-10 h-10 rounded-xl bg-gradient-accent glow-accent-sm flex items-center justify-center flex-shrink-0">
                    <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-display font-bold text-primary truncate">
                        {primaryWorkspace.workspace.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <RoleBadge role={primaryWorkspace.role} size="sm" />
                        <span className="text-xs text-secondary">
                            {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
                <ChevronDownIcon
                    className={`w-5 h-5 text-secondary transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {dropdownContent && createPortal(dropdownContent, document.body)}
        </>
    );
};

