import React from 'react';
import { RoleName, RoleInfo } from '../../types/team.types';
import {
  ShieldCheckIcon,
  UserGroupIcon,
  CodeBracketIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const ROLE_CONFIG: Record<RoleName, RoleInfo> = {
  owner: {
    name: 'owner',
    label: 'Owner',
    description: 'Full access to all workspace features and billing',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    icon: 'crown',
  },
  admin: {
    name: 'admin',
    label: 'Admin',
    description: 'Manage team members and projects',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    icon: 'shield',
  },
  developer: {
    name: 'developer',
    label: 'Developer',
    description: 'Access assigned projects and create API keys',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    icon: 'code',
  },
  viewer: {
    name: 'viewer',
    label: 'Viewer',
    description: 'Read-only access to assigned projects',
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    icon: 'eye',
  },
};

interface RoleBadgeProps {
  role: RoleName;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  showDescription = false,
  size = 'md',
}) => {
  const config = ROLE_CONFIG[role];

  const getIcon = () => {
    const iconProps = {
      className: size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5',
      style: { color: config.color },
    };

    switch (config.icon) {
      case 'crown':
        return <span style={{ fontSize: size === 'sm' ? '14px' : size === 'md' ? '16px' : '18px' }}>👑</span>;
      case 'shield':
        return <ShieldCheckIcon {...iconProps} />;
      case 'code':
        return <CodeBracketIcon {...iconProps} />;
      case 'eye':
        return <EyeIcon {...iconProps} />;
      default:
        return <UserGroupIcon {...iconProps} />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const getBorderClass = () => {
    switch (role) {
      case 'owner':
        return 'border-purple-500/30';
      case 'admin':
        return 'border-blue-500/30';
      case 'developer':
        return 'border-green-500/30';
      case 'viewer':
        return 'border-gray-500/30';
      default:
        return 'border-primary-200/30';
    }
  };

  if (showDescription) {
    return (
      <div className="flex items-start gap-3">
        <div
          className={`inline-flex items-center gap-1.5 rounded-lg font-medium glass border backdrop-blur-sm ${sizeClasses[size]} ${getBorderClass()}`}
          style={{
            color: config.color,
          }}
        >
          {getIcon()}
          <span>{config.label}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-secondary">
            {config.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium glass border backdrop-blur-sm ${sizeClasses[size]} ${getBorderClass()}`}
      style={{
        color: config.color,
      }}
    >
      {getIcon()}
      <span>{config.label}</span>
    </div>
  );
};

export const getRoleInfo = (role: RoleName): RoleInfo => {
  return ROLE_CONFIG[role];
};
