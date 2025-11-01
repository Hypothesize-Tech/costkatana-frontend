import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { registerSchema, RegisterFormData } from "@/utils/validators";
import { useAuth } from "@/hooks";
import { cn } from "@/utils/helpers";

export const RegisterForm = () => {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    mode: 'onSubmit',
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await registerUser(data);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setError("email", {
          message: "This email is already registered",
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
        <label htmlFor="name" className="label">
          Full name
        </label>
        <div className="mt-2">
          <input
            {...register("name")}
            id="name"
            type="text"
            autoComplete="name"
            className={cn("input", errors.name && "input-error")}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">
              {errors.name.message}
            </p>
          )}
        </div>
      </div>

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
        <div className="mt-2 relative">
          <input
            {...register("password")}
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className={cn("input pr-10", errors.password && "input-error")}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-light-text-muted dark:text-dark-text-muted hover:text-primary-500 transition-colors duration-300"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
          {errors.password && (
            <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">
              {errors.password.message}
            </p>
          )}
        </div>
        <p className="mt-2 text-sm font-medium text-light-text-muted dark:text-dark-text-muted">
          Must be at least 8 characters with uppercase, lowercase, and numbers
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="label">
          Confirm password
        </label>
        <div className="mt-2 relative">
          <input
            {...register("confirmPassword")}
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            className={cn(
              "input pr-10",
              errors.confirmPassword && "input-error",
            )}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-light-text-muted dark:text-dark-text-muted hover:text-primary-500 transition-colors duration-300"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-start">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          className="h-4 w-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500 focus:ring-opacity-50 mt-1"
        />
        <label
          htmlFor="terms"
          className="ml-3 block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary"
        >
          I agree to the{" "}
          <a
            href="/terms"
            className="font-display font-semibold gradient-text hover:text-primary-400 transition-colors duration-300"
          >
            Terms and Conditions
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="font-display font-semibold gradient-text hover:text-primary-400 transition-colors duration-300"
          >
            Privacy Policy
          </a>
        </label>
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
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create account</span>
          )}
        </button>
      </div>

      <p className="text-center text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-display font-semibold gradient-text hover:text-primary-400 transition-colors duration-300"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
};
