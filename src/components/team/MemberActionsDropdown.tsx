import React, { useState, useRef, useEffect } from 'react';
import { usePopper } from 'react-popper';
import {
    EllipsisVerticalIcon,
    PaperAirplaneIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { TeamMember } from '../../types/team.types';

interface MemberActionsDropdownProps {
    member: TeamMember;
    onResend: (member: TeamMember) => void;
    onRemove: (member: TeamMember) => void;
}

export const MemberActionsDropdown: React.FC<MemberActionsDropdownProps> = ({
    member,
    onResend,
    onRemove,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        placement: 'bottom-end',
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
                    padding: 8,
                },
            },
            {
                name: 'flip',
                options: {
                    fallbackPlacements: ['top-end', 'bottom-start', 'top-start'],
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

    const handleResend = () => {
        onResend(member);
        setIsOpen(false);
    };

    const handleRemove = () => {
        onRemove(member);
        setIsOpen(false);
    };

    return (
        <>
            <button
                ref={setReferenceElement}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all"
                aria-label="Member actions"
            >
                <EllipsisVerticalIcon className="w-5 h-5" />
            </button>

            {isOpen && (
                <div
                    ref={(node) => {
                        setPopperElement(node);
                        if (dropdownRef) {
                            (dropdownRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                        }
                    }}
                    style={styles.popper}
                    {...attributes.popper}
                    className="z-50"
                >
                    <div className="w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {member.status === 'invited' && (
                            <button
                                onClick={handleResend}
                                className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-3 transition-all border-b border-gray-100 dark:border-gray-700"
                            >
                                <PaperAirplaneIcon className="w-4 h-4 text-blue-500" />
                                <span>Resend Invitation</span>
                            </button>
                        )}
                        {member.role !== 'owner' && (
                            <button
                                onClick={handleRemove}
                                className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-3 transition-all"
                            >
                                <TrashIcon className="w-4 h-4" />
                                <span>Remove Member</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

