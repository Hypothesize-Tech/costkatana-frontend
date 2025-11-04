import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { MFAVerification } from "../components/auth/MFAVerification";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useAuth } from "../hooks";
import { APP_NAME } from "../utils/constant";
import logo from "../assets/logo.png";
import toast from "react-hot-toast";

export default function Login() {
  const { isAuthenticated, isLoading, mfaRequired, mfaData, completeMFALogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    // Only redirect if we're sure the user is authenticated and not loading
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-1 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient items-center justify-center relative overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-success-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative z-10">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-success-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 right-1/2 w-64 h-64 bg-accent-500/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-highlight-500/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }} />
      </div>

      <div className="flex flex-col flex-1 justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative z-10">
        <div className="mx-auto w-full max-w-md lg:w-[420px]">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <div className="flex justify-center items-center w-16 h-16 rounded-2xl shadow-2xl bg-gradient-primary">
                <img src={logo} alt="logo" className="w-12 h-12 rounded-xl" />
              </div>
            </div>
            <h1 className="text-4xl font-display font-bold gradient-text-primary mb-2">
              {APP_NAME}
            </h1>
            <h2 className="text-xl font-display font-semibold text-secondary-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="mt-2 text-secondary-600 dark:text-secondary-300">
              Sign in to continue optimizing your AI costs
            </p>
          </div>

          <div className="mt-10">
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
              {mfaRequired && mfaData ? (
                <MFAVerification
                  mfaToken={mfaData.mfaToken!}
                  userId={mfaData.userId!}
                  availableMethods={mfaData.availableMethods!}
                  onSuccess={completeMFALogin}
                  onError={(error: unknown) => {
                    console.error('MFA Error:', error);
                    toast.error(error instanceof Error ? error.message : 'MFA verification failed')
                  }}
                  embedded={true}
                />
              ) : (
                <LoginForm />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden relative flex-1 w-0 lg:block">
        <div className="absolute inset-0 bg-gradient-primary">
          <div className="absolute inset-0 bg-black/10" />
          <div className="flex absolute inset-0 justify-center items-center p-12">
            <div className="max-w-xl text-white animate-fade-in">
              <h1 className="mb-6 text-5xl font-display font-bold">Optimize Your AI Costs</h1>
              <p className="mb-8 text-lg text-white/90">
                Track, analyze, and reduce your AI API costs across multiple
                providers. Get intelligent insights and optimization suggestions
                powered by AI.
              </p>

              <div className="p-6 mb-8 rounded-lg backdrop-blur-sm bg-white/10 border border-white/20">
                <h3 className="mb-4 text-xl font-display font-semibold">
                  Key Features:
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
                    <span>Real-time API usage tracking</span>
                  </li>
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
                    <span>AI-powered cost optimization</span>
                  </li>
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
                    <span>Advanced analytics and insights</span>
                  </li>
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
                    <span>Multi-provider cost management</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4 items-center text-white/90">
                <div className="text-center">
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-sm">API Calls Tracked</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold">$10K+</div>
                  <div className="text-sm">Costs Saved</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
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
