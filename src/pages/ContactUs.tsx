import React from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../utils/constant";
import logo from "../assets/logo.png";
import { EnvelopeIcon, ChatBubbleLeftRightIcon, ClockIcon } from "@heroicons/react/24/outline";

const ContactUs: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient glow effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-success-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center mb-6">
                        <div className="flex justify-center items-center w-16 h-16 rounded-2xl shadow-2xl bg-gradient-primary">
                            <img src={logo} alt="logo" className="w-12 h-12 rounded-xl" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-display font-bold gradient-text-primary mb-2">
                        Contact Us
                    </h1>
                    <p className="text-secondary-600 dark:text-secondary-300">
                        We're here to help! Get in touch with our team.
                    </p>
                </div>

                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 lg:p-12">
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                        {/* Introduction */}
                        <section className="mb-8">
                            <p className="text-secondary-600 dark:text-secondary-300 mb-6 leading-relaxed">
                                Thank you for your interest in {APP_NAME}. Whether you have questions about our services, need technical support, or want to discuss enterprise solutions, we're here to help. Choose the best way to reach us below.
                            </p>
                        </section>

                        {/* Contact Methods */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-6">
                                Get in Touch
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {/* Email Support */}
                                <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg border border-primary-200/50 dark:border-primary-800/50 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                                            <EnvelopeIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-display font-semibold text-secondary-900 dark:text-white mb-2">
                                                Email Support
                                            </h3>
                                            <p className="text-secondary-600 dark:text-secondary-300 mb-3 text-sm leading-relaxed">
                                                For general inquiries, technical support, or account-related questions.
                                            </p>
                                            <a
                                                href="mailto:support@costkatana.com"
                                                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors text-sm"
                                            >
                                                support@costkatana.com
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Sales & Enterprise */}
                                <div className="bg-success-50 dark:bg-success-900/20 p-6 rounded-lg border border-success-200/50 dark:border-success-800/50 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-success flex items-center justify-center">
                                            <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-display font-semibold text-secondary-900 dark:text-white mb-2">
                                                Sales & Enterprise
                                            </h3>
                                            <p className="text-secondary-600 dark:text-secondary-300 mb-3 text-sm leading-relaxed">
                                                Interested in enterprise plans, custom solutions, or partnerships.
                                            </p>
                                            <a
                                                href="mailto:support@costkatana.com"
                                                className="text-success-600 hover:text-success-500 dark:text-success-400 dark:hover:text-success-300 font-semibold transition-colors text-sm"
                                            >
                                                support@costkatana.com
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Response Times */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                                Response Times
                            </h2>
                            <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg border border-primary-200/50 dark:border-primary-800/50">
                                <div className="flex items-start gap-4">
                                    <ClockIcon className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                                            We aim to respond to all inquiries as quickly as possible:
                                        </p>
                                        <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2">
                                            <li><strong>General Support:</strong> Within 24-48 hours</li>
                                            <li><strong>Technical Issues:</strong> Within 12-24 hours</li>
                                            <li><strong>Enterprise Inquiries:</strong> Within 1 business day</li>
                                            <li><strong>Urgent Matters:</strong> Please mark your email as urgent for faster response</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Additional Information */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                                Additional Information
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-display font-semibold text-secondary-900 dark:text-white mb-3">
                                        Before Contacting Us
                                    </h3>
                                    <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                                        To help us assist you more effectively, please consider:
                                    </p>
                                    <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                                        <li>Check our <Link to="/terms" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors">Terms and Conditions</Link> and <Link to="/privacy-policy" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors">Privacy Policy</Link> for common questions</li>
                                        <li>Review your account settings and dashboard for self-service options</li>
                                        <li>Include relevant details such as error messages, account information, or screenshots when reporting issues</li>
                                        <li>For billing inquiries, include your subscription plan and transaction details</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-display font-semibold text-secondary-900 dark:text-white mb-3">
                                        Community & Resources
                                    </h3>
                                    <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                                        You can also find help through:
                                    </p>
                                    <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                                        <li>Our documentation and knowledge base</li>
                                        <li>Product updates and announcements</li>
                                        <li>Best practices and optimization guides</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Business Hours */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                                Business Hours
                            </h2>
                            <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg border border-primary-200/50 dark:border-primary-800/50">
                                <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                                    Our support team operates during standard business hours. While we monitor emails outside these hours, responses may be delayed. For enterprise customers, we offer priority support with extended availability.
                                </p>
                                <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
                                    <strong className="text-secondary-900 dark:text-white">Standard Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM (UTC)
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Footer Links */}
                    <div className="mt-12 pt-8 border-t border-primary-200/30 dark:border-primary-800/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                            <Link
                                to="/privacy-policy"
                                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                to="/terms"
                                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors"
                            >
                                Terms and Conditions
                            </Link>
                        </div>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-display font-semibold text-sm bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
