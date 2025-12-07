import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { loginSchema, LoginFormData } from "../../utils/validators";
import { useAuth } from "../../hooks";
import { cn } from "../../utils/helpers";

interface LoginFormProps {
  lastLoginMethod?: 'email' | 'google' | 'github' | null;
}

export const LoginForm = ({ lastLoginMethod }: LoginFormProps) => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError("root", {
          message: "Invalid email or password",
        });
      } else {
        setError("root", {
          message: "An error occurred. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      setOauthLoading(provider);
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/auth/oauth/${provider}`);

      if (!response.ok) {
        throw new Error(`Failed to initiate ${provider} login`);
      }

      const data = await response.json();

      if (data.success && data.data?.authUrl) {
        // Redirect to OAuth provider
        window.location.href = data.data.authUrl;
      } else {
        throw new Error(`Invalid response from ${provider} OAuth`);
      }
    } catch (error: any) {
      setError("root", {
        message: error.message || `Failed to login with ${provider}`,
      });
      setOauthLoading(null);
    }
  };

  return (
    <form className="space-y-8 animate-fade-in" onSubmit={handleSubmit(onSubmit)}>
      {errors.root && (
        <div className="p-4 bg-gradient-to-br rounded-2xl border border-danger-200/50 from-danger-50 to-danger-100/50 glow-danger animate-scale-in animate-shake">
          <p className="text-sm font-medium text-danger-800 dark:text-danger-200">
            {errors.root.message}
          </p>
        </div>
      )}

      {/* OAuth Login Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleOAuthLogin('google')}
          disabled={!!oauthLoading}
          className="relative w-full py-3 px-4 rounded-xl font-medium text-base bg-white dark:bg-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-700 text-secondary-700 dark:text-white border border-secondary-300 dark:border-secondary-600 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
        >
          {lastLoginMethod === 'google' && (
            <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-500 text-white shadow-lg animate-scale-in">
              Last used
            </span>
          )}
          {oauthLoading === 'google' ? (
            <div className="w-5 h-5 rounded-full border-2 animate-spin border-secondary-300 dark:border-secondary-600 border-t-primary-500" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          onClick={() => handleOAuthLogin('github')}
          disabled={!!oauthLoading}
          className="relative w-full py-3 px-4 rounded-xl font-medium text-base bg-secondary-900 dark:bg-secondary-800 hover:bg-secondary-800 dark:hover:bg-secondary-700 text-white border border-secondary-700 dark:border-secondary-600 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
        >
          {lastLoginMethod === 'github' && (
            <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-500 text-white shadow-lg animate-scale-in">
              Last used
            </span>
          )}
          {oauthLoading === 'github' ? (
            <div className="w-5 h-5 rounded-full border-2 animate-spin border-secondary-600 border-t-white" />
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          )}
          <span>Continue with GitHub</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="flex absolute inset-0 items-center">
          <div className="w-full border-t border-secondary-300 dark:border-secondary-600"></div>
        </div>
        <div className="flex relative justify-center text-sm">
          <span className="px-4 bg-white dark:bg-gradient-dark-panel text-secondary-500 dark:text-secondary-400">
            Or continue with email
          </span>
        </div>
      </div>

      <div className="animate-slide-up animation-delay-100">
        <label htmlFor="email" className="label">
          Email address
        </label>
        <div className="mt-2">
          <input
            {...register("email")}
            id="email"
            type="email"
            autoComplete="email"
            className={cn(
              "input transition-all duration-300 focus:ring-2 focus:ring-primary-500/50 focus:scale-[1.01]",
              errors.email && "input-error animate-shake"
            )}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-danger-600 dark:text-danger-400 animate-slide-up">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="animate-slide-up animation-delay-200">
        <label htmlFor="password" className="label">
          Password
        </label>
        <div className="relative mt-2">
          <input
            {...register("password")}
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className={cn(
              "input pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary-500/50 focus:scale-[1.01]",
              errors.password && "input-error animate-shake"
            )}
          />
          <button
            type="button"
            className="flex absolute inset-y-0 right-0 items-center pr-3 transition-colors duration-300 text-light-text-muted dark:text-dark-text-muted hover:text-primary-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
          {errors.password && (
            <p className="mt-2 text-sm text-danger-600 dark:text-danger-400 animate-slide-up">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center animate-slide-up animation-delay-300">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="w-4 h-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500 focus:ring-opacity-50"
          />
          <label
            htmlFor="remember-me"
            className="block ml-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary"
          >
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <Link
            to="/forgot-password"
            className="font-semibold transition-colors duration-300 font-display gradient-text hover:text-primary-400"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <div className="animate-slide-up animation-delay-400">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl font-display font-semibold text-base bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 animate-spin border-white/30 border-t-white" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </button>
      </div>

      <p className="text-sm text-center font-body text-light-text-secondary dark:text-dark-text-secondary animate-slide-up animation-delay-500">
        Not a member?{" "}
        <Link
          to="/register"
          className="font-semibold transition-colors duration-300 font-display gradient-text hover:text-primary-400"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
};
