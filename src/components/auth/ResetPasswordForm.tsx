import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { resetPasswordSchema } from "@/utils/validators";
import { authService } from "@/services/auth.service";
import { cn } from "@/utils/helpers";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { useNotification } from "../../contexts/NotificationContext";

interface ResetPasswordFormData {
    password: string;
    confirmPassword: string;
}

interface ResetPasswordFormProps {
    token: string;
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { showNotification } = useNotification();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        setError,
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const password = watch("password");

    const onSubmit = async (data: ResetPasswordFormData) => {
        try {
            setIsLoading(true);
            await authService.resetPassword(token, data.password);
            setIsSuccess(true);
            showNotification("Password reset successful! Redirecting to login...", "success");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error: any) {
            if (error.response?.status === 400) {
                setError("root", {
                    message: error.response?.data?.message || "Invalid or expired reset token",
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

    if (isSuccess) {
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
                    Password Reset Successful
                </h3>

                <p className="text-lg font-body text-light-text-secondary dark:text-dark-text-secondary mb-8">
                    Your password has been successfully reset. You can now sign in with your new password.
                </p>

                <div>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center w-full py-3.5 px-6 rounded-xl font-display font-semibold text-base bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Go to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <form className="space-y-8 animate-fade-in" onSubmit={handleSubmit(onSubmit)}>
            <div className="text-center">
                <h2 className="text-3xl font-display font-bold gradient-text mb-4">
                    Reset your password
                </h2>
                <p className="text-lg font-body text-light-text-secondary dark:text-dark-text-secondary">
                    Enter your new password below
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
                <label htmlFor="password" className="label">
                    New password
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
                {password && (
                    <div className="mt-3">
                        <PasswordStrengthIndicator password={password} />
                    </div>
                )}
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
                            errors.confirmPassword && "input-error"
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

            <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-xl font-display font-semibold text-base bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Resetting password...</span>
                        </>
                    ) : (
                        <span>Reset password</span>
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

