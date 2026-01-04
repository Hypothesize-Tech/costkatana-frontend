import React, { useState, useEffect } from 'react';
import {
    XMarkIcon,
    CloudIcon,
    ServerIcon,
    CircleStackIcon,
    CpuChipIcon,
    CodeBracketIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { awsService, AWSConnection } from '../../services/aws.service';

interface AWSServicePanelProps {
    isOpen: boolean;
    onClose: () => void;
    connection: AWSConnection | null;
    onRefresh?: () => void;
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
    'ec2': <ServerIcon className="w-5 h-5" />,
    's3': <CircleStackIcon className="w-5 h-5" />,
    'rds': <CircleStackIcon className="w-5 h-5" />,
    'lambda': <CodeBracketIcon className="w-5 h-5" />,
    'dynamodb': <CircleStackIcon className="w-5 h-5" />,
    'ecs': <CpuChipIcon className="w-5 h-5" />,
    'cloudwatch': <ChartBarIcon className="w-5 h-5" />,
    'cost-explorer': <ChartBarIcon className="w-5 h-5" />,
    'ce': <ChartBarIcon className="w-5 h-5" />,
};

const SERVICE_NAMES: Record<string, string> = {
    'ec2': 'EC2 (Elastic Compute Cloud)',
    's3': 'S3 (Simple Storage Service)',
    'rds': 'RDS (Relational Database Service)',
    'lambda': 'Lambda (Serverless Functions)',
    'dynamodb': 'DynamoDB (NoSQL Database)',
    'ecs': 'ECS (Elastic Container Service)',
    'cloudwatch': 'CloudWatch (Monitoring & Logs)',
    'cost-explorer': 'Cost Explorer (Cost Analytics)',
    'ce': 'Cost Explorer (Cost Analytics)',
    'logs': 'CloudWatch Logs',
};

export const AWSServicePanel: React.FC<AWSServicePanelProps> = ({
    isOpen,
    onClose,
    connection,
    onRefresh,
}) => {
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; latencyMs?: number; error?: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            setTestResult(null);
        }
    }, [isOpen]);

    const handleTestConnection = async () => {
        if (!connection) return;

        setTesting(true);
        setTestResult(null);

        try {
            const result = await awsService.testConnection(connection.id);
            setTestResult(result);
            if (result.success && onRefresh) {
                onRefresh();
            }
        } catch (error) {
            setTestResult({
                success: false,
                error: error instanceof Error ? error.message : 'Test failed',
            });
        } finally {
            setTesting(false);
        }
    };

    if (!isOpen || !connection) return null;

    // Extract AWS Account ID from Role ARN
    const awsAccountId = connection.roleArn.match(/arn:aws:iam::(\d+):role/)?.[1] || 'Unknown';

    // Get unique services from allowedServices
    const services = connection.allowedServices || [];

    // Count total permissions
    const totalPermissions = services.reduce((sum, s) => sum + (s.actions?.length || 0), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto rounded-xl glass border border-primary-500/20 bg-gradient-dark-panel shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-primary-500/20 bg-gradient-dark-panel backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9900] to-[#FF6600] shadow-lg">
                            <CloudIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white font-display">{connection.connectionName}</h2>
                            <p className="text-sm text-secondary-400">AWS Account: {awsAccountId}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-secondary-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Connection Status */}
                    <div className="p-4 rounded-xl bg-dark-bg-200 border border-primary-500/15">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Connection Status</h3>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1.5 ${connection.status === 'active'
                                    ? 'bg-success-500/20 text-success-400 border border-success-500/30'
                                    : 'bg-danger-500/20 text-danger-400 border border-danger-500/30'
                                    }`}>
                                    {connection.status === 'active' ? (
                                        <CheckCircleIcon className="w-4 h-4" />
                                    ) : (
                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                    )}
                                    {connection.status === 'active' ? 'Active' : 'Error'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-black/30 border border-primary-500/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <GlobeAltIcon className="w-4 h-4 text-secondary-400" />
                                    <span className="text-xs text-secondary-400 uppercase tracking-wide">Environment</span>
                                </div>
                                <p className="text-white font-medium capitalize">{connection.environment}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-black/30 border border-primary-500/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <ShieldCheckIcon className="w-4 h-4 text-secondary-400" />
                                    <span className="text-xs text-secondary-400 uppercase tracking-wide">Permission Mode</span>
                                </div>
                                <p className="text-white font-medium">
                                    {connection.permissionMode === 'read-only' ? 'Read-Only' : 'Read-Write'}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-black/30 border border-primary-500/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <ClockIcon className="w-4 h-4 text-secondary-400" />
                                    <span className="text-xs text-secondary-400 uppercase tracking-wide">Last Checked</span>
                                </div>
                                <p className="text-white font-medium">
                                    {connection.health?.lastChecked
                                        ? new Date(connection.health.lastChecked).toLocaleString()
                                        : 'Never'}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-black/30 border border-primary-500/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <ChartBarIcon className="w-4 h-4 text-secondary-400" />
                                    <span className="text-xs text-secondary-400 uppercase tracking-wide">Total Executions</span>
                                </div>
                                <p className="text-white font-medium">{connection.totalExecutions || 0}</p>
                            </div>
                        </div>

                        {/* Test Connection Button */}
                        <div className="mt-4 pt-4 border-t border-primary-500/10">
                            <button
                                onClick={handleTestConnection}
                                disabled={testing}
                                className="w-full px-4 py-2.5 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-lg hover:bg-primary-500/30 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                            >
                                <ArrowPathIcon className={`w-5 h-5 ${testing ? 'animate-spin' : ''}`} />
                                {testing ? 'Testing Connection...' : 'Test Connection'}
                            </button>
                            {testResult && (
                                <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${testResult.success
                                    ? 'bg-success-500/15 border border-success-500/30 text-success-400'
                                    : 'bg-danger-500/15 border border-danger-500/30 text-danger-400'
                                    }`}>
                                    {testResult.success ? (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                                            <span>Connection successful! Latency: {testResult.latencyMs}ms</span>
                                        </>
                                    ) : (
                                        <>
                                            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                                            <span>{testResult.error}</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Enabled Services */}
                    <div className="p-4 rounded-xl bg-dark-bg-200 border border-primary-500/15">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Enabled Services</h3>
                            <span className="px-2.5 py-1 text-xs font-medium bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-full">
                                {services.length} Services • {totalPermissions} Permissions
                            </span>
                        </div>

                        <div className="space-y-3">
                            {services.map((service, index) => (
                                <div
                                    key={index}
                                    className="p-3 rounded-lg bg-black/30 border border-primary-500/10"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-[#FF9900]/20 text-[#FF9900] flex items-center justify-center">
                                            {SERVICE_ICONS[service.service] || <CloudIcon className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">
                                                {SERVICE_NAMES[service.service] || service.service.toUpperCase()}
                                            </p>
                                            <p className="text-xs text-secondary-400">
                                                {service.actions?.length || 0} permissions granted
                                            </p>
                                        </div>
                                    </div>
                                    {/* Show actions */}
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {service.actions?.slice(0, 5).map((action, actionIndex) => (
                                            <span
                                                key={actionIndex}
                                                className="px-2 py-0.5 text-xs bg-secondary-800/50 text-secondary-300 border border-secondary-700/50 rounded font-mono"
                                            >
                                                {action}
                                            </span>
                                        ))}
                                        {(service.actions?.length || 0) > 5 && (
                                            <span className="px-2 py-0.5 text-xs bg-secondary-800/50 text-secondary-400 border border-secondary-700/50 rounded">
                                                +{(service.actions?.length || 0) - 5} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {services.length === 0 && (
                                <div className="p-6 text-center text-secondary-400">
                                    <CloudIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No services configured</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Allowed Regions */}
                    <div className="p-4 rounded-xl bg-dark-bg-200 border border-primary-500/15">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Allowed Regions</h3>
                            <span className="px-2.5 py-1 text-xs font-medium bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-full">
                                {connection.allowedRegions?.length || 0} Regions
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {connection.allowedRegions?.map((region, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1.5 text-sm bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/30 rounded-lg flex items-center gap-1.5"
                                >
                                    <GlobeAltIcon className="w-4 h-4" />
                                    {region}
                                </span>
                            ))}
                            {(!connection.allowedRegions || connection.allowedRegions.length === 0) && (
                                <p className="text-secondary-400 text-sm">All regions allowed</p>
                            )}
                        </div>
                    </div>

                    {/* Role ARN */}
                    <div className="p-4 rounded-xl bg-dark-bg-200 border border-primary-500/15">
                        <h3 className="text-lg font-semibold text-white mb-3">IAM Role ARN</h3>
                        <div className="p-3 rounded-lg bg-black/50 border border-primary-500/10 font-mono text-sm text-secondary-300 break-all">
                            {connection.roleArn}
                        </div>
                    </div>

                    {/* Usage Instructions */}
                    <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/30">
                        <h3 className="text-lg font-semibold text-primary-400 mb-3">How to Use</h3>
                        <p className="text-sm text-primary-400/80 mb-3">
                            Use natural language commands in the dashboard chat to interact with your AWS resources:
                        </p>
                        <div className="space-y-2">
                            <div className="p-2 rounded-lg bg-black/30 text-sm text-secondary-300">
                                <span className="text-primary-400">@aws</span> Show my EC2 instances and their costs
                            </div>
                            <div className="p-2 rounded-lg bg-black/30 text-sm text-secondary-300">
                                <span className="text-primary-400">@aws</span> What are my top spending services this month?
                            </div>
                            <div className="p-2 rounded-lg bg-black/30 text-sm text-secondary-300">
                                <span className="text-primary-400">@aws</span> List all S3 buckets and their storage costs
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-primary-500/20 bg-gradient-dark-panel backdrop-blur-xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-secondary-300 hover:text-white transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AWSServicePanel;
