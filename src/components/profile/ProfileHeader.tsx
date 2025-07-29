// src/components/profile/ProfileHeader.tsx
import React from 'react';
import { User } from '../../types';
import { CameraIcon } from '@heroicons/react/24/outline';

interface ProfileHeaderProps {
    user: User;
    onAvatarChange?: (file: File) => void;
    editable?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    user,
    onAvatarChange,
    editable = false,
}) => {
    const initials = user.name
        ?.split(' ')
        .map(n => n?.[0])
        .join('')
        .toUpperCase() || user.email?.[0].toUpperCase();


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onAvatarChange) {
            onAvatarChange(file);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="relative">
                    <div className="flex justify-center items-center w-24 h-24 text-2xl font-bold text-white bg-indigo-600 rounded-full">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="object-cover w-full h-full rounded-full"
                            />
                        ) : (
                            initials
                        )}
                    </div>
                    {editable && (
                        <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg cursor-pointer hover:bg-gray-50">
                            <CameraIcon className="w-5 h-5 text-gray-600" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{user.name || 'User'}</h1>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                        {user.company && (
                            <span className="flex items-center">
                                <svg className="mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {user.company}
                            </span>
                        )}
                        {user.role && (
                            <span className="flex items-center">
                                <svg className="mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {user.role}
                            </span>
                        )}
                        <span className="flex items-center">
                            <svg className="mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Joined {user.createdAt ?
                                new Date(user.createdAt).toLocaleDateString() :
                                'Recently'
                            }
                        </span>
                    </div>
                </div>

                {/* Subscription Badge */}
                <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.subscription?.plan === 'pro'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                        : user.subscription?.plan === 'enterprise'
                            ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {user.subscription?.plan || 'Free'} Plan
                    </span>
                    {user.subscription?.status === 'active' && user.subscription?.currentPeriodEnd && (
                        <p className="mt-1 text-xs text-gray-500">
                            Renews {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};