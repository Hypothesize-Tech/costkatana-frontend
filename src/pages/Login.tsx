import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { MFAVerification } from "../components/auth/MFAVerification";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { FloatingParticles } from "../components/auth/FloatingParticles";
import { TestimonialsCarousel } from "../components/auth/TestimonialsCarousel";
import { AnimatedIllustrations } from "../components/auth/AnimatedIllustrations";
import { useAuth } from "../hooks";
import { APP_NAME } from "../utils/constant";
import logo from "../assets/logo.png";
import { useNotification } from "../contexts/NotificationContext";

export default function Login() {
  const { isAuthenticated, isLoading, mfaRequired, mfaData, completeMFALogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const [lastLoginMethod, setLastLoginMethod] = useState<'email' | 'google' | 'github' | null>(null);
  const [oauthMfaData, setOauthMfaData] = useState<{
    mfaToken: string;
    userId: string;
    availableMethods: Array<'email' | 'totp'>;
  } | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    // Only redirect if we're sure the user is authenticated and not loading
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  // Check for error in URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    if (error) {
      setUrlError(decodeURIComponent(error));
      showNotification(decodeURIComponent(error), "error");
      // Clear error from URL
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate, showNotification]);

  // Check for OAuth MFA redirect
  useEffect(() => {
    const oauthMfaRequired = localStorage.getItem('oauthMfaRequired');
    if (oauthMfaRequired === 'true') {
      const mfaToken = localStorage.getItem('oauthMfaToken');
      const userId = localStorage.getItem('oauthUserId');
      const methodsStr = localStorage.getItem('oauthAvailableMethods');

      if (mfaToken && userId && methodsStr) {
        try {
          const availableMethods = JSON.parse(methodsStr);
          setOauthMfaData({ mfaToken, userId, availableMethods });

          // Clear from localStorage
          localStorage.removeItem('oauthMfaRequired');
          localStorage.removeItem('oauthMfaToken');
          localStorage.removeItem('oauthUserId');
          localStorage.removeItem('oauthAvailableMethods');
        } catch (error) {
          console.error('Failed to parse OAuth MFA data:', error);
        }
      }
    }
  }, []);

  // Load last login method from localStorage
  useEffect(() => {
    const storedMethod = localStorage.getItem('lastLoginMethod') as 'email' | 'google' | 'github' | null;
    if (storedMethod) {
      setLastLoginMethod(storedMethod);
    }
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex overflow-hidden relative flex-1 justify-center items-center min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
        {/* Ambient glow effects */}
        <div className="overflow-hidden absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse bg-primary-500/8" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse bg-success-500/8" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative z-10">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden relative flex-1 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      {/* Ambient glow effects */}
      <div className="overflow-hidden absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse bg-primary-500/8" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse bg-success-500/8" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 right-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse bg-accent-500/6" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full blur-3xl animate-pulse bg-highlight-500/6" style={{ animationDelay: '6s' }} />
      </div>

      <div className="flex relative z-10 flex-col flex-1 justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md lg:w-[420px]">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <div className="flex justify-center items-center w-16 h-16 rounded-2xl shadow-2xl bg-gradient-primary">
                <img src={logo} alt="logo" className="w-12 h-12 rounded-xl" />
              </div>
            </div>
            <h1 className="mb-2 text-4xl font-bold font-display gradient-text-primary">
              {APP_NAME}
            </h1>
            <h2 className="text-xl font-semibold font-display text-secondary-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="mt-2 text-secondary-600 dark:text-secondary-300">
              Sign in to continue optimizing your AI costs
            </p>
          </div>

          <div className="mt-10">
            {/* Error message from URL */}
            {urlError && (
              <div className="p-4 mb-4 bg-gradient-to-br rounded-xl border border-danger-200/50 from-danger-50 to-danger-100/50 dark:from-danger-900/20 dark:to-danger-800/20 glow-danger animate-scale-in">
                <div className="flex gap-3 items-start">
                  <svg className="w-5 h-5 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-danger-800 dark:text-danger-200">
                      {urlError}
                    </p>
                  </div>
                  <button
                    onClick={() => setUrlError(null)}
                    className="transition-colors text-danger-400 hover:text-danger-600 dark:hover:text-danger-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              {(mfaRequired && mfaData) || oauthMfaData ? (
                <MFAVerification
                  mfaToken={(oauthMfaData?.mfaToken || mfaData?.mfaToken) ?? ''}
                  userId={(oauthMfaData?.userId || mfaData?.userId) ?? ''}
                  availableMethods={(oauthMfaData?.availableMethods || mfaData?.availableMethods) ?? []}
                  onSuccess={completeMFALogin}
                  onError={(error: unknown) => {
                    console.error('MFA Error:', error);
                    showNotification(error instanceof Error ? error.message : 'MFA verification failed', 'error');
                    // Clear OAuth MFA data on error
                    if (oauthMfaData) {
                      setOauthMfaData(null);
                    }
                  }}
                  embedded={true}
                />
              ) : (
                <LoginForm lastLoginMethod={lastLoginMethod} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden relative flex-1 w-0 lg:block">
        <div className="absolute inset-0 bg-gradient-primary">
          <div className="absolute inset-0 bg-black/10" />
          <FloatingParticles count={25} color="rgba(255, 255, 255, 0.15)" />
          <div className="flex absolute inset-0 justify-center items-center p-12">
            <div className="relative z-10 max-w-xl text-white animate-fade-in">
              <div className="mb-8">
                <AnimatedIllustrations />
              </div>
              <h1 className="mb-6 text-5xl font-bold font-display">Optimize Your AI Costs</h1>
              <p className="mb-8 text-lg text-white/90">
                Track, analyze, and reduce your AI API costs across multiple
                providers. Get intelligent insights and optimization suggestions
                powered by AI.
              </p>

              <div className="p-6 mb-8 rounded-lg border backdrop-blur-sm bg-white/10 border-white/20">
                <h3 className="mb-4 text-xl font-semibold font-display">
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

              <div className="mb-8">
                <TestimonialsCarousel />
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
