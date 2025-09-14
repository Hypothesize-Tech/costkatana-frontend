import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiRefreshCw,
} from "react-icons/fi";
import { ProjectService } from "../services/project.service";
import { Project } from "../types/project.types";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Modal } from "../components/common/Modal";
import {
  ProjectCard,
  CreateProjectModal,
  ViewProjectModal,
  EditProjectModal,
  ProjectMembersModal,
} from "../components/projects";
import { useNotification } from "../contexts/NotificationContext";

const Projects: React.FC = () => {
  const { showNotification } = useNotification();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await ProjectService.getUserProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error loading projects:", error);
      setProjects([]);
      showNotification(error.message || "Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshSpending = async () => {
    try {
      setRefreshing(true);
      // Recalculate spending for all user projects
      await ProjectService.recalculateAllUserProjectSpending();
      showNotification(
        "Project spending recalculated successfully!",
        "success",
      );
      loadProjects(); // Reload projects to show updated data
    } catch (error: any) {
      console.error("Error refreshing spending:", error);
      showNotification(error.message || "Failed to refresh spending", "error");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      await ProjectService.createProject(projectData);
      showNotification("Project created successfully!", "success");
      loadProjects(); // Refresh the list
    } catch (error: any) {
      console.error("Error creating project:", error);
      showNotification(error.message || "Failed to create project", "error");
      throw error; // Re-throw to let modal handle loading state
    }
  };

  const handleEditProject = async (projectId: string, projectData: any) => {
    try {
      await ProjectService.updateProject(projectId, projectData);
      showNotification("Project updated successfully!", "success");
      loadProjects(); // Refresh the list
    } catch (error: any) {
      console.error("Error updating project:", error);
      showNotification(error.message || "Failed to update project", "error");
      throw error; // Re-throw to let modal handle loading state
    }
  };

  const handleUpdateMembers = async (projectId: string, members: any[]) => {
    try {
      await ProjectService.updateProjectMembers(projectId, members);
      showNotification("Project members updated successfully!", "success");
      loadProjects(); // Refresh the list
    } catch (error: any) {
      console.error("Error updating project members:", error);
      showNotification(
        error.message || "Failed to update project members",
        "error",
      );
      throw error; // Re-throw to let modal handle loading state
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setShowViewModal(true);
  };

  const handleEditProjectModal = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      await ProjectService.deleteProject(selectedProject._id);
      showNotification("Project deleted successfully!", "success");
      loadProjects(); // Refresh the list
      setDeleteConfirmOpen(false);
      setSelectedProject(null);
    } catch (error: any) {
      console.error("Error deleting project:", error);
      showNotification(error.message || "Failed to delete project", "error");
    }
  };

  // Ensure we have a valid array to work with
  const safeProjects = Array.isArray(projects) ? projects : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200 p-6">
      <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text-primary mb-2">
              Projects
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Manage your AI cost tracking projects
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={handleRefreshSpending}
              disabled={refreshing}
              className="btn-secondary flex gap-2 items-center disabled:opacity-50"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh Spending"}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex gap-2 items-center"
            >
              <FiPlus />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 mr-4">
              <FiUsers className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Total Projects
              </p>
              <p className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                {safeProjects.length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-success-500/20 to-success-600/20 mr-4">
              <FiDollarSign className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Total Budget
              </p>
              <p className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                $
                {safeProjects
                  .reduce((sum, p) => sum + (p.budget?.amount || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 mr-4">
              <FiTrendingUp className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Active Projects
              </p>
              <p className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                {safeProjects.filter((p) => p.isActive !== false).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {safeProjects.length === 0 ? (
        <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 py-16 text-center">
          <div className="p-4 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/20 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <FiUsers className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="mb-4 text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
            No projects yet
          </h3>
          <p className="mb-8 text-light-text-secondary dark:text-dark-text-secondary max-w-md mx-auto">
            Create your first project to start managing AI costs as a team
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex gap-2 items-center"
          >
            <FiPlus />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {safeProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onView={() => handleViewProject(project)}
              onEdit={() => handleEditProjectModal(project)}
              onDelete={() => {
                setSelectedProject(project);
                setDeleteConfirmOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
        />
      )}

      {showViewModal && selectedProject && (
        <ViewProjectModal
          project={selectedProject}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProject(null);
          }}
          onEdit={(project) => {
            setShowViewModal(false);
            setSelectedProject(project);
            setShowEditModal(true);
          }}
          onManageMembers={(project) => {
            setShowViewModal(false);
            setSelectedProject(project);
            setShowMembersModal(true);
          }}
        />
      )}

      {showEditModal && selectedProject && (
        <EditProjectModal
          project={selectedProject}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
          onSubmit={handleEditProject}
        />
      )}

      {showMembersModal && selectedProject && (
        <ProjectMembersModal
          project={selectedProject}
          onClose={() => {
            setShowMembersModal(false);
            setSelectedProject(null);
          }}
          onUpdateMembers={handleUpdateMembers}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && selectedProject && (
        <Modal
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setSelectedProject(null);
          }}
          title="Delete Project"
        >
          <div className="p-6">
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete "{selectedProject.name}"? This
              action cannot be undone and will remove all associated data.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setSelectedProject(null);
                }}
                className="px-4 py-2 text-gray-700 rounded-lg transition-colors dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
              >
                Delete Project
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Projects;
