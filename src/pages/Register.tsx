import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth } from '../hooks';
import { APP_NAME } from '../utils/constant';

export default function Register() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="flex flex-1 min-h-screen">
            <div className="flex flex-col flex-1 justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        <div className="flex gap-x-3 items-center">
                            <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-primary-600">
                                <span className="text-xl font-bold text-white">AI</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {APP_NAME}
                            </h2>
                        </div>
                        <h2 className="mt-8 text-2xl font-bold tracking-tight leading-9 text-gray-900 dark:text-white">
                            Create your account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Start optimizing your AI costs today
                        </p>
                    </div>

                    <div className="mt-10">
                        <RegisterForm />
                    </div>
                </div>
            </div>

            <div className="hidden relative flex-1 w-0 lg:block">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="flex absolute inset-0 justify-center items-center p-12">
                        <div className="max-w-xl text-white">
                            <h1 className="mb-6 text-4xl font-bold">
                                Start Your Free Trial
                            </h1>
                            <p className="mb-8 text-lg text-primary-100">
                                Join thousands of developers who are already saving on their AI API costs.
                            </p>

                            <div className="p-6 mb-8 rounded-lg backdrop-blur-sm bg-white/10">
                                <h3 className="mb-4 text-xl font-semibold">Free Plan Includes:</h3>
                                <ul className="space-y-3">
                                    <li className="flex gap-2 items-center">
                                        <svg className="w-5 h-5 text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>1,000 API calls per month</span>
                                    </li>
                                    <li className="flex gap-2 items-center">
                                        <svg className="w-5 h-5 text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>10 AI-powered optimizations</span>
                                    </li>
                                    <li className="flex gap-2 items-center">
                                        <svg className="w-5 h-5 text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Basic analytics and reporting</span>
                                    </li>
                                    <li className="flex gap-2 items-center">
                                        <svg className="w-5 h-5 text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Email alerts and notifications</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex gap-4 items-center text-primary-200">
                                <div className="text-center">
                                    <div className="text-3xl font-bold">50K+</div>
                                    <div className="text-sm">API Calls Tracked</div>
                                </div>
                                <div className="w-px h-12 bg-primary-400/30" />
                                <div className="text-center">
                                    <div className="text-3xl font-bold">$10K+</div>
                                    <div className="text-sm">Costs Saved</div>
                                </div>
                                <div className="w-px h-12 bg-primary-400/30" />
                                <div className="text-center">
                                    <div className="text-3xl font-bold">35%</div>
                                    <div className="text-sm">Avg. Cost Reduction</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}