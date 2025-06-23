// src/components/settings/ProfileSettings.tsx
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ProfileSettingsProps {
    profile: User | undefined;
    onUpdate: (data: any) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
    profile,
    onUpdate,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        role: '',
        timezone: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                company: profile.company || '',
                role: profile.role || '',
                        timezone: profile.preferences?.timezone || 'UTC',
            });
        }
    }, [profile]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(formData);
        setIsEditing(false);
    };

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    if (!profile) return <LoadingSpinner />;

    return (
        <div>
            <h2 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            disabled={!isEditing}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            disabled
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                            Company
                        </label>
                        <input
                            type="text"
                            id="company"
                            value={formData.company}
                            onChange={(e) => handleChange('company', e.target.value)}
                            disabled={!isEditing}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
                        />
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <input
                            type="text"
                            id="role"
                            value={formData.role}
                            onChange={(e) => handleChange('role', e.target.value)}
                            disabled={!isEditing}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
                        />
                    </div>

                    <div>
                        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                            Timezone
                        </label>
                        <select
                            id="timezone"
                            value={formData.timezone}
                            onChange={(e) => handleChange('timezone', e.target.value)}
                            disabled={!isEditing}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
                        >
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="America/Denver">Mountain Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                            <option value="Europe/London">London</option>
                            <option value="Europe/Paris">Paris</option>
                            <option value="Asia/Tokyo">Tokyo</option>
                            <option value="Asia/Shanghai">Shanghai</option>
                            <option value="Australia/Sydney">Sydney</option>
                        </select>
                    </div>
                </div>

                <div className="pt-5">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Account Information</h3>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {new Date(profile.createdAt).toLocaleDateString()}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Subscription Status</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.subscription?.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {profile.subscription?.status || 'Free'}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Monthly Usage</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                ${profile.usage?.currentMonth.totalCost.toFixed(2) || '0.00'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Total Optimizations</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {profile.usage?.currentMonth.optimizationsSaved.toFixed(2) || '0.00'}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="flex justify-end space-x-3">
                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};