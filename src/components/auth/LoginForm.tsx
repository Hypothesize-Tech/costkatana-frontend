import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { loginSchema, LoginFormData } from "../../utils/validators";
import { useAuth } from "../../hooks";
import { cn } from "../../utils/helpers";

export const LoginForm = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <form className="space-y-8 animate-fade-in" onSubmit={handleSubmit(onSubmit)}>
      {errors.root && (
        <div className="p-4 rounded-2xl border border-danger-200/50 bg-gradient-to-br from-danger-50 to-danger-100/50 glow-danger animate-scale-in">
          <p className="text-sm font-medium text-danger-800 dark:text-danger-200">
            {errors.root.message}
          </p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="label">
          Email address
        </label>
        <div className="mt-2">
          <input
            {...register("email")}
            id="email"
            type="email"
            autoComplete="email"
            className={cn("input", errors.email && "input-error")}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <div className="relative mt-2">
          <input
            {...register("password")}
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className={cn("input pr-10", errors.password && "input-error")}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-light-text-muted dark:text-dark-text-muted hover:text-primary-500 transition-colors duration-300"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
          {errors.password && (
            <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
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
            className="font-display font-semibold gradient-text hover:text-primary-400 transition-colors duration-300"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl font-display font-semibold text-base bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </button>
      </div>

      <p className="text-center text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
        Not a member?{" "}
        <Link
          to="/register"
          className="font-display font-semibold gradient-text hover:text-primary-400 transition-colors duration-300"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
};
