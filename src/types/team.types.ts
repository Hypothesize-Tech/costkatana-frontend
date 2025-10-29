export interface Permissions {
  canManageBilling: boolean;
  canManageTeam: boolean;
  canManageProjects: boolean;
  canViewAnalytics: boolean;
  canManageApiKeys: boolean;
  canManageIntegrations: boolean;
  canExportData: boolean;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
}

export interface TeamMember {
  _id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  customPermissions: Permissions;
  assignedProjects: Project[];
  status: 'active' | 'invited' | 'suspended';
  invitedBy: {
    _id: string;
    name: string;
    email: string;
  };
  invitedAt: string;
  joinedAt?: string;
  lastActiveAt?: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    lastLogin?: string;
  };
}

export interface WorkspaceSettings {
  _id: string;
  name: string;
  slug: string;
  ownerId: {
    _id: string;
    name: string;
    email: string;
  };
  settings: {
    allowMemberInvites: boolean;
    defaultProjectAccess: 'all' | 'assigned';
    requireEmailVerification: boolean;
  };
  billing: {
    seatsIncluded: number;
    additionalSeats: number;
    pricePerSeat: number;
    billingCycle: 'monthly' | 'yearly';
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InviteMemberRequest {
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  projectIds?: string[];
}

export interface UpdateMemberRoleRequest {
  role: 'admin' | 'developer' | 'viewer';
}

export interface UpdateMemberPermissionsRequest {
  permissions: Partial<Permissions>;
}

export interface UpdateMemberProjectsRequest {
  projectIds: string[];
}

export interface UpdateWorkspaceSettingsRequest {
  name?: string;
  settings?: {
    allowMemberInvites?: boolean;
    defaultProjectAccess?: 'all' | 'assigned';
    requireEmailVerification?: boolean;
  };
}

export interface BillingSummary {
  seats: {
    included: number;
    additional: number;
    total: number;
    used: number;
    available: number;
  };
  costs: {
    pricePerSeat: number;
    additionalSeatsCost: number;
    totalMonthlyCost: number;
    billingCycle: 'monthly' | 'yearly';
  };
  nextBillingDate?: string;
}

export type RoleName = 'owner' | 'admin' | 'developer' | 'viewer';

export interface RoleInfo {
  name: RoleName;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  ownerId: {
    _id: string;
    name: string;
    email: string;
  };
  settings: {
    allowMemberInvites: boolean;
    defaultProjectAccess: 'all' | 'assigned';
    requireEmailVerification: boolean;
  };
  billing: {
    seatsIncluded: number;
    additionalSeats: number;
    pricePerSeat: number;
    billingCycle: 'monthly' | 'yearly';
  };
  memberCount: number;
  currentUserRole: RoleName | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserWorkspace {
  workspace: Workspace;
  role: RoleName;
  joinedAt: string;
  isPrimary: boolean;
}

