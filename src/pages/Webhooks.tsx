import { WebhookDashboard } from '../components/webhooks/WebhookDashboard';

export default function Webhooks() {
    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
            <div className="max-w-7xl mx-auto">
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 mb-8">
                    <h1 className="text-4xl font-display font-bold gradient-text-primary mb-4">Webhooks</h1>
                    <p className="text-secondary-600 dark:text-secondary-300">Configure webhooks to receive real-time notifications about events in your account</p>
                </div>
                <div className="mt-6">
                    <WebhookDashboard />
                </div>
            </div>
        </div>
    );
}
