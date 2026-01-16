import React from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../utils/constant";
import logo from "../assets/logo.png";
import { getContactLink } from "../utils/contact-utils";
import linearIcon from "../assets/linear-app-icon-seeklogo.svg";
import jiraIcon from "../assets/jira.png";

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
                We use the information we collect <strong>exclusively to provide and improve the functionality of our AI cost optimization services</strong>. We do NOT use your data for advertising, marketing to third parties, or any purposes unrelated to providing you with our core service. All data usage is strictly limited to the following purposes:
              </p>
              <ul className="list-disc pl-6 text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                <li><strong>Service Delivery:</strong> To provide and maintain the core functionality of our AI cost optimization platform</li>
                <li><strong>Account Management:</strong> To create and manage your account, authenticate your identity, and process transactions</li>
                <li><strong>Cost Analytics:</strong> To analyze your AI usage patterns and provide you with personalized cost optimization recommendations</li>
                <li><strong>User-Requested Features:</strong> To enable features you explicitly activate, such as generating reports, sending notifications, and managing calendar alerts</li>
                <li><strong>Communication:</strong> To send you service-related updates, security alerts, and respond to your support inquiries</li>
                <li><strong>Security and Reliability:</strong> To detect, prevent, and address technical issues, fraud, security threats, and ensure platform stability</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
              </ul>

              <div className="relative overflow-hidden bg-gradient-to-br from-primary-500/10 via-primary-50/50 to-success-500/10 dark:from-primary-500/10 dark:via-primary-900/30 dark:to-success-500/10 border border-primary-400/30 dark:border-primary-500/30 rounded-lg p-6 mt-6">
                {/* Subtle green glow effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 dark:bg-primary-500/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-success-500/5 dark:bg-success-500/5 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <h3 className="text-lg font-display font-semibold gradient-text-primary mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Google OAuth Data Usage</span>
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                    When you connect your Google account to {APP_NAME}, we access your Google data <strong className="text-secondary-900 dark:text-white">solely to provide you with the core functionality of our application</strong>. We do not use your Google user data for any other purposes including:
                  </p>
                  <ul className="list-disc list-inside text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                    <li><strong className="text-primary-700 dark:text-primary-400">NO advertising or marketing:</strong> We do not use your Google data to serve advertisements or create marketing profiles</li>
                    <li><strong className="text-primary-700 dark:text-primary-400">NO third-party sharing:</strong> We do not sell, rent, or share your Google user data with third parties for their purposes</li>
                    <li><strong className="text-primary-700 dark:text-primary-400">NO unrelated services:</strong> We do not use your Google data for services unrelated to the core functionality you've authorized</li>
                    <li><strong className="text-primary-700 dark:text-primary-400">NO AI model training:</strong> We do not use your Google user data to train AI models or for machine learning purposes beyond providing your requested service</li>
                  </ul>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                    <strong className="text-secondary-900 dark:text-white">Specific Google Scopes and Their Purpose:</strong>
                  </p>
                  <ul className="list-none text-secondary-600 dark:text-secondary-300 space-y-3">
                    <li>
                      <strong className="text-primary-700 dark:text-primary-400">• Email & Profile:</strong> To authenticate your identity and create your account
                    </li>
                    <li>
                      <strong className="text-primary-700 dark:text-primary-400">• Google Drive (File Picker - drive.file scope):</strong> To allow you to select specific files from your Google Drive and to create new documents when you explicitly request it. This limited scope only provides access to files you create through our app or select via the file picker - we cannot access your other Drive files
                    </li>
                    <li>
                      <strong className="text-primary-700 dark:text-primary-400">• Google Docs (File Creation Only):</strong> To enable you to create new cost analysis documents in Google Docs format when you request an export
                    </li>
                    <li>
                      <strong className="text-primary-700 dark:text-primary-400">• Google Sheets (File Creation Only):</strong> To allow you to create new spreadsheets for cost data analysis when you request an export
                    </li>
                  </ul>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-4">
                    You can revoke our access to your Google data at any time through your{" "}
                    <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline transition-colors">
                      Google Account Permissions
                    </a>.
                  </p>
                </div>
              </div>

              {/* Vercel OAuth Data Usage Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-secondary-500/10 via-secondary-50/50 to-primary-500/10 dark:from-secondary-500/10 dark:via-secondary-900/30 dark:to-primary-500/10 border border-secondary-400/30 dark:border-secondary-500/30 rounded-lg p-6 mt-6">
                {/* Subtle glow effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-500/5 dark:bg-secondary-500/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-500/5 dark:bg-primary-500/5 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <h3 className="text-lg font-display font-semibold gradient-text-primary mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-secondary-600 dark:text-secondary-400" viewBox="0 0 76 65" fill="currentColor">
                      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                    </svg>
                    <span>Vercel Integration Data Usage</span>
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                    When you connect your Vercel account to {APP_NAME}, we access your Vercel data <strong className="text-secondary-900 dark:text-white">solely to provide you with deployment management and DevOps optimization features</strong>. We do not use your Vercel data for any other purposes including:
                  </p>
                  <ul className="list-disc list-inside text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                    <li><strong className="text-secondary-700 dark:text-secondary-400">NO advertising or marketing:</strong> We do not use your Vercel data to serve advertisements or create marketing profiles</li>
                    <li><strong className="text-secondary-700 dark:text-secondary-400">NO third-party sharing:</strong> We do not sell, rent, or share your Vercel data with third parties for their purposes</li>
                    <li><strong className="text-secondary-700 dark:text-secondary-400">NO unrelated services:</strong> We do not use your Vercel data for services unrelated to the core functionality you've authorized</li>
                    <li><strong className="text-secondary-700 dark:text-secondary-400">NO code access:</strong> We do not access, read, or store your source code - only deployment metadata and project information</li>
                  </ul>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                    <strong className="text-secondary-900 dark:text-white">Specific Vercel Permissions and Their Purpose:</strong>
                  </p>
                  <ul className="list-none text-secondary-600 dark:text-secondary-300 space-y-3">
                    <li>
                      <strong className="text-secondary-700 dark:text-secondary-400">• User & Team (Read):</strong> To authenticate your identity and identify your Vercel team/organization
                    </li>
                    <li>
                      <strong className="text-secondary-700 dark:text-secondary-400">• Projects (Read):</strong> To list and display your Vercel projects for deployment management and cost analysis
                    </li>
                    <li>
                      <strong className="text-secondary-700 dark:text-secondary-400">• Deployments (Read/Write):</strong> To view deployment status, trigger new deployments, rollback, and promote deployments when you explicitly request it
                    </li>
                    <li>
                      <strong className="text-secondary-700 dark:text-secondary-400">• Domains (Read/Write):</strong> To view and manage custom domains associated with your projects when you request domain operations
                    </li>
                    <li>
                      <strong className="text-secondary-700 dark:text-secondary-400">• Environment Variables (Read/Write):</strong> To view and manage environment variables for your projects - values are encrypted and never logged
                    </li>
                    <li>
                      <strong className="text-secondary-700 dark:text-secondary-400">• Webhooks:</strong> To receive real-time notifications about deployment events for status updates in your dashboard
                    </li>
                  </ul>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-4">
                    You can revoke our access to your Vercel data at any time through your{" "}
                    <a href="https://vercel.com/account/integrations" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline transition-colors">
                      Vercel Account Integrations
                    </a>.
                  </p>
                </div>
              </div>

              {/* GitHub OAuth Data Usage Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-green-50/50 to-success-500/10 dark:from-green-500/10 dark:via-green-900/30 dark:to-success-500/10 border border-green-400/30 dark:border-green-500/30 rounded-lg p-6 mt-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 dark:bg-green-500/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-success-500/5 dark:bg-success-500/5 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <h3 className="text-lg font-display font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span>GitHub Integration Data Usage</span>
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                    When you connect your GitHub account to {APP_NAME}, we access your GitHub data <strong className="text-secondary-900 dark:text-white">solely to provide automated integration and repository management</strong>. We do not use your GitHub data for any other purposes including:
                  </p>
                  <ul className="list-disc list-inside text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                    <li><strong className="text-green-700 dark:text-green-400">NO advertising or marketing:</strong> We do not use your GitHub data to serve advertisements or create marketing profiles</li>
                    <li><strong className="text-green-700 dark:text-green-400">NO third-party sharing:</strong> We do not sell, rent, or share your GitHub data with third parties for their purposes</li>
                    <li><strong className="text-green-700 dark:text-green-400">NO unrelated services:</strong> We do not use your GitHub data for services unrelated to the core functionality you've authorized</li>
                    <li><strong className="text-green-700 dark:text-green-400">NO code modification without consent:</strong> We only create pull requests when you explicitly authorize integration setup</li>
                  </ul>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                    <strong className="text-secondary-900 dark:text-white">Specific GitHub Permissions and Their Purpose:</strong>
                  </p>
                  <ul className="list-none text-secondary-600 dark:text-secondary-300 space-y-3">
                    <li>
                      <strong className="text-green-700 dark:text-green-400">• Repository Access:</strong> To view your repositories and create integration pull requests when you authorize setup
                    </li>
                    <li>
                      <strong className="text-green-700 dark:text-green-400">• Repository Metadata:</strong> To display repository information and track integration status
                    </li>
                    <li>
                      <strong className="text-green-700 dark:text-green-400">• Pull Requests (Write):</strong> To create automated integration PRs for CostKatana setup in your selected repositories
                    </li>
                    <li>
                      <strong className="text-green-700 dark:text-green-400">• Webhooks:</strong> To receive notifications about repository events and keep integration status synchronized
                    </li>
                  </ul>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-4">
                    You can revoke our access to your GitHub data at any time through your{" "}
                    <a href="https://github.com/settings/installations" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 underline transition-colors">
                      GitHub Installed Apps
                    </a>.
                  </p>
                </div>
              </div>

              {/* AWS Integration Data Usage Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-orange-50/50 to-yellow-500/10 dark:from-orange-500/10 dark:via-orange-900/30 dark:to-yellow-500/10 border border-orange-400/30 dark:border-orange-500/30 rounded-lg p-6 mt-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 dark:bg-orange-500/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/5 dark:bg-yellow-500/5 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <h3 className="text-lg font-display font-semibold text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-2">
                    <img
                      src="/assets/aws-logo.svg"
                      alt="AWS"
                      className="w-5 h-5 object-contain"
                    />
                    <span>AWS Integration Data Usage</span>
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                    When you connect your AWS account to {APP_NAME}, we access your AWS resources <strong className="text-secondary-900 dark:text-white">solely to provide cost optimization and natural language cloud management</strong>. We do not use your AWS data for any other purposes including:
                  </p>
                  <ul className="list-disc list-inside text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                    <li><strong className="text-orange-700 dark:text-orange-400">NO advertising or marketing:</strong> We do not use your AWS data to serve advertisements or create marketing profiles</li>
                    <li><strong className="text-orange-700 dark:text-orange-400">NO third-party sharing:</strong> We do not sell, rent, or share your AWS infrastructure data with third parties</li>
                    <li><strong className="text-orange-700 dark:text-orange-400">NO unrelated services:</strong> We do not use your AWS data for services unrelated to cost optimization and management</li>
                    <li><strong className="text-orange-700 dark:text-orange-400">NO resource modification without explicit command:</strong> We only execute actions when you explicitly request them via natural language commands</li>
                  </ul>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                    <strong className="text-secondary-900 dark:text-white">Specific AWS Permissions and Their Purpose:</strong>
                  </p>
                  <ul className="list-none text-secondary-600 dark:text-secondary-300 space-y-3">
                    <li>
                      <strong className="text-orange-700 dark:text-orange-400">• Cost & Usage (Read):</strong> To analyze your AWS spending and provide optimization recommendations
                    </li>
                    <li>
                      <strong className="text-orange-700 dark:text-orange-400">• EC2 (Read/Write):</strong> To view and manage EC2 instances based on your natural language commands
                    </li>
                    <li>
                      <strong className="text-orange-700 dark:text-orange-400">• S3 (Read/Write):</strong> To manage S3 buckets and objects when you request it
                    </li>
                    <li>
                      <strong className="text-orange-700 dark:text-orange-400">• IAM (Read-Only):</strong> To view IAM policies and users for security analysis
                    </li>
                    <li>
                      <strong className="text-orange-700 dark:text-orange-400">• CloudWatch (Read):</strong> To access metrics and logs for cost analysis and optimization insights
                    </li>
                  </ul>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-4">
                    You can revoke our access to your AWS account at any time through your{" "}
                    <a href="https://console.aws.amazon.com/iam/home#/roles" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 underline transition-colors">
                      AWS IAM Roles
                    </a>.
                  </p>
                </div>
              </div>

              {/* MongoDB Integration Data Usage Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-green-600/10 via-green-50/50 to-emerald-500/10 dark:from-green-600/10 dark:via-green-900/30 dark:to-emerald-500/10 border border-green-500/30 dark:border-green-600/30 rounded-lg p-6 mt-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/5 dark:bg-green-600/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <h3 className="text-lg font-display font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
                      <path fillRule="evenodd" clipRule="evenodd" fill="#439934" d="M88.038 42.812c1.605 4.643 2.761 9.383 3.141 14.296.472 6.095.256 12.147-1.029 18.142-.035.165-.109.32-.164.48-.403.001-.814-.049-1.208.012-3.329.523-6.655 1.065-9.981 1.604-3.438.557-6.881 1.092-10.313 1.687-1.216.21-2.721-.041-3.212 1.641-.014.046-.154.054-.235.08l.166-10.051-.169-24.252 1.602-.275c2.62-.429 5.24-.864 7.862-1.281 3.129-.497 6.261-.98 9.392-1.465 1.381-.215 2.764-.412 4.148-.618z" />
                      <path fillRule="evenodd" clipRule="evenodd" fill="#45A538" d="M61.729 110.054c-1.69-1.453-3.439-2.842-5.059-4.37-8.717-8.222-15.093-17.899-18.233-29.566-.865-3.211-1.442-6.474-1.627-9.792-.13-2.322-.318-4.665-.154-6.975.437-6.144 1.325-12.229 3.127-18.147l.099-.138c.175.233.427.439.516.702 1.759 5.18 3.505 10.364 5.242 15.551 5.458 16.3 10.909 32.604 16.376 48.9.107.318.384.579.583.866l-.87 2.969z" />
                      <path fillRule="evenodd" clipRule="evenodd" fill="#46A037" d="M88.038 42.812c-1.384.206-2.768.403-4.149.616-3.131.485-6.263.968-9.392 1.465-2.622.417-5.242.852-7.862 1.281l-1.602.275-.012-1.045c-.053-.859-.144-1.717-.154-2.576-.069-5.478-.112-10.956-.18-16.434-.042-3.429-.105-6.857-.175-10.285-.043-2.13-.089-4.261-.185-6.388-.052-1.143-.236-2.28-.311-3.423-.042-.657.016-1.319.029-1.979.817 1.583 1.616 3.178 2.456 4.749 1.327 2.484 3.441 4.314 5.344 6.311 7.523 7.892 12.864 17.068 16.193 27.433z" />
                      <path fillRule="evenodd" clipRule="evenodd" fill="#409433" d="M65.036 80.753c.081-.026.222-.034.235-.08.491-1.682 1.996-1.431 3.212-1.641 3.432-.594 6.875-1.13 10.313-1.687 3.326-.539 6.652-1.081 9.981-1.604.394-.062.805-.011 1.208-.012-.622 2.22-1.112 4.488-1.901 6.647-.896 2.449-1.98 4.839-3.131 7.182a49.142 49.142 0 01-6.353 9.763c-1.919 2.308-4.058 4.441-6.202 6.548-1.185 1.165-2.582 2.114-3.882 3.161l-.337-.23-1.214-1.038-1.256-2.753a41.402 41.402 0 01-1.394-9.838l.023-.561.171-2.426c.057-.828.133-1.655.168-2.485.129-2.982.241-5.964.359-8.946z" />
                      <path fillRule="evenodd" clipRule="evenodd" fill="#4FAA41" d="M65.036 80.753c-.118 2.982-.23 5.964-.357 8.947-.035.83-.111 1.657-.168 2.485l-.765.289c-1.699-5.002-3.399-9.951-5.062-14.913-2.75-8.209-5.467-16.431-8.213-24.642a4498.887 4498.887 0 00-6.7-19.867c-.105-.31-.407-.552-.617-.826l4.896-9.002c.168.292.39.565.496.879a6167.476 6167.476 0 016.768 20.118c2.916 8.73 5.814 17.467 8.728 26.198.116.349.308.671.491 1.062l.67-.78-.167 10.052z" />
                      <path fillRule="evenodd" clipRule="evenodd" fill="#4AA73C" d="M43.155 32.227c.21.274.511.516.617.826a4498.887 4498.887 0 016.7 19.867c2.746 8.211 5.463 16.433 8.213 24.642 1.662 4.961 3.362 9.911 5.062 14.913l.765-.289-.171 2.426-.155.559c-.266 2.656-.49 5.318-.814 7.968-.163 1.328-.509 2.632-.772 3.947-.198-.287-.476-.548-.583-.866-5.467-16.297-10.918-32.6-16.376-48.9a3888.972 3888.972 0 00-5.242-15.551c-.089-.263-.34-.469-.516-.702l3.272-8.84z" />
                      <path fillRule="evenodd" clipRule="evenodd" fill="#57AE47" d="M65.202 70.702l-.67.78c-.183-.391-.375-.714-.491-1.062-2.913-8.731-5.812-17.468-8.728-26.198a6167.476 6167.476 0 00-6.768-20.118c-.105-.314-.327-.588-.496-.879l6.055-7.965c.191.255.463.482.562.769 1.681 4.921 3.347 9.848 5.003 14.778 1.547 4.604 3.071 9.215 4.636 13.813.105.308.47.526.714.786l.012 1.045c.058 8.082.115 16.167.171 24.251z" />
                      <path fillRule="evenodd" clipRule="evenodd" fill="#60B24F" d="M65.021 45.404c-.244-.26-.609-.478-.714-.786-1.565-4.598-3.089-9.209-4.636-13.813-1.656-4.93-3.322-9.856-5.003-14.778-.099-.287-.371-.514-.562-.769 1.969-1.928 3.877-3.925 5.925-5.764 1.821-1.634 3.285-3.386 3.352-5.968.003-.107.059-.214.145-.514l.519 1.306c-.013.661-.072 1.322-.029 1.979.075 1.143.259 2.28.311 3.423.096 2.127.142 4.258.185 6.388.069 3.428.132 6.856.175 10.285.067 5.478.111 10.956.18 16.434.008.861.098 1.718.152 2.577z" />
                    </svg>
                    <span>MongoDB Integration Data Usage</span>
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                    When you connect your MongoDB database to {APP_NAME}, we access your MongoDB data <strong className="text-secondary-900 dark:text-white">solely to provide natural language database querying</strong>. We do not use your MongoDB data for any other purposes including:
                  </p>
                  <ul className="list-disc list-inside text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                    <li><strong className="text-green-700 dark:text-green-400">NO advertising or marketing:</strong> We do not use your MongoDB data to serve advertisements or create marketing profiles</li>
                    <li><strong className="text-green-700 dark:text-green-400">NO third-party sharing:</strong> We do not sell, rent, or share your database data with third parties</li>
                    <li><strong className="text-green-700 dark:text-green-400">NO AI model training:</strong> We do not use your MongoDB data to train AI models or for machine learning beyond query translation</li>
                    <li><strong className="text-green-700 dark:text-green-400">NO data modification:</strong> We operate in read-only mode and never modify your database</li>
                  </ul>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                    <strong className="text-secondary-900 dark:text-white">Specific MongoDB Permissions and Their Purpose:</strong>
                  </p>
                  <ul className="list-none text-secondary-600 dark:text-secondary-300 space-y-3">
                    <li>
                      <strong className="text-green-700 dark:text-green-400">• Database Read:</strong> To execute queries translated from your natural language commands using @mongodb
                    </li>
                    <li>
                      <strong className="text-green-700 dark:text-green-400">• Collection Metadata:</strong> To understand your database schema for accurate query translation
                    </li>
                    <li>
                      <strong className="text-green-700 dark:text-green-400">• Index Information:</strong> To optimize query performance and provide recommendations
                    </li>
                  </ul>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-4">
                    Connection strings are encrypted at rest and in transit. You can disconnect MongoDB at any time from your integrations page.
                  </p>
                </div>
              </div>

              {/* Slack Integration Data Usage Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-600/10 via-purple-50/50 to-pink-500/10 dark:from-purple-600/10 dark:via-purple-900/30 dark:to-pink-500/10 border border-purple-500/30 dark:border-purple-600/30 rounded-lg p-6 mt-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 dark:bg-purple-600/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/5 dark:bg-pink-500/5 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <h3 className="text-lg font-display font-semibold text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                    </svg>
                    <span>Slack Integration Data Usage</span>
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                    When you connect Slack to {APP_NAME}, we only send notifications to your selected channels. We do not read or store your Slack messages.
                  </p>
                  <ul className="list-disc list-inside text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                    <li><strong className="text-purple-700 dark:text-purple-400">NO message reading:</strong> We only send messages, never read your Slack conversations</li>
                    <li><strong className="text-purple-700 dark:text-purple-400">NO third-party sharing:</strong> We do not share your Slack workspace information with third parties</li>
                    <li><strong className="text-purple-700 dark:text-purple-400">NO data collection:</strong> We only store the webhook URL or OAuth token to send notifications</li>
                  </ul>
                </div>
              </div>

              {/* Discord Integration Data Usage Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600/10 via-indigo-50/50 to-blue-500/10 dark:from-indigo-600/10 dark:via-indigo-900/30 dark:to-blue-500/10 border border-indigo-500/30 dark:border-indigo-600/30 rounded-lg p-6 mt-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 dark:bg-indigo-600/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <h3 className="text-lg font-display font-semibold text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    <span>Discord Integration Data Usage</span>
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                    When you connect Discord to {APP_NAME}, we only send notifications to your selected channels. We do not read or store your Discord messages.
                  </p>
                  <ul className="list-disc list-inside text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                    <li><strong className="text-indigo-700 dark:text-indigo-400">NO message reading:</strong> We only send messages, never read your Discord conversations</li>
                    <li><strong className="text-indigo-700 dark:text-indigo-400">NO third-party sharing:</strong> We do not share your Discord server information with third parties</li>
                    <li><strong className="text-indigo-700 dark:text-indigo-400">NO data collection:</strong> We only store the webhook URL or OAuth token to send notifications</li>
                  </ul>
                </div>
              </div>

              {/* Linear Integration Data Usage Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/10 via-blue-50/50 to-indigo-500/10 dark:from-blue-600/10 dark:via-blue-900/30 dark:to-indigo-500/10 border border-blue-500/30 dark:border-blue-600/30 rounded-lg p-6 mt-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 dark:bg-blue-600/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/5 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <h3 className="text-lg font-display font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                    <img src={linearIcon} alt="Linear" className="w-5 h-5" />
                    <span>Linear Integration Data Usage</span>
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                    When you connect Linear to {APP_NAME}, we access your Linear workspace <strong className="text-secondary-900 dark:text-white">solely to create issues and add comments</strong> when cost alerts are triggered.
                  </p>
                  <ul className="list-disc list-inside text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                    <li><strong className="text-blue-700 dark:text-blue-400">NO data collection:</strong> We do not read or store your Linear issues, comments, or project data</li>
                    <li><strong className="text-blue-700 dark:text-blue-400">NO third-party sharing:</strong> We do not share your Linear workspace information with third parties</li>
                    <li><strong className="text-blue-700 dark:text-blue-400">Write-only access:</strong> We only create issues and comments, never read existing data</li>
                  </ul>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-4">
                    You can revoke our access at any time through your{" "}
                    <a href="https://linear.app/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline transition-colors">
                      Linear API Settings
                    </a>.
                  </p>
                </div>
              </div>

              {/* JIRA Integration Data Usage Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-700/10 via-blue-50/50 to-sky-500/10 dark:from-blue-700/10 dark:via-blue-900/30 dark:to-sky-500/10 border border-blue-600/30 dark:border-blue-700/30 rounded-lg p-6 mt-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-700/5 dark:bg-blue-700/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-500/5 dark:bg-sky-500/5 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <h3 className="text-lg font-display font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                    <img src={jiraIcon} alt="JIRA" className="w-5 h-5" />
                    <span>JIRA Integration Data Usage</span>
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-3 leading-relaxed">
                    When you connect JIRA to {APP_NAME}, we access your JIRA workspace <strong className="text-secondary-900 dark:text-white">solely to create issues and add comments</strong> when cost alerts are triggered.
                  </p>
                  <ul className="list-disc list-inside text-secondary-600 dark:text-secondary-300 space-y-2 mb-4">
                    <li><strong className="text-blue-700 dark:text-blue-400">NO data collection:</strong> We do not read or store your JIRA issues, comments, or project data</li>
                    <li><strong className="text-blue-700 dark:text-blue-400">NO third-party sharing:</strong> We do not share your JIRA workspace information with third parties</li>
                    <li><strong className="text-blue-700 dark:text-blue-400">Write-only access:</strong> We only create issues and comments, never read existing data</li>
                  </ul>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-4">
                    You can revoke our access at any time through your{" "}
                    <a href="https://id.atlassian.com/manage-profile/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline transition-colors">
                      Atlassian Account Apps
                    </a>.
                  </p>
                </div>
              </div>
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
                    href={getContactLink('General Support', 'Contact Us - Privacy Policy')}
                    target="_blank"
                    rel="noopener noreferrer"
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
