import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { MFAVerification } from "../components/auth/MFAVerification";
import { useAuth } from "../hooks";
import { APP_NAME } from "../utils/constant";
import logo from "../assets/logo.jpg";
import toast from "react-hot-toast";

export default function Login() {
  const { isAuthenticated, mfaRequired, mfaData, completeMFALogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for returnUrl in query params (from invitation links) or state (from protected routes)
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl') || location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, returnUrl]);

  return (
    <div className="flex flex-1 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-success-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-accent-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-1/2 left-1/3 w-72 h-72 bg-highlight-500/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }} />
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
              Welcome back
            </h2>
            <p className="mt-2 text-secondary-600 dark:text-secondary-300">
              Sign in to your account to continue
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
                  onError={(error: any) => {
                    console.error('MFA Error:', error);
                    toast.error(error.message)
                    // Could show error toast here
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
              <h1 className="mb-6 text-5xl font-display font-bold">
                Optimize Your AI Costs
              </h1>
              <p className="mb-8 text-xl font-body text-primary-100">
                Track, analyze, and reduce your AI API costs across multiple
                providers. Get intelligent insights and optimization suggestions
                powered by AI.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mt-1">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg">
                      Real-time Tracking
                    </h3>
                    <p className="text-primary-200 font-body">
                      Monitor API usage and costs across all major AI providers
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mt-1">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg">
                      AI-Powered Optimization
                    </h3>
                    <p className="text-primary-200 font-body">
                      Get intelligent suggestions to reduce token usage by up to
                      40%
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mt-1">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg">
                      Advanced Analytics
                    </h3>
                    <p className="text-primary-200 font-body">
                      Detailed insights and predictions to control your AI
                      spending
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
