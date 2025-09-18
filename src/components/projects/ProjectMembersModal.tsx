import React, { useState } from "react";
import { FiPlus, FiUsers, FiTrash2 } from "react-icons/fi";
import { Modal } from "../common/Modal";
import { Project, ProjectMember } from "../../types/project.types";
import { ProjectService } from "../../services/project.service";

interface ProjectMembersModalProps {
  project: Project;
  onClose: () => void;
  onUpdateMembers: (projectId: string, members: ProjectMember[]) => void;
}

export const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({
  project,
  onClose,
  onUpdateMembers,
}) => {
  const [members, setMembers] = useState<ProjectMember[]>(
    project.members || [],
  );
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<
    "admin" | "member" | "viewer"
  >("member");
  const [inviteLoading, setInviteLoading] = useState(false);

  const roles = [
    {
      value: "admin",
      label: "Admin",
      description: "Full access to project settings and members",
      color: "text-danger-700 dark:text-danger-300 bg-gradient-danger/20 border-danger-200/30",
    },
    {
      value: "member",
      label: "Member",
      description: "Can view and edit project content",
      color: "text-primary-700 dark:text-primary-300 bg-gradient-primary/20 border-primary-200/30",
    },
    {
      value: "viewer",
      label: "Viewer",
      description: "Read-only access to project",
      color: "text-secondary-700 dark:text-secondary-300 bg-gradient-secondary/20 border-secondary-200/30",
    },
  ];

  const getRoleColor = (role: string) => {
    const roleConfig = roles.find((r) => r.value === role);
    return (
      roleConfig?.color ||
      "text-secondary-700 dark:text-secondary-300 bg-gradient-secondary/20 border-secondary-200/30"
    );
  };

  const updateMembersAndNotifyParent = (updatedMembers: ProjectMember[]) => {
    setMembers(updatedMembers);
    onUpdateMembers(project._id, updatedMembers);
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;

    setInviteLoading(true);
    try {
      // Use the individual add member endpoint which accepts email
      await ProjectService.addMember(
        project._id,
        newMemberEmail.trim(),
        newMemberRole,
      );

      // Add to local state for immediate UI update
      const newMember: ProjectMember = {
        userId: "", // Will be populated when user accepts invitation
        email: newMemberEmail.trim(),
        role: newMemberRole,
        joinedAt: new Date().toISOString(),
        permissions: [],
        status: "pending",
        invitedAt: new Date().toISOString(),
      };

      const updatedMembers = [...members, newMember];
      updateMembersAndNotifyParent(updatedMembers);
      setNewMemberEmail("");
      setNewMemberRole("member");
    } catch (error) {
      console.error("Error adding member:", error);
      // Show error to user
      alert("Failed to add member. Please try again.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (index: number) => {
    const member = members[index];
    const userId =
      typeof member.userId === "string"
        ? member.userId
        : member.userId?._id || member.email;

    try {
      // Use the individual remove member endpoint
      await ProjectService.removeMember(project._id, userId);

      // Update local state
      const updatedMembers = members.filter((_, i) => i !== index);
      updateMembersAndNotifyParent(updatedMembers);
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member. Please try again.");
    }
  };

  const handleUpdateMemberRole = async (index: number, newRole: string) => {
    const member = members[index];
    const userId =
      typeof member.userId === "string"
        ? member.userId
        : member.userId?._id || member.email;

    try {
      // Use the individual update member role endpoint
      await ProjectService.updateMemberRole(project._id, userId, newRole);

      // Update local state
      const updatedMembers = members.map((member, i) =>
        i === index
          ? { ...member, role: newRole as "admin" | "member" | "viewer" }
          : member,
      );
      updateMembersAndNotifyParent(updatedMembers);
    } catch (error) {
      console.error("Error updating member role:", error);
      alert("Failed to update member role. Please try again.");
    }
  };

  const getMemberEmail = (member: ProjectMember) => {
    if (typeof member.userId === "string") {
      return member.email || member.userId || "Unknown";
    } else {
      return member.email || member.userId?.email || "Unknown";
    }
  };

  const getMemberRole = (member: ProjectMember) => {
    return member.role || "member";
  };

  const getMemberStatus = (member: ProjectMember) => {
    return member.status || "active";
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Manage Project Members"
      size="lg"
    >
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-primary-200/30">
          <div className="flex gap-4 items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold gradient-text-primary">
                {project.name} - Members
              </h2>
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                Manage who has access to this project
              </p>
            </div>
          </div>

          {/* Add New Member */}
          <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                <span className="text-white text-sm">➕</span>
              </div>
              <h3 className="font-display font-semibold gradient-text-success text-lg">
                Invite New Member
              </h3>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="input"
                  onKeyPress={(e) => e.key === "Enter" && handleAddMember()}
                />
              </div>
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as any)}
                className="input min-w-[120px]"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddMember}
                disabled={!newMemberEmail.trim() || inviteLoading}
                className="btn-primary"
              >
                {inviteLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent"></div>
                ) : (
                  <FiPlus className="w-4 h-4" />
                )}
                Invite
              </button>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="overflow-y-auto flex-1 p-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">👥</span>
                </div>
                <h3 className="text-xl font-display font-bold gradient-text-secondary">
                  Current Members ({members.length})
                </h3>
              </div>
            </div>

            {members.length === 0 ? (
              <div className="glass rounded-xl p-12 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary/20 flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="mb-2 text-lg font-display font-semibold gradient-text-primary">
                  No members yet
                </h3>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Invite team members to collaborate on this project
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {members.map((member, index) => {
                  const email = getMemberEmail(member);
                  const role = getMemberRole(member);
                  const status = getMemberStatus(member);

                  return (
                    <div
                      key={index}
                      className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:border-primary-300/50 transition-all duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                            <span className="font-display font-bold text-white text-lg">
                              {email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex gap-3 items-center mb-1">
                              <p className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                {email}
                              </p>
                              {status === "pending" && (
                                <span className="px-3 py-1 text-xs font-display font-bold bg-gradient-warning/20 text-warning-700 dark:text-warning-300 border border-warning-200/30 rounded-full">
                                  Pending
                                </span>
                              )}
                            </div>
                            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                              {roles.find((r) => r.value === role)?.description ||
                                "Project member"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-center">
                          <select
                            value={role}
                            onChange={(e) =>
                              handleUpdateMemberRole(index, e.target.value)
                            }
                            className="input text-sm min-w-[100px]"
                          >
                            {roles.map((roleOption) => (
                              <option
                                key={roleOption.value}
                                value={roleOption.value}
                              >
                                {roleOption.label}
                              </option>
                            ))}
                          </select>

                          <span
                            className={`px-3 py-1 text-xs font-display font-bold rounded-full border ${getRoleColor(role)}`}
                          >
                            {role}
                          </span>

                          <button
                            onClick={() => handleRemoveMember(index)}
                            className="glass p-2 rounded-lg border border-danger-200/30 text-danger-600 hover:scale-110 transition-all duration-200"
                            title="Remove member"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Role Descriptions */}
          <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
                <span className="text-white text-sm">🛡️</span>
              </div>
              <h4 className="font-display font-semibold gradient-text-accent text-lg">
                Role Permissions
              </h4>
            </div>
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.value} className="flex gap-4 items-center">
                  <span
                    className={`px-3 py-1 text-xs font-display font-bold rounded-full border ${role.color}`}
                  >
                    {role.label}
                  </span>
                  <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                    {role.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 justify-end p-8 border-t border-primary-200/30">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
