export interface UserSession {
  userSessionId: string;
  userId: string;
  deviceName: string;
  userAgent: string;
  ipAddress: string;
  location: {
    city?: string;
    country?: string;
  };
  browser?: string;
  os?: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  isActive: boolean;
  isCurrentSession?: boolean;
}

export interface UserSessionsResponse {
  success: boolean;
  data: UserSession[];
}

export interface RevokeSessionResponse {
  success: boolean;
  message: string;
}

export interface RevokeAllOtherSessionsResponse {
  success: boolean;
  message: string;
  data: {
    revokedCount: number;
  };
}

