import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Project } from "../types/project.types";
import { ProjectService } from "../services/project.service";
import { useAuth } from "../hooks";

interface ProjectContextType {
  selectedProject: string;
  setSelectedProject: (projectId: string) => void;
  projects: Project[];
  isLoading: boolean;
  getSelectedProjectName: () => string;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const projectsData = await ProjectService.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Only fetch after auth is ready — avoids GET /projects before OAuth tokens exist (401 on callback page).
  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!isAuthenticated) {
      setProjects([]);
      setIsLoading(false);
      return;
    }
    void loadProjects();
  }, [isAuthenticated, authLoading, loadProjects]);

  const getSelectedProjectName = () => {
    if (selectedProject === "all") return "All Projects";
    const project = projects.find((p) => p._id === selectedProject);
    return project?.name || "Unknown Project";
  };

  const refreshProjects = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    await loadProjects();
  }, [isAuthenticated, loadProjects]);

  const value: ProjectContextType = {
    selectedProject,
    setSelectedProject,
    projects,
    isLoading,
    getSelectedProjectName,
    refreshProjects,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};

export default ProjectContext;
