import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "../components/auth/RegisterForm";
import { useAuth } from "../hooks";
import { APP_NAME } from "../utils/constant";
import logo from "../assets/logo.jpg";

export default function Register() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex flex-1 min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 right-1/2 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="flex flex-col flex-1 justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative z-10">
        <div className="mx-auto w-full max-w-md lg:w-[420px]">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <div className="flex justify-center items-center w-16 h-16 rounded-2xl shadow-2xl bg-gradient-to-r from-secondary-500 to-secondary-600">
                <img src={logo} alt="logo" className="w-12 h-12 rounded-xl" />
              </div>
            </div>
            <h1 className="text-4xl font-display font-bold gradient-text-primary mb-2">
              {APP_NAME}
            </h1>
            <h2 className="text-xl font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
              Join the Revolution
            </h2>
            <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
              Start optimizing your AI costs today with intelligent insights
            </p>
          </div>

          <div className="mt-10">
            <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-8">
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden relative flex-1 w-0 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-500 to-secondary-600">
          <div className="absolute inset-0 bg-black/10" />
          <div className="flex absolute inset-0 justify-center items-center p-12">
            <div className="max-w-xl text-white animate-fade-in">
              <h1 className="mb-6 text-5xl font-display font-bold">Start Your Free Trial</h1>
              <p className="mb-8 text-lg text-white/90">
                Join thousands of developers who are already saving on their AI
                API costs.
              </p>

              <div className="p-6 mb-8 rounded-lg backdrop-blur-sm bg-white/10">
                <h3 className="mb-4 text-xl font-display font-semibold">
                  Free Plan Includes:
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-2 items-center">
                    <svg
                      className="w-5 h-5 text-white/80"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>1,000 API calls per month</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <svg
                      className="w-5 h-5 text-primary-300 dark:text-primary-200"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>10 AI-powered optimizations</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <svg
                      className="w-5 h-5 text-primary-300 dark:text-primary-200"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Basic analytics and reporting</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <svg
                      className="w-5 h-5 text-primary-300 dark:text-primary-200"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Email alerts and notifications</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4 items-center text-primary-200 dark:text-primary-100">
                <div className="text-center">
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-sm">API Calls Tracked</div>
                </div>
                <div className="w-px h-12 bg-primary-400/30 dark:bg-primary-300/20" />
                <div className="text-center">
                  <div className="text-3xl font-bold">$10K+</div>
                  <div className="text-sm">Costs Saved</div>
                </div>
                <div className="w-px h-12 bg-primary-400/30 dark:bg-primary-300/20" />
                <div className="text-center">
                  <div className="text-3xl font-bold">35%</div>
                  <div className="text-sm">Avg. Cost Reduction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
