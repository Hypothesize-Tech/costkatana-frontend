import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import { Link } from 'react-router-dom';
import {
    UserCircleIcon,
    UserIcon,
    CreditCardIcon,
    ArrowRightOnRectangleIcon,
    HandRaisedIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks';

export const ProfileDropdown: React.FC = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        placement: 'bottom-end',
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

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

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
            <div className="glass rounded-2xl border border-primary-200/30 shadow-2xl backdrop-blur-xl overflow-hidden w-72 animate-scale-in">
                {/* User Info Header */}
                <div className="px-4 py-4 border-b border-primary-200/20 bg-gradient-to-br from-primary-500/10 via-accent-500/10 to-highlight-500/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg glow-primary">
                            <UserCircleIcon className="w-9 h-9 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-display font-bold text-primary truncate">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-secondary truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <div className="glass rounded-lg px-3 py-1.5 inline-flex items-center gap-2">
                        <HandRaisedIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <p className="text-xs font-medium text-primary">
                            Welcome back!
                        </p>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                    <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all mx-2 rounded-xl group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="font-semibold">Profile Settings</div>
                            <div className="text-xs text-secondary">Manage your account</div>
                        </div>
                    </Link>

                    <Link
                        to="/subscription"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all mx-2 rounded-xl group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <CreditCardIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="font-semibold">Subscription</div>
                            <div className="text-xs text-secondary">Billing & plans</div>
                        </div>
                    </Link>
                </div>

                {/* Logout Section */}
                <div className="border-t border-primary-200/20 p-2">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all rounded-xl group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <ArrowRightOnRectangleIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                            <div className="font-semibold">Sign Out</div>
                            <div className="text-xs text-secondary">End your session</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button
                ref={setReferenceElement}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-x-3 p-2 rounded-xl glass hover:bg-primary-500/20 transition-all duration-300 hover:scale-105"
            >
                <span className="sr-only">Open user menu</span>
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
                    <UserCircleIcon className="w-8 h-8 text-white" />
                </div>
                <span className="hidden lg:flex lg:items-center">
                    <span className="text-sm font-display font-semibold leading-6 text-light-text-primary dark:text-dark-text-primary">
                        {user?.name}
                    </span>
                </span>
            </button>

            {dropdownContent && createPortal(dropdownContent, document.body)}
        </>
    );
};

