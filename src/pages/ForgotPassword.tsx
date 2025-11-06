import { ForgotPasswordForm } from "../components/auth/ForgotPasswordForm";
import { APP_NAME } from "../utils/constant";
import logo from "../assets/logo.png";

export default function ForgotPassword() {
    return (
        <div className="flex flex-1 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient relative overflow-hidden">
            {/* Ambient glow effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-success-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-3/4 right-1/2 w-64 h-64 bg-accent-500/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
                <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-highlight-500/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }} />
            </div>

            <div className="flex flex-col flex-1 justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative z-10">
                <div className="mx-auto w-full max-w-md lg:w-[420px]">
                    <div className="text-center">
                        <div className="flex justify-center items-center mb-6">
                            <div className="flex justify-center items-center w-16 h-16 rounded-2xl shadow-2xl bg-gradient-primary">
                                <img src={logo} alt="logo" className="w-12 h-12 rounded-xl" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-display font-bold gradient-text-primary mb-2">
                            {APP_NAME}
                        </h1>
                        <h2 className="text-xl font-display font-semibold text-secondary-900 dark:text-white">
                            Reset Password
                        </h2>
                        <p className="mt-2 text-secondary-600 dark:text-secondary-300">
                            Enter your email to receive password reset instructions
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
                            <ForgotPasswordForm />
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden relative flex-1 w-0 lg:block">
                <div className="absolute inset-0 bg-gradient-primary">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="flex absolute inset-0 justify-center items-center p-12">
                        <div className="max-w-xl text-white animate-fade-in">
                            <h1 className="mb-6 text-5xl font-display font-bold">Forgot Your Password?</h1>
                            <p className="mb-8 text-lg text-white/90">
                                No worries! We'll send you a secure link to reset your password.
                                Just enter your email address and we'll take care of the rest.
                            </p>

                            <div className="p-6 mb-8 rounded-lg backdrop-blur-sm bg-white/10 border border-white/20">
                                <h3 className="mb-4 text-xl font-display font-semibold">
                                    What happens next:
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex gap-2 items-center">
                                        <svg
                                            className="w-5 h-5 text-white/80"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>Check your email inbox</span>
                                    </li>
                                    <li className="flex gap-2 items-center">
                                        <svg
                                            className="w-5 h-5 text-white/80"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>Click the reset link in the email</span>
                                    </li>
                                    <li className="flex gap-2 items-center">
                                        <svg
                                            className="w-5 h-5 text-white/80"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>Create a new secure password</span>
                                    </li>
                                    <li className="flex gap-2 items-center">
                                        <svg
                                            className="w-5 h-5 text-white/80"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>Sign in with your new password</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

