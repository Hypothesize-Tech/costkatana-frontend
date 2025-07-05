import React, { useState, useEffect } from 'react';
import {
    FiPlus,
    FiUsers,
    FiDollarSign,
    FiTrendingUp
} from 'react-icons/fi';
import { ProjectService } from '../services/project.service';
import { Project } from '../types/project.types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import {
    ProjectCard,
    CreateProjectModal,
    ViewProjectModal,
    EditProjectModal,
    ProjectMembersModal
} from '../components/projects';
import { useNotification } from '../contexts/NotificationContext';

const Projects: React.FC = () => {
    const { showNotification } = useNotification();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

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
            console.error('Error loading projects:', error);
            setProjects([]);
            showNotification(
                error.message || 'Failed to load projects',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (projectData: any) => {
        try {
            await ProjectService.createProject(projectData);
            showNotification('Project created successfully!', 'success');
            loadProjects(); // Refresh the list
        } catch (error: any) {
            console.error('Error creating project:', error);
            showNotification(
                error.message || 'Failed to create project',
                'error'
            );
            throw error; // Re-throw to let modal handle loading state
        }
    };

    const handleEditProject = async (projectId: string, projectData: any) => {
        try {
            await ProjectService.updateProject(projectId, projectData);
            showNotification('Project updated successfully!', 'success');
            loadProjects(); // Refresh the list
        } catch (error: any) {
            console.error('Error updating project:', error);
            showNotification(
                error.message || 'Failed to update project',
                'error'
            );
            throw error; // Re-throw to let modal handle loading state
        }
    };

    const handleUpdateMembers = async (projectId: string, members: any[]) => {
        try {
            await ProjectService.updateProjectMembers(projectId, members);
            showNotification('Project members updated successfully!', 'success');
            loadProjects(); // Refresh the list
        } catch (error: any) {
            console.error('Error updating project members:', error);
            showNotification(
                error.message || 'Failed to update project members',
                'error'
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

    const handleManageMembers = (project: Project) => {
        setSelectedProject(project);
        setShowMembersModal(true);
    };

    const handleDeleteProject = async () => {
        if (!selectedProject) return;

        try {
            await ProjectService.deleteProject(selectedProject._id);
            showNotification('Project deleted successfully!', 'success');
            loadProjects(); // Refresh the list
            setDeleteConfirmOpen(false);
            setSelectedProject(null);
        } catch (error: any) {
            console.error('Error deleting project:', error);
            showNotification(
                error.message || 'Failed to delete project',
                'error'
            );
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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Projects
                    </h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Manage your AI cost tracking projects
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex gap-2 items-center px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                >
                    <FiPlus />
                    New Project
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                    <div className="flex items-center">
                        <FiUsers className="mr-2 text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                {safeProjects.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                    <div className="flex items-center">
                        <FiDollarSign className="mr-2 text-green-600" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                ${safeProjects.reduce((sum, p) => sum + (p.budget?.amount || 0), 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                    <div className="flex items-center">
                        <FiTrendingUp className="mr-2 text-purple-600" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                {safeProjects.filter(p => p.isActive !== false).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            {safeProjects.length === 0 ? (
                <div className="py-12 text-center bg-white rounded-lg dark:bg-gray-800">
                    <FiUsers className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        No projects yet
                    </h3>
                    <p className="mb-4 text-gray-500 dark:text-gray-400">
                        Create your first project to start managing AI costs as a team
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex gap-2 items-center px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
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
                            Are you sure you want to delete "{selectedProject.name}"? This action cannot be undone and will remove all associated data.
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