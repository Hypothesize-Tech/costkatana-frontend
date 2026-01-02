import React, { useState, useCallback } from 'react';
import { XMarkIcon, CloudIcon, ShieldCheckIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { awsService, AWSConnection } from '../../services/aws.service';

interface AWSConnectorProps {
    onConnect: (connection: AWSConnection) => void;
    onClose: () => void;
}

type SetupStep = 'info' | 'role' | 'test' | 'complete';

const COSTKATANA_AWS_ACCOUNT_ID = import.meta.env.VITE_COSTKATANA_AWS_ACCOUNT_ID || '123456789012';

export const AWSConnector: React.FC<AWSConnectorProps> = ({ onConnect, onClose }) => {
    const [step, setStep] = useState<SetupStep>('info');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [connectionName, setConnectionName] = useState('');
    const [description, setDescription] = useState('');
    const [environment, setEnvironment] = useState<'production' | 'staging' | 'development'>('development');
    const [roleArn, setRoleArn] = useState('');
    const [permissionMode, setPermissionMode] = useState<'read-only' | 'read-write'>('read-only');
    const [allowedRegions, setAllowedRegions] = useState<string[]>(['us-east-1']);

    // Created connection state
    const [createdConnection, setCreatedConnection] = useState<(AWSConnection & { externalId: string }) | null>(null);
    const [testResult, setTestResult] = useState<{ success: boolean; latencyMs?: number; error?: string } | null>(null);

    const generateCloudFormationTemplate = useCallback(() => {
        const externalId = createdConnection?.externalId || 'YOUR_EXTERNAL_ID';

        return `AWSTemplateFormatVersion: '2010-09-09'
Description: CostKatana IAM Role for AWS Cost Optimization

Parameters:
  ExternalId:
    Type: String
    Default: '${externalId}'
    Description: External ID for secure cross-account access

Resources:
  CostKatanaRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: CostKatanaRole
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              AWS: arn:aws:iam::${COSTKATANA_AWS_ACCOUNT_ID}:root
            Action: sts:AssumeRole
            Condition:
              StringEquals:
                sts:ExternalId: !Ref ExternalId
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/ReadOnlyAccess
      Policies:
        - PolicyName: CostKatanaPolicy
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - ec2:StopInstances
                  - ec2:StartInstances
                  - rds:StopDBInstance
                  - rds:StartDBInstance
                  - s3:PutBucketLifecycleConfiguration
                Resource: '*'
                Condition:
                  StringEquals:
                    aws:RequestTag/ManagedBy: CostKatana
              - Effect: Deny
                Action:
                  - iam:*
                  - organizations:*
                  - account:*
                Resource: '*'

Outputs:
  RoleArn:
    Description: ARN of the CostKatana IAM Role
    Value: !GetAtt CostKatanaRole.Arn
    Export:
      Name: CostKatanaRoleArn`;
    }, [createdConnection?.externalId]);

    const handleCreateConnection = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await awsService.createConnection({
                connectionName,
                description,
                environment,
                roleArn,
                permissionMode,
                allowedRegions,
            });

            setCreatedConnection(result.connection);
            setStep('role');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create connection');
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        if (!createdConnection) return;

        setLoading(true);
        setError(null);
        setTestResult(null);

        try {
            const result = await awsService.testConnection(createdConnection.id);
            setTestResult(result);

            if (result.success) {
                setStep('complete');
                onConnect(createdConnection);
            }
        } catch (err) {
            setTestResult({ success: false, error: err instanceof Error ? err.message : 'Test failed' });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const regions = [
        'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
        'eu-west-1', 'eu-west-2', 'eu-central-1',
        'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto rounded-xl glass border border-primary-500/20 bg-gradient-dark-panel shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-primary-500/20 bg-gradient-dark-panel backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF9900] to-[#FF6600] shadow-lg">
                            <CloudIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white font-display">Connect AWS Account</h2>
                            <p className="text-sm text-secondary-400">Secure cross-account access via IAM Role</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-secondary-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between px-6 py-4 border-b border-primary-500/10">
                    {['info', 'role', 'test', 'complete'].map((s, i) => (
                        <div key={s} className="flex flex-col items-center gap-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s
                                    ? 'bg-gradient-to-r from-[#06ec9e] to-[#009454] text-white shadow-lg shadow-primary-500/30'
                                    : ['info', 'role', 'test', 'complete'].indexOf(step) > i
                                        ? 'bg-success-500 text-white'
                                        : 'bg-secondary-700 text-secondary-400'
                                    }`}
                            >
                                {['info', 'role', 'test', 'complete'].indexOf(step) > i ? '✓' : i + 1}
                            </div>
                            <span className="text-xs text-secondary-400 capitalize">{s}</span>
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-danger-500/15 border border-danger-500/30">
                            <ExclamationTriangleIcon className="w-5 h-5 text-danger-400 flex-shrink-0" />
                            <p className="text-sm text-danger-300">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Connection Info */}
                    {step === 'info' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Connection Details</h3>
                                <p className="text-sm text-secondary-400">
                                    Provide basic information about your AWS connection.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                                        Connection Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={connectionName}
                                        onChange={(e) => setConnectionName(e.target.value)}
                                        placeholder="e.g., Production AWS"
                                        className="w-full px-4 py-3 rounded-lg bg-dark-bg-200 border-2 border-primary-500/20 text-white placeholder-secondary-500 focus:border-primary-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Optional description..."
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-lg bg-dark-bg-200 border-2 border-primary-500/20 text-white placeholder-secondary-500 focus:border-primary-500 focus:outline-none transition-colors resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                                        Environment
                                    </label>
                                    <select
                                        value={environment}
                                        onChange={(e) => setEnvironment(e.target.value as 'production' | 'staging' | 'development')}
                                        className="w-full px-4 py-3 rounded-lg bg-dark-bg-200 border-2 border-primary-500/20 text-white focus:border-primary-500 focus:outline-none transition-colors"
                                    >
                                        <option value="development">Development</option>
                                        <option value="staging">Staging</option>
                                        <option value="production">Production</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                                        Permission Mode
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 p-3 rounded-lg border border-primary-500/20 cursor-pointer hover:border-primary-500/40 transition-colors">
                                            <input
                                                type="radio"
                                                name="permissionMode"
                                                checked={permissionMode === 'read-only'}
                                                onChange={() => setPermissionMode('read-only')}
                                                className="text-primary-500"
                                            />
                                            <div>
                                                <span className="text-white font-medium">Read-Only</span>
                                                <p className="text-xs text-secondary-400">View resources and costs only</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 rounded-lg border border-primary-500/20 cursor-pointer hover:border-primary-500/40 transition-colors">
                                            <input
                                                type="radio"
                                                name="permissionMode"
                                                checked={permissionMode === 'read-write'}
                                                onChange={() => setPermissionMode('read-write')}
                                                className="text-primary-500"
                                            />
                                            <div>
                                                <span className="text-white font-medium">Read-Write</span>
                                                <p className="text-xs text-secondary-400">View and optimize resources (with approval)</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                                        Allowed Regions
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {regions.map((region) => (
                                            <label key={region} className="flex items-center gap-2 text-sm text-secondary-300 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={allowedRegions.includes(region)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setAllowedRegions([...allowedRegions, region]);
                                                        } else {
                                                            setAllowedRegions(allowedRegions.filter((r) => r !== region));
                                                        }
                                                    }}
                                                    className="text-primary-500"
                                                />
                                                {region}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleCreateConnection}
                                    disabled={!connectionName || loading}
                                    className="px-6 py-3 bg-gradient-to-r from-[#06ec9e] to-[#009454] text-white font-semibold rounded-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating...' : 'Continue'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: IAM Role Setup */}
                    {step === 'role' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Create IAM Role</h3>
                                <p className="text-sm text-secondary-400">
                                    Create an IAM role in your AWS account to grant CostKatana secure access.
                                </p>
                            </div>

                            {/* External ID Info */}
                            <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/30">
                                <h4 className="text-sm font-semibold text-primary-400 mb-3 flex items-center gap-2">
                                    <ShieldCheckIcon className="w-5 h-5" />
                                    Your External ID (Keep this secure)
                                </h4>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-bg-100 border border-primary-500/20">
                                    <code className="flex-1 text-sm text-white font-mono break-all">
                                        {createdConnection?.externalId}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(createdConnection?.externalId || '')}
                                        className="px-3 py-1.5 text-xs font-semibold text-primary-400 bg-primary-500/20 border border-primary-500/30 rounded hover:bg-primary-500/30 transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-primary-400/80">
                                    This External ID prevents confused deputy attacks and is unique to your connection.
                                </p>
                            </div>

                            {/* CloudFormation Template */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-white">CloudFormation Template</h4>
                                    <button
                                        onClick={() => copyToClipboard(generateCloudFormationTemplate())}
                                        className="px-3 py-1.5 text-xs font-semibold text-primary-400 bg-primary-500/20 border border-primary-500/30 rounded hover:bg-primary-500/30 transition-colors"
                                    >
                                        Copy Template
                                    </button>
                                </div>
                                <div className="p-4 rounded-lg bg-black border border-primary-500/10 max-h-64 overflow-auto">
                                    <pre className="text-xs text-secondary-300 font-mono whitespace-pre-wrap">
                                        {generateCloudFormationTemplate()}
                                    </pre>
                                </div>
                            </div>

                            {/* Role ARN Input */}
                            <div>
                                <label className="block text-sm font-medium text-secondary-300 mb-2">
                                    Role ARN (after creating the role)
                                </label>
                                <input
                                    type="text"
                                    value={roleArn}
                                    onChange={(e) => setRoleArn(e.target.value)}
                                    placeholder="arn:aws:iam::123456789012:role/CostKatanaRole"
                                    className="w-full px-4 py-3 rounded-lg bg-dark-bg-200 border-2 border-primary-500/20 text-white placeholder-secondary-500 focus:border-primary-500 focus:outline-none transition-colors font-mono text-sm"
                                />
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep('info')}
                                    className="px-6 py-3 text-secondary-300 hover:text-white transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep('test')}
                                    disabled={!roleArn}
                                    className="px-6 py-3 bg-gradient-to-r from-[#06ec9e] to-[#009454] text-white font-semibold rounded-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue to Test
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Test Connection */}
                    {step === 'test' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Test Connection</h3>
                                <p className="text-sm text-secondary-400">
                                    Verify that CostKatana can securely access your AWS account.
                                </p>
                            </div>

                            <div className="p-6 rounded-lg bg-dark-bg-200 border border-primary-500/15 text-center">
                                <CloudIcon className="w-16 h-16 mx-auto text-primary-500 mb-4" />
                                <p className="text-secondary-300 mb-6">
                                    Click the button below to test the connection to your AWS account.
                                </p>
                                <button
                                    onClick={handleTestConnection}
                                    disabled={loading}
                                    className="px-8 py-3 bg-gradient-to-r from-[#06ec9e] to-[#009454] text-white font-semibold rounded-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Testing...' : 'Test Connection'}
                                </button>
                            </div>

                            {testResult && (
                                <div
                                    className={`p-4 rounded-lg flex items-center gap-4 ${testResult.success
                                        ? 'bg-success-500/15 border border-success-500/30'
                                        : 'bg-danger-500/15 border border-danger-500/30'
                                        }`}
                                >
                                    {testResult.success ? (
                                        <>
                                            <CheckCircleIcon className="w-8 h-8 text-success-400" />
                                            <div>
                                                <p className="font-semibold text-success-300">Connection Successful!</p>
                                                <p className="text-sm text-success-400/80">
                                                    Latency: {testResult.latencyMs}ms
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <ExclamationTriangleIcon className="w-8 h-8 text-danger-400" />
                                            <div>
                                                <p className="font-semibold text-danger-300">Connection Failed</p>
                                                <p className="text-sm text-danger-400/80">{testResult.error}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep('role')}
                                    className="px-6 py-3 text-secondary-300 hover:text-white transition-colors"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Complete */}
                    {step === 'complete' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-500/20 flex items-center justify-center">
                                <CheckCircleIcon className="w-12 h-12 text-success-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">AWS Connected!</h3>
                            <p className="text-secondary-400 mb-8">
                                Your AWS account is now connected to CostKatana. You can now use natural language to manage your AWS resources.
                            </p>
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-gradient-to-r from-[#06ec9e] to-[#009454] text-white font-semibold rounded-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all"
                            >
                                Get Started
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AWSConnector;
