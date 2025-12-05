import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 sm:p-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-bold gradient-text-primary animate-pulse">
              404
            </h1>
            <div className="mt-3 sm:mt-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-secondary-900 dark:text-white">Page Not Found</h2>
              <p className="mt-2 text-sm sm:text-base text-secondary-600 dark:text-secondary-300 px-2 sm:px-0">
                Oops! The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <Link
              to="/dashboard"
              className="btn-primary inline-flex items-center justify-center w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded-xl transition-all duration-300"
            >
              <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Go to Dashboard
            </Link>

            <button
              onClick={() => window.history.back()}
              className="btn-secondary inline-flex items-center justify-center w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded-xl transition-all duration-300"
            >
              <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Go Back
            </button>
          </div>

          <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-secondary-500 dark:text-secondary-400">
            <p>
              Need help?{" "}
              <Link
                to="/support"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold"
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
