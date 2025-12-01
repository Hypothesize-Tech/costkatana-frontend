import React from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../utils/constant";
import logo from "../assets/logo.png";

const PrivacyPolicy: React.FC = () => {
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
            Privacy Policy
          </h1>
          <p className="text-secondary-600 dark:text-secondary-300">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 lg:p-12">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="text-secondary-600 dark:text-secondary-300 mb-6 leading-relaxed">
              At {APP_NAME}, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI cost optimization platform.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                1. Information We Collect
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
              </p>

              <h3 className="text-xl font-display font-semibold text-secondary-900 dark:text-white mb-3 mt-6">
                1.1 Personal Information
              </h3>
              <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li>Name and email address</li>
                <li>Company name and job title (optional)</li>
                <li>Payment and billing information (for paid plans)</li>
                <li>Profile picture and preferences</li>
              </ul>

              <h3 className="text-xl font-display font-semibold text-secondary-900 dark:text-white mb-3 mt-6">
                1.2 Usage Data
              </h3>
              <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li>AI API usage metrics and costs</li>
                <li>Service provider information (OpenAI, Anthropic, etc.)</li>
                <li>Model usage patterns and optimization data</li>
                <li>Feature usage and interaction data</li>
              </ul>

              <h3 className="text-xl font-display font-semibold text-secondary-900 dark:text-white mb-3 mt-6">
                1.3 Technical Information
              </h3>
              <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Log files and error reports</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li><strong>Service Delivery:</strong> To provide, maintain, and improve our AI cost optimization services</li>
                <li><strong>Account Management:</strong> To create and manage your account, process transactions, and send account-related communications</li>
                <li><strong>Analytics and Optimization:</strong> To analyze usage patterns, generate insights, and provide cost optimization recommendations</li>
                <li><strong>Communication:</strong> To send you service updates, security alerts, and respond to your inquiries</li>
                <li><strong>Security:</strong> To detect, prevent, and address technical issues, fraud, and security threats</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
                <li><strong>Business Operations:</strong> To conduct research, develop new features, and improve user experience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                3. Data Sharing and Disclosure
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our platform (e.g., cloud hosting, payment processing)</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                4. Data Security
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                We implement industry-standard technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure data centers with physical security measures</li>
                <li>Employee training on data protection and privacy</li>
              </ul>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                5. Your Rights and Choices
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li><strong>Access:</strong> Request access to your personal information and receive a copy</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to processing of your personal information for certain purposes</li>
                <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                6. Cookies and Tracking Technologies
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our platform and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                7. Data Retention
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal or legitimate business purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                8. Children's Privacy
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us, and we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                9. International Data Transfers
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. We take appropriate safeguards to ensure your information receives an adequate level of protection.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                10. Changes to This Privacy Policy
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-white mb-4">
                11. Contact Us
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4 leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200/50 dark:border-primary-800/50">
                <p className="text-secondary-600 dark:text-secondary-300">
                  <strong className="text-secondary-900 dark:text-white">General Support:</strong>{" "}
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
};

export default PrivacyPolicy;
