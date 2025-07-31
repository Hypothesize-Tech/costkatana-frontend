import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Project } from "../types/project.types";
import { ProjectService } from "../services/project.service";

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
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await ProjectService.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const getSelectedProjectName = () => {
    if (selectedProject === "all") return "All Projects";
    const project = projects.find((p) => p._id === selectedProject);
    return project?.name || "Unknown Project";
  };

  const refreshProjects = async () => {
    await loadProjects();
  };

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
