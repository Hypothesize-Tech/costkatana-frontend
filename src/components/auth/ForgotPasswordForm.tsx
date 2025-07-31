import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/utils/validators";
import { authService } from "@/services/auth.service";
import { cn } from "@/utils/helpers";
import toast from "react-hot-toast";

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      toast.success("Password reset instructions sent to your email");
    } catch (error: any) {
      setError("root", {
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100 dark:bg-success-900">
            <svg
              className="h-6 w-6 text-success-600 dark:text-success-400"
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

        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Check your email
        </h3>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          We've sent password reset instructions to your email address. Please
          check your inbox and follow the link to reset your password.
        </p>

        <div className="mt-6">
          <Link to="/login" className="btn-primary">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Forgot your password?
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you instructions to reset your
          password.
        </p>
      </div>

      {errors.root && (
        <div className="rounded-md bg-danger-50 dark:bg-danger-900/50 p-4">
          <p className="text-sm text-danger-800 dark:text-danger-200">
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
          className="btn-primary w-full"
        >
          {isLoading ? "Sending..." : "Send reset instructions"}
        </button>
      </div>

      <p className="text-center text-sm leading-6 text-gray-500 dark:text-gray-400">
        Remember your password?{" "}
        <Link
          to="/login"
          className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
        >
          Back to login
        </Link>
      </p>
    </form>
  );
};
