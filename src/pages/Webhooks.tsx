import { WebhookDashboard } from '../components/webhooks/WebhookDashboard';

export default function Webhooks() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-8 mb-8">
                    <h1 className="text-4xl font-display font-bold gradient-text-primary mb-4">Webhooks</h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">Configure webhooks to receive real-time notifications about events in your account</p>
                </div>
                <div className="mt-6">
                    <WebhookDashboard />
                </div>
            </div>
        </div>
    );
}
