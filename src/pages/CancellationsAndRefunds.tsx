import React from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../utils/constant";
import logo from "../assets/logo.png";
import { ArrowPathIcon, XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const CancellationsAndRefunds: React.FC = () => {
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
            Cancellations and Refunds
          </h1>
          <p className="text-secondary-600 dark:text-secondary-300">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 lg:p-12">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            {/* Introduction */}
            <section className="mb-8">
              <p className="text-secondary-600 dark:text-secondary-300 mb-6 leading-relaxed">
                At {APP_NAME}, we want you to be satisfied with our services. This policy outlines our cancellation and refund procedures for subscriptions and services.
              </p>
            </section>

            {/* Subscription Cancellation */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                1. Subscription Cancellation
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                You may cancel your subscription at any time through your account settings or by contacting our support team.
              </p>

              <h3 className="text-xl font-display font-semibold text-secondary-900 dark:text-white mb-3 mt-6">
                1.1 How to Cancel
              </h3>
              <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li>Log in to your {APP_NAME} account</li>
                <li>Navigate to the Subscription or Settings page</li>
                <li>Click "Cancel Subscription" and follow the prompts</li>
                <li>Alternatively, contact support at <a href="mailto:support@costkatana.com" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors">support@costkatana.com</a></li>
              </ul>

              <h3 className="text-xl font-display font-semibold text-secondary-900 dark:text-white mb-3 mt-6">
                1.2 Cancellation Effective Date
              </h3>
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200/50 dark:border-primary-800/50 mb-4">
                <div className="flex items-start gap-3">
                  <XCircleIcon className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
                      <strong>Important:</strong> Cancellation takes effect at the end of your current billing period. You will continue to have access to all paid features until the subscription period expires. No partial refunds are provided for the remaining period.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Refund Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                2. Refund Policy
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                Our refund policy is designed to be fair and transparent:
              </p>

              <h3 className="text-xl font-display font-semibold text-secondary-900 dark:text-white mb-3 mt-6">
                2.1 Free Trial Period
              </h3>
              <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg border border-success-200/50 dark:border-success-800/50 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-success-600 dark:text-success-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
                      If you cancel during the free trial period (if applicable to your plan), you will not be charged. No refund is necessary as no payment has been processed.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-display font-semibold text-secondary-900 dark:text-white mb-3 mt-6">
                2.2 Paid Subscriptions
              </h3>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                For paid subscriptions:
              </p>
              <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li><strong>No Refunds for Partial Periods:</strong> We do not provide refunds for unused portions of your subscription period after cancellation</li>
                <li><strong>Service Continuation:</strong> You retain access to all paid features until the end of your current billing cycle</li>
                <li><strong>Automatic Renewal:</strong> Subscriptions automatically renew unless cancelled before the renewal date</li>
              </ul>

              <h3 className="text-xl font-display font-semibold text-secondary-900 dark:text-white mb-3 mt-6">
                2.3 Refund Exceptions
              </h3>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                Refunds may be considered in exceptional circumstances:
              </p>
              <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li>Technical issues that prevent you from using the service and cannot be resolved by our support team</li>
                <li>Duplicate charges due to billing errors on our part</li>
                <li>Service unavailability for extended periods (more than 48 hours) due to our technical failures</li>
                <li>As required by applicable consumer protection laws in your jurisdiction</li>
              </ul>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                To request a refund, please contact our support team with details of your situation. Refund requests are reviewed on a case-by-case basis and must be submitted within 30 days of the charge.
              </p>
            </section>

            {/* Account Deletion */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                3. Account Deletion
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                Cancelling your subscription does not automatically delete your account. To permanently delete your account:
              </p>
              <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li>Navigate to your account settings</li>
                <li>Select "Delete Account" or "Close Account"</li>
                <li>Follow the confirmation prompts</li>
                <li>Contact support if you need assistance</li>
              </ul>
              <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-lg border border-warning-200/50 dark:border-warning-800/50 mb-4">
                <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
                  <strong>Warning:</strong> Account deletion is permanent and irreversible. All your data, including usage history, analytics, and configurations, will be permanently deleted. Please export any data you wish to keep before deleting your account.
                </p>
              </div>
            </section>

            {/* Reinstatement */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                4. Subscription Reinstatement
              </h2>
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200/50 dark:border-primary-800/50 mb-4">
                <div className="flex items-start gap-3">
                  <ArrowPathIcon className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed mb-3">
                      If you cancel your subscription and later wish to reactivate it:
                    </p>
                    <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2">
                      <li>You can resubscribe at any time through your account or our pricing page</li>
                      <li>Your previous usage data may be retained for a limited period (subject to our data retention policy)</li>
                      <li>You will be charged the current pricing for your selected plan</li>
                      <li>Any promotional pricing from your previous subscription may not apply</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Billing Disputes */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                5. Billing Disputes
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                If you believe you have been charged incorrectly:
              </p>
              <ol className="list-decimal pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li>Contact our support team immediately at <a href="mailto:support@costkatana.com" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors">support@costkatana.com</a></li>
                <li>Provide your account details and transaction information</li>
                <li>Explain the nature of the dispute</li>
                <li>We will investigate and respond within 5-7 business days</li>
              </ol>
            </section>

            {/* Changes to Pricing */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                6. Changes to Pricing and Plans
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                We reserve the right to modify our pricing and plans. If we increase prices:
              </p>
              <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li>We will provide at least 30 days' notice before the change takes effect</li>
                <li>You may cancel your subscription before the price change to avoid the new rate</li>
                <li>If you continue using the service after the price change, you agree to the new pricing</li>
                <li>Existing subscriptions may be grandfathered at the original price for a limited time</li>
              </ul>
            </section>

            {/* Contact for Refunds */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                7. Contact Us
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                For questions about cancellations, refunds, or billing, please contact us:
              </p>
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200/50 dark:border-primary-800/50">
                <p className="text-secondary-600 dark:text-secondary-300 mb-2">
                  <strong className="text-secondary-900 dark:text-white">Billing Support:</strong>{" "}
                  <a
                    href="mailto:support@costkatana.com"
                    className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors"
                  >
                    support@costkatana.com
                  </a>
                </p>
                <p className="text-secondary-600 dark:text-secondary-300 text-sm">
                  Please include your account email and transaction details for faster assistance.
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
              <Link
                to="/contact"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors"
              >
                Contact Us
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

export default CancellationsAndRefunds;

