// src/pages/NotFound.tsx
import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-8">
          <div className="mb-8">
            <h1 className="text-9xl font-display font-bold gradient-text-primary animate-pulse">
              404
            </h1>
            <div className="mt-4">
              <h2 className="text-3xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">Page Not Found</h2>
              <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
                Oops! The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              to="/dashboard"
              className="btn-primary inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium rounded-xl transition-all duration-300"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Link>

            <button
              onClick={() => window.history.back()}
              className="btn-secondary inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium rounded-xl transition-all duration-300"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Go Back
            </button>
          </div>

          <div className="mt-8 text-sm text-light-text-muted dark:text-dark-text-muted">
            <p>
              Need help?{" "}
              <Link
                to="/support"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
