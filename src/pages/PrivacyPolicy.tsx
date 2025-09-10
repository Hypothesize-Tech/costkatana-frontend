import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Information We Collect
              </h2>
              <p className="text-gray-700 mb-4">
                We collect information you provide directly to us, such as when
                you create an account, use our services, or contact us for
                support.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Account information (email, name)</li>
                <li>Usage data and analytics</li>
                <li>Communication preferences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide and improve our services</li>
                <li>Communicate with you about your account</li>
                <li>Analyze usage patterns and optimize performance</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Data Security
              </h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Your Rights
              </h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt out of certain communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please
                contact us at{" "}
                <a
                  href="mailto:support@costkatana.com"
                  className="text-blue-600 hover:text-blue-800"
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
