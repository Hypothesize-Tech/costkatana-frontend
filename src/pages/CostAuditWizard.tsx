import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { CostAuditWizard as WizardComponent } from "../components/intelligence";
import { useProject } from "../contexts/ProjectContext";

const CostAuditWizard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProject();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/optimizations")}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <FiArrowLeft className="mr-2" />
                Back to Optimizations
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Cost Audit Wizard
              </h1>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="mb-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Welcome to the AI Cost Audit Wizard
              </h2>
              <p className="mt-2 text-sm text-gray-600">
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
