import { apiClient } from "../config/api";
import {
  TeamMember,
  WorkspaceSettings,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  UpdateMemberPermissionsRequest,
  UpdateMemberProjectsRequest,
  UpdateWorkspaceSettingsRequest,
  BillingSummary,
} from "../types/team.types";

export class TeamService {
  /**
   * Get all workspace members
   */
  static async getWorkspaceMembers(): Promise<TeamMember[]> {
    const response = await apiClient.get("/team/members");
    return response.data.data;
  }

  /**
   * Invite a new member
   */
  static async inviteMember(data: InviteMemberRequest): Promise<TeamMember> {
    const response = await apiClient.post("/team/invite", data);
    return response.data.data;
  }

  /**
   * Accept an invitation
   */
  static async acceptInvitation(token: string): Promise<TeamMember> {
    const response = await apiClient.post(`/team/accept/${token}`);
    return response.data.data;
  }

  /**
   * Resend an invitation
   */
  static async resendInvitation(memberId: string): Promise<void> {
    await apiClient.post(`/team/resend/${memberId}`);
  }

  /**
   * Remove a member
   */
  static async removeMember(memberId: string): Promise<void> {
    await apiClient.delete(`/team/members/${memberId}`);
  }

  /**
   * Update member role
   */
  static async updateMemberRole(
    memberId: string,
    data: UpdateMemberRoleRequest
  ): Promise<TeamMember> {
    const response = await apiClient.put(
      `/team/members/${memberId}/role`,
      data
    );
    return response.data.data;
  }

  /**
   * Update member permissions
   */
  static async updateMemberPermissions(
    memberId: string,
    data: UpdateMemberPermissionsRequest
  ): Promise<TeamMember> {
    const response = await apiClient.put(
      `/team/members/${memberId}/permissions`,
      data
    );
    return response.data.data;
  }

  /**
   * Update member projects
   */
  static async updateMemberProjects(
    memberId: string,
    data: UpdateMemberProjectsRequest
  ): Promise<TeamMember> {
    const response = await apiClient.put(
      `/team/members/${memberId}/projects`,
      data
    );
    return response.data.data;
  }

  /**
   * Get member details
   */
  static async getMemberDetails(memberId: string): Promise<TeamMember> {
    const response = await apiClient.get(`/team/members/${memberId}`);
    return response.data.data;
  }

  /**
   * Suspend a member
   */
  static async suspendMember(memberId: string): Promise<TeamMember> {
    const response = await apiClient.post(`/team/members/${memberId}/suspend`);
    return response.data.data;
  }

  /**
   * Reactivate a member
   */
  static async reactivateMember(memberId: string): Promise<TeamMember> {
    const response = await apiClient.post(
      `/team/members/${memberId}/reactivate`
    );
    return response.data.data;
  }

  /**
   * Get workspace settings
   */
  static async getWorkspaceSettings(): Promise<WorkspaceSettings> {
    const response = await apiClient.get("/team/workspace");
    return response.data.data;
  }

  /**
   * Update workspace settings
   */
  static async updateWorkspaceSettings(
    data: UpdateWorkspaceSettingsRequest
  ): Promise<WorkspaceSettings> {
    const response = await apiClient.put("/team/workspace", data);
    return response.data.data;
  }

  /**
   * Get billing summary
   */
  static async getBillingSummary(): Promise<BillingSummary> {
    const response = await apiClient.get("/team/billing/summary");
    return response.data.data;
  }

  /**
   * Get current workspace details
   */
  static async getWorkspaceDetails(): Promise<any> {
    const response = await apiClient.get("/team/workspace");
    return response.data.data;
  }

  /**
   * Get all workspaces user is a member of
   */
  static async getUserWorkspaces(): Promise<any[]> {
    const response = await apiClient.get("/team/workspaces");
    return response.data.data;
  }

  /**
   * Switch primary workspace
   */
  static async switchWorkspace(workspaceId: string): Promise<void> {
    await apiClient.post("/team/workspace/switch", { workspaceId });
  }

  /**
   * Update workspace settings
   */
  static async updateWorkspace(data: UpdateWorkspaceSettingsRequest): Promise<any> {
    const response = await apiClient.put("/team/workspace", data);
    return response.data.data;
  }

  /**
   * Delete workspace
   */
  static async deleteWorkspace(password: string, confirmation: string): Promise<void> {
    await apiClient.delete("/team/workspace", {
      data: { password, confirmation },
    });
  }

  /**
   * Transfer workspace ownership
   */
  static async transferOwnership(newOwnerId: string, password: string): Promise<void> {
    await apiClient.post("/team/workspace/transfer", { newOwnerId, password });
  }
}

export const teamService = TeamService;

