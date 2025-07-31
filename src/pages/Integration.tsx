import React from "react";
import { IntegrationDashboard } from "../components/integration/IntegrationDashboard";
import { useProject } from "../contexts/ProjectContext";

export const Integration: React.FC = () => {
  const { selectedProject } = useProject();

  return <IntegrationDashboard projectId={selectedProject} />;
};
