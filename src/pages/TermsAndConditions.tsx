import { Link } from "react-router-dom";
import { APP_NAME } from "../utils/constant";
import logo from "../assets/logo.png";

export default function TermsAndConditions() {
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
                        Terms and Conditions
                    </h1>
                    <p className="text-secondary-600 dark:text-secondary-300">
                        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Content */}
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 lg:p-12">
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                        {/* Introduction */}
                        <section className="mb-8">
                            <p className="text-secondary-600 dark:text-secondary-300 mb-6 leading-relaxed">
                                Welcome to {APP_NAME}. These Terms and Conditions ("Terms") govern your access to and use of our AI cost optimization platform. By accessing or using our services, you agree to be bound by these Terms.
                            </p>
                        </section>

                        {/* Acceptance of Terms */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                                1. Acceptance of Terms
                            </h2>
                            <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                                By creating an account, accessing, or using {APP_NAME}, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use our services.
                            </p>
                        </section>

                        {/* Description of Service */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                                2. Description of Service
                            </h2>
                            <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                                {APP_NAME} is an AI cost optimization platform that helps you track, analyze, and optimize your AI API usage and costs across multiple providers. Our services include:
                            </p>
                            <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                                <li>Real-time tracking of AI API usage and costs</li>
                                <li>Cost analysis and optimization recommendations</li>
                                <li>Multi-provider cost management</li>
                                <li>Analytics and reporting tools</li>
                                <li>Alert and notification services</li>
                            </ul>
                        </section>

                        {/* User Accounts */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                                3. User Accounts
                            </h2>
                            <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                                To use our services, you must create an account. You agree to:
                            </p>
                            <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                                <li>Provide accurate, current, and complete information during registration</li>
                                <li>Maintain and promptly update your account information</li>
                                <li>Maintain the security of your password and account</li>
                                <li>Accept responsibility for all activities that occur under your account</li>
                                <li>Notify us immediately of any unauthorized use of your account</li>
                            </ul>
                        </section>

                        {/* Acceptable Use */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                                4. Acceptable Use
                            </h2>
                            <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                                You agree not to use our services to:
                            </p>
                            <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                                <li>Violate any applicable laws or regulations</li>
                                <li>Infringe upon the rights of others</li>
                                <li>Transmit any malicious code, viruses, or harmful data</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Interfere with or disrupt the integrity or performance of our services</li>
                                <li>Use automated systems to access our services without permission</li>
                                <li>Resell or redistribute our services without authorization</li>
                            </ul>
                        </section>

                        {/* Subscription and Payment */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                                5. Subscription and Payment
                            </h2>
                            <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                                Some features of {APP_NAME} may require a paid subscription. By subscribing, you agree to:
                            </p>
                            <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                                <li>Pay all fees associated with your subscription plan</li>
                                <li>Automatic renewal of your subscription unless cancelled</li>
                                <li>Price changes with 30 days notice</li>
                                <li>No refunds for partial subscription periods unless required by law</li>
                            </ul>
                        </section>

                        {/* Intellectual Property */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                                6. Intellectual Property
                            </h2>
                            <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                                All content, features, and functionality of {APP_NAME}, including but not limited to text, graphics, logos, and software, are owned by us and protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
                            </p>
                        </section>

                        {/* Data and Privacy */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                                7. Data and Privacy
                            </h2>
                            <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                                Your use of our services is also governed by our Privacy Policy. By using {APP_NAME}, you consent to the collection and use of your information as described in our Privacy Policy. We implement industry-standard security measures to protect your data.
                            </p>
                        </section>

                        {/* Limitation of Liability */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                                8. Limitation of Liability
                            </h2>
                            <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                                To the maximum extent permitted by law, {APP_NAME} and its providers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our services.
                            </p>
                        </section>

                        {/* Termination */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                                9. Termination
                            </h2>
                            <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                                We may terminate or suspend your account and access to our services immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties. You may also terminate your account at any time by contacting us or using the account deletion feature in your settings.
                            </p>
                        </section>

                        {/* Changes to Terms */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                                10. Changes to Terms
                            </h2>
                            <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                                We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of our services after such modifications constitutes your acceptance of the updated Terms.
                            </p>
                        </section>

                        {/* Contact Information */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                                11. Contact Information
                            </h2>
                            <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                                If you have any questions about these Terms and Conditions, please contact us at:
                            </p>
                            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200/50 dark:border-primary-800/50">
                                <p className="text-secondary-600 dark:text-secondary-300">
                                    <strong className="text-secondary-900 dark:text-white">Support:</strong>{" "}
                                    <a
                                        href="mailto:support@costkatana.com"
                                        className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors"
                                    >
                                        support@costkatana.com
                                    </a>
                                </p>
                            </div>
                        </section>

                        {/* Governing Law */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                                12. Governing Law
                            </h2>
                            <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which {APP_NAME} operates, without regard to its conflict of law provisions.
                            </p>
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
                                to="/contact"
                                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors"
                            >
                                Contact Us
                            </Link>
                            <Link
                                to="/cancellations-refunds"
                                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors"
                            >
                                Cancellations & Refunds
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
}

