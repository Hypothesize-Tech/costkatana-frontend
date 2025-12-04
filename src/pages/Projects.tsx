import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ProjectService } from "../services/project.service";
import { Project } from "../types/project.types";
import { ProjectsShimmer } from "../components/shimmer/ProjectsShimmer";
import { Modal } from "../components/common/Modal";
import {
  ProjectCard,
  CreateProjectModal,
  ViewProjectModal,
  EditProjectModal,
} from "../components/projects";
import { useNotification } from "../contexts/NotificationContext";

const Projects: React.FC = () => {
  const { showNotification } = useNotification();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
      setDeleting(true);
      await ProjectService.deleteProject(selectedProject._id);
      showNotification("Project deleted successfully!", "success");
      loadProjects(); // Refresh the list
      setDeleteConfirmOpen(false);
      setSelectedProject(null);
    } catch (error: any) {
      console.error("Error deleting project:", error);
      showNotification(error.message || "Failed to delete project", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Ensure we have a valid array to work with
  const safeProjects = Array.isArray(projects) ? projects : [];

  if (loading) {
    return <ProjectsShimmer />;
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="p-6 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold font-display gradient-text-primary">
              Projects
            </h1>
            <p className="text-secondary-600 dark:text-secondary-300">
              Manage your AI cost tracking projects
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={handleRefreshSpending}
              disabled={refreshing}
              className="px-4 py-2.5 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-sm hover:shadow-md flex items-center gap-2 font-display font-semibold text-sm"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh Spending"}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-gradient-primary hover:bg-gradient-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 font-display font-semibold text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 mr-4 rounded-xl border shadow-lg bg-gradient-light-panel dark:bg-gradient-dark-panel border-primary-200/30 dark:border-primary-500/20">
              <UserGroupIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-medium font-body text-secondary-600 dark:text-secondary-300">
                Total Projects
              </p>
              <p className="text-2xl font-bold font-display gradient-text-primary">
                {safeProjects.length}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-success-200/30 dark:border-success-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 mr-4 rounded-xl border shadow-lg bg-gradient-light-panel dark:bg-gradient-dark-panel border-success-200/30 dark:border-success-500/20">
              <CurrencyDollarIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-sm font-medium font-body text-secondary-600 dark:text-secondary-300">
                Total Budget
              </p>
              <p className="text-2xl font-bold font-display gradient-text-success">
                $
                {safeProjects
                  .reduce((sum, p) => sum + (p.budget?.amount || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-accent-200/30 dark:border-accent-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 mr-4 rounded-xl border shadow-lg bg-gradient-light-panel dark:bg-gradient-dark-panel border-accent-200/30 dark:border-accent-500/20">
              <ArrowTrendingUpIcon className="w-6 h-6 text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <p className="text-sm font-medium font-body text-secondary-600 dark:text-secondary-300">
                Active Projects
              </p>
              <p className="text-2xl font-bold font-display gradient-text-accent">
                {safeProjects.filter((p) => p.isActive !== false).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {safeProjects.length === 0 ? (
        <div className="py-16 text-center rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex justify-center items-center p-4 mx-auto mb-6 w-20 h-20 rounded-full border shadow-lg glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <UserGroupIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="mb-4 text-2xl font-bold font-display gradient-text-primary">
            No projects yet
          </h3>
          <p className="mx-auto mb-8 max-w-md font-body text-secondary-600 dark:text-secondary-300">
            Create your first project to start managing AI costs as a team
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex gap-2 items-center px-6 py-3 font-semibold text-white rounded-xl shadow-lg transition-all duration-300 transform bg-gradient-primary hover:bg-gradient-primary/90 hover:shadow-xl glow-primary hover:scale-105 active:scale-95 font-display"
          >
            <PlusIcon className="w-5 h-5" />
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && selectedProject && (
        <Modal
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setSelectedProject(null);
          }}
          title="Delete Project"
          size="lg"
        >
          <div className="p-6">
            <div className="p-6 mb-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-danger-200/30 dark:border-danger-500/20 bg-gradient-danger/10">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-xl border bg-gradient-danger/20 border-danger-200/30">
                    <ExclamationTriangleIcon className="w-6 h-6 text-danger-600 dark:text-danger-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="mb-2 text-lg font-bold text-danger-900 dark:text-danger-100 font-display">
                    Are you sure you want to delete "{selectedProject.name}"?
                  </p>
                  <p className="mt-2 text-sm font-body text-danger-700 dark:text-danger-300">
                    This action cannot be undone and will remove all associated data including:
                  </p>
                  <ul className="mt-3 ml-4 space-y-1 text-sm list-disc font-body text-danger-700 dark:text-danger-300">
                    <li>All project analytics and usage data</li>
                    <li>Budget and spending history</li>
                    <li>Project settings and configurations</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-primary-200/30">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setSelectedProject(null);
                }}
                disabled={deleting}
                className="px-4 py-2.5 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-sm hover:shadow-md flex items-center gap-2 font-display font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={deleting}
                className="px-4 py-2.5 bg-gradient-danger hover:bg-gradient-danger/90 text-white rounded-xl shadow-lg hover:shadow-xl glow-danger transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 font-display font-semibold text-sm"
              >
                {deleting ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    Delete Project
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Projects;
