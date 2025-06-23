import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { registerSchema, RegisterFormData } from '@/utils/validators';
import { useAuth } from '@/hooks';
import { cn } from '@/utils/helpers';

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
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setIsLoading(true);
            await registerUser(data);
        } catch (error: any) {
            if (error.response?.status === 409) {
                setError('email', {
                    message: 'This email is already registered',
                });
            } else {
                setError('root', {
                    message: 'An error occurred. Please try again.',
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {errors.root && (
                <div className="rounded-md bg-danger-50 dark:bg-danger-900/50 p-4">
                    <p className="text-sm text-danger-800 dark:text-danger-200">
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
                        {...register('name')}
                        id="name"
                        type="text"
                        autoComplete="name"
                        className={cn('input', errors.name && 'input-error')}
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
                        {...register('email')}
                        id="email"
                        type="email"
                        autoComplete="email"
                        className={cn('input', errors.email && 'input-error')}
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
                        {...register('password')}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        className={cn('input pr-10', errors.password && 'input-error')}
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                    </button>
                    {errors.password && (
                        <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">
                            {errors.password.message}
                        </p>
                    )}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
            </div>

            <div>
                <label htmlFor="confirmPassword" className="label">
                    Confirm password
                </label>
                <div className="mt-2 relative">
                    <input
                        {...register('confirmPassword')}
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        className={cn('input pr-10', errors.confirmPassword && 'input-error')}
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
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
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                />
                <label htmlFor="terms" className="ml-3 block text-sm leading-6 text-gray-900 dark:text-gray-300">
                    I agree to the{' '}
                    <a href="/terms" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">
                        Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">
                        Privacy Policy
                    </a>
                </label>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full"
                >
                    {isLoading ? 'Creating account...' : 'Create account'}
                </button>
            </div>

            <p className="text-center text-sm leading-6 text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                    to="/login"
                    className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                    Sign in
                </Link>
            </p>
        </form>
    );
};