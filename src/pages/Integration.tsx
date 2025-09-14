import React from "react";
import { IntegrationDashboard } from "../components/integration/IntegrationDashboard";
import { useProject } from "../contexts/ProjectContext";

export const Integration: React.FC = () => {
  const { selectedProject } = useProject();

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200">
      <IntegrationDashboard projectId={selectedProject} />
    </div>
  );
};
