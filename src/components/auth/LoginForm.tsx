import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { loginSchema, LoginFormData } from '../../utils/validators';
import { useAuth } from '../../hooks';
import { cn } from '../../utils/helpers';

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
                setError('root', {
                    message: 'Invalid email or password',
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
                <div className="p-4 rounded-md bg-danger-50 dark:bg-danger-900/50">
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
                <div className="relative mt-2">
                    <input
                        {...register('password')}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        className={cn('input pr-10', errors.password && 'input-error')}
                    />
                    <button
                        type="button"
                        className="flex absolute inset-y-0 right-0 items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                            <EyeIcon className="w-5 h-5 text-gray-400" />
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
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                    <label htmlFor="remember-me" className="block ml-3 text-sm leading-6 text-gray-900 dark:text-gray-300">
                        Remember me
                    </label>
                </div>

                <div className="text-sm leading-6">
                    <Link
                        to="/forgot-password"
                        className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                        Forgot password?
                    </Link>
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary"
                >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
            </div>

            <p className="text-sm leading-6 text-center text-gray-500 dark:text-gray-400">
                Not a member?{' '}
                <Link
                    to="/register"
                    className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                    Create an account
                </Link>
            </p>
        </form>
    );
};