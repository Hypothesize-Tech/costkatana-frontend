import React from 'react';
import { WebhookDashboard } from '../components/webhooks/WebhookDashboard';

export default function Webhooks() {
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Webhooks</h1>
                <p className="text-gray-600 mt-1">Configure webhooks to receive real-time notifications about events in your account</p>
            </div>
            <div className="mt-6">
                <WebhookDashboard />
            </div>
        </div>
    );
}
