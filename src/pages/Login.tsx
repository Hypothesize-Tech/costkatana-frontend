import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { MFAVerification } from "../components/auth/MFAVerification";
import { useAuth } from "../hooks";
import { APP_NAME } from "../utils/constant";
import logo from "../assets/logo.png";
import toast from "react-hot-toast";

export default function Login() {
  const { isAuthenticated, mfaRequired, mfaData, completeMFALogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  return (
    <div className="flex flex-1 min-h-screen bg-white dark:bg-gray-900">
      <div className="flex flex-col flex-1 justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex gap-x-3 items-center">
              <div className="flex justify-center items-center w-10 h-10 rounded-lg shadow-lg">
                <img src={logo} alt="logo" className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {APP_NAME}
              </h2>
            </div>
            <h2 className="mt-8 text-2xl font-bold tracking-tight leading-9 text-gray-900 dark:text-white">
              Sign in to your account
            </h2>
          </div>

          <div className="mt-10">
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

      <div className="hidden relative flex-1 w-0 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900">
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
          <div className="flex absolute inset-0 justify-center items-center p-12">
            <div className="max-w-xl text-white">
              <h1 className="mb-6 text-4xl font-bold">
                Optimize Your AI Costs
              </h1>
              <p className="mb-8 text-lg text-primary-100 dark:text-primary-200">
                Track, analyze, and reduce your AI API costs across multiple
                providers. Get intelligent insights and optimization suggestions
                powered by AI.
              </p>
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-400/20 dark:bg-primary-300/20 flex items-center justify-center mt-0.5">
                    <svg
                      className="w-4 h-4 text-primary-200 dark:text-primary-100"
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
                    <h3 className="font-semibold text-white">
                      Real-time Tracking
                    </h3>
                    <p className="text-primary-100 dark:text-primary-200">
                      Monitor API usage and costs across all major AI providers
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-400/20 dark:bg-primary-300/20 flex items-center justify-center mt-0.5">
                    <svg
                      className="w-4 h-4 text-primary-200 dark:text-primary-100"
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
                    <h3 className="font-semibold text-white">
                      AI-Powered Optimization
                    </h3>
                    <p className="text-primary-100 dark:text-primary-200">
                      Get intelligent suggestions to reduce token usage by up to
                      40%
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-400/20 dark:bg-primary-300/20 flex items-center justify-center mt-0.5">
                    <svg
                      className="w-4 h-4 text-primary-200 dark:text-primary-100"
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
                    <h3 className="font-semibold text-white">
                      Advanced Analytics
                    </h3>
                    <p className="text-primary-100 dark:text-primary-200">
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
