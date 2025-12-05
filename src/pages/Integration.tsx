import React from "react";
import { IntegrationDashboard } from "../components/integration/IntegrationDashboard";
import { useProject } from "../contexts/ProjectContext";

export const Integration: React.FC = () => {
  const { selectedProject } = useProject();

  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient overflow-x-hidden">
      <IntegrationDashboard projectId={selectedProject} />
    </div>
  );
};
