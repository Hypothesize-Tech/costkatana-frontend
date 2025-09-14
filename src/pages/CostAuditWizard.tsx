import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { CostAuditWizard as WizardComponent } from "../components/intelligence";
import { useProject } from "../contexts/ProjectContext";

const CostAuditWizard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProject();

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200">
      <div className="py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/optimizations")}
                className="flex items-center text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
              >
                <FiArrowLeft className="mr-2" />
                Back to Optimizations
              </button>
              <h1 className="text-2xl font-display font-bold gradient-text-primary">
                Cost Audit Wizard
              </h1>
            </div>
          </div>

          <div className="p-6 glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300">
            <div className="mb-6 text-center">
              <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                Welcome to the AI Cost Audit Wizard
              </h2>
              <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                This interactive wizard will analyze your AI usage patterns and
                help you identify opportunities to reduce costs while
                maintaining quality.
              </p>
            </div>

            <WizardComponent projectId={selectedProject} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostAuditWizard;
