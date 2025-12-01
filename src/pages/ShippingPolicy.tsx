import React from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../utils/constant";
import logo from "../assets/logo.png";
import { TruckIcon } from "@heroicons/react/24/outline";

const ShippingPolicy: React.FC = () => {
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
            Shipping Policy
          </h1>
          <p className="text-secondary-600 dark:text-secondary-300">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 lg:p-12">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            {/* Not Applicable Notice */}
            <section className="mb-8">
              <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg border border-primary-200/50 dark:border-primary-800/50 mb-6">
                <div className="flex items-start gap-4">
                  <TruckIcon className="w-8 h-8 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-3">
                      Digital Service - No Physical Shipping
                    </h2>
                    <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                      {APP_NAME} is a cloud-based Software-as-a-Service (SaaS) platform. We do not ship any physical products or goods. All our services are delivered digitally through our web application and API.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Service Delivery */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                Service Delivery
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                Upon subscription or account creation, you gain immediate access to {APP_NAME} services:
              </p>
              <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li><strong>Instant Access:</strong> Your account is activated immediately upon successful registration or subscription payment</li>
                <li><strong>Cloud-Based Platform:</strong> Access our services through your web browser or API integration</li>
                <li><strong>No Download Required:</strong> No software installation or physical media needed</li>
                <li><strong>Global Availability:</strong> Access our services from anywhere with an internet connection</li>
                <li><strong>24/7 Availability:</strong> Our platform is available around the clock, subject to maintenance windows</li>
              </ul>
            </section>

            {/* Account Activation */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                Account Activation Timeline
              </h2>
              <div className="space-y-4">
                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200/50 dark:border-primary-800/50">
                  <h3 className="text-xl font-display font-semibold text-secondary-900 dark:text-white mb-2">
                    Free Accounts
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
                    Free tier accounts are activated immediately upon successful registration and email verification.
                  </p>
                </div>
                <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg border border-success-200/50 dark:border-success-800/50">
                  <h3 className="text-xl font-display font-semibold text-secondary-900 dark:text-white mb-2">
                    Paid Subscriptions
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
                    Paid subscription plans are activated immediately upon successful payment processing. You will receive a confirmation email with access details.
                  </p>
                </div>
                <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-lg border border-warning-200/50 dark:border-warning-800/50">
                  <h3 className="text-xl font-display font-semibold text-secondary-900 dark:text-white mb-2">
                    Enterprise Plans
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
                    Enterprise accounts may require additional setup time for custom configurations. Our sales team will provide a specific timeline during onboarding.
                  </p>
                </div>
              </div>
            </section>

            {/* API Access */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                API Keys and Access Credentials
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                Access credentials are delivered digitally:
              </p>
              <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li>API keys are generated instantly and available in your account dashboard</li>
                <li>Access tokens are provided through secure, encrypted channels</li>
                <li>Documentation and integration guides are available in our knowledge base</li>
                <li>No physical delivery or shipping of credentials is required</li>
              </ul>
            </section>

            {/* Geographic Availability */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                Geographic Availability
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                {APP_NAME} is available globally. There are no geographic restrictions on accessing our digital services. However, please note:
              </p>
              <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li>Service availability may vary based on local internet infrastructure</li>
                <li>Some features may be subject to regional compliance requirements</li>
                <li>Data processing locations are detailed in our Privacy Policy</li>
                <li>Payment methods may vary by region</li>
              </ul>
            </section>

            {/* Support */}
            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                Need Help?
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                If you have questions about accessing your account or need assistance with service delivery, please contact us:
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

export default ShippingPolicy;

