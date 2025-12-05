import { WebhookDashboard } from '../components/webhooks/WebhookDashboard';

export default function Webhooks() {
    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-2 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold gradient-text-primary mb-2 sm:mb-3 md:mb-4">Webhooks</h1>
                    <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-300">Configure webhooks to receive real-time notifications about events in your account</p>
                </div>
                <div className="mt-4 sm:mt-5 md:mt-6">
                    <WebhookDashboard />
                </div>
            </div>
        </div>
    );
}
