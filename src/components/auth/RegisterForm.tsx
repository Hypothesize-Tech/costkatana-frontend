import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { registerSchema, RegisterFormData } from "@/utils/validators";
import { useAuth } from "@/hooks";
import { cn } from "@/utils/helpers";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

export const RegisterForm = () => {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    mode: 'onSubmit',
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await registerUser(data);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && (error as { response?: { status?: number } }).response?.status === 409) {
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
        <div className="p-4 rounded-2xl border border-danger-200/50 bg-gradient-to-br from-danger-50 to-danger-100/50 glow-danger animate-scale-in animate-shake">
          <p className="text-sm font-medium text-danger-800 dark:text-danger-200">
            {errors.root.message}
          </p>
        </div>
      )}

      <div className="animate-slide-up animation-delay-100">
        <label htmlFor="name" className="label">
          Full name
        </label>
        <div className="mt-2">
          <input
            {...register("name")}
            id="name"
            type="text"
            autoComplete="name"
            className={cn(
              "input transition-all duration-300 focus:ring-2 focus:ring-primary-500/50 focus:scale-[1.01]",
              errors.name && "input-error animate-shake"
            )}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-danger-600 dark:text-danger-400 animate-slide-up">
              {errors.name.message}
            </p>
          )}
        </div>
      </div>

      <div className="animate-slide-up animation-delay-150">
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
        <div className="mt-2 relative">
          <input
            {...register("password")}
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className={cn(
              "input pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary-500/50 focus:scale-[1.01]",
              errors.password && "input-error animate-shake"
            )}
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
            <p className="mt-2 text-sm text-danger-600 dark:text-danger-400 animate-slide-up">
              {errors.password.message}
            </p>
          )}
        </div>
        {password && (
          <div className="mt-3">
            <PasswordStrengthIndicator password={password} />
          </div>
        )}
      </div>

      <div className="animate-slide-up animation-delay-300">
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
              "input pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary-500/50 focus:scale-[1.01]",
              errors.confirmPassword && "input-error animate-shake"
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
            <p className="mt-2 text-sm text-danger-600 dark:text-danger-400 animate-slide-up">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-start animate-slide-up animation-delay-400">
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
          <Link
            to="/terms"
            className="font-display font-semibold gradient-text hover:text-primary-400 transition-colors duration-300"
          >
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy-policy"
            className="font-display font-semibold gradient-text hover:text-primary-400 transition-colors duration-300"
          >
            Privacy Policy
          </Link>
        </label>
      </div>

      <div className="animate-slide-up animation-delay-500">
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

      <p className="text-center text-sm font-body text-light-text-secondary dark:text-dark-text-secondary animate-slide-up animation-delay-600">
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
