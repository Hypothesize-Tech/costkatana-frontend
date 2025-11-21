import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/utils/validators";
import { authService } from "../../services/auth.service";
import { cn } from "@/utils/helpers";
import { useNotification } from "../../contexts/NotificationContext";

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword(data.email);
      setIsSubmitted(true);
      showNotification("Password reset instructions sent to your email", "success");
    } catch {
      setError("root", {
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center animate-fade-in">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-success flex items-center justify-center shadow-2xl glow-success animate-pulse">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-2xl font-display font-bold gradient-text-success mb-4">
          Check your email
        </h3>

        <p className="text-lg font-body text-light-text-secondary dark:text-dark-text-secondary mb-8">
          We've sent password reset instructions to your email address. Please
          check your inbox and follow the link to reset your password.
        </p>

        <div>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full py-3.5 px-6 rounded-xl font-display font-semibold text-base bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-8 animate-fade-in" onSubmit={handleSubmit(onSubmit)}>
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold gradient-text mb-4">
          Forgot your password?
        </h2>
        <p className="text-lg font-body text-light-text-secondary dark:text-dark-text-secondary">
          Enter your email address and we'll send you instructions to reset your
          password.
        </p>
      </div>

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
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl font-display font-semibold text-base bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <span>Send reset instructions</span>
          )}
        </button>
      </div>

      <p className="text-center text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
        Remember your password?{" "}
        <Link
          to="/login"
          className="font-display font-semibold gradient-text hover:text-primary-400 transition-colors duration-300"
        >
          Back to login
        </Link>
      </p>
    </form>
  );
};
