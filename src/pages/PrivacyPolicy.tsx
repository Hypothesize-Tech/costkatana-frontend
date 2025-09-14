import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-8">
          <h1 className="text-4xl font-display font-bold gradient-text-primary mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                Information We Collect
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                We collect information you provide directly to us, such as when
                you create an account, use our services, or contact us for
                support.
              </p>
              <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-2">
                <li>Account information (email, name)</li>
                <li>Usage data and analytics</li>
                <li>Communication preferences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                How We Use Your Information
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-2">
                <li>Provide and improve our services</li>
                <li>Communicate with you about your account</li>
                <li>Analyze usage patterns and optimize performance</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                Data Security
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                Your Rights
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-light-text-secondary dark:text-dark-text-secondary space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt out of certain communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                Contact Us
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                If you have any questions about this Privacy Policy, please
                contact us at{" "}
                <a
                  href="mailto:support@costkatana.com"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  support@costkatana.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
