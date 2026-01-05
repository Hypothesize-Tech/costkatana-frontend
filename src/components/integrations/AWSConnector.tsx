import React, { useState, useCallback, useMemo } from 'react';
import { XMarkIcon, CloudIcon, ShieldCheckIcon, CheckCircleIcon, ExclamationTriangleIcon, ClipboardDocumentIcon, ArrowTopRightOnSquareIcon, InformationCircleIcon, DocumentTextIcon, ServerIcon, CircleStackIcon, CpuChipIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { awsService, AWSConnection } from '../../services/aws.service';

interface AWSConnectorProps {
    onConnect: (connection: AWSConnection) => void;
    onClose: () => void;
}

type SetupStep = 'services' | 'guide' | 'details' | 'test' | 'complete';

const COSTKATANA_AWS_ACCOUNT_ID = import.meta.env.VITE_COSTKATANA_AWS_ACCOUNT_ID || '590183935586';

interface AWSService {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    readOnlyActions: string[];
    readWriteActions: string[];
    category: 'compute' | 'storage' | 'database' | 'analytics' | 'monitoring';
}

const AWS_SERVICES: AWSService[] = [
    {
        id: 'ec2',
        name: 'EC2',
        description: 'Virtual servers - Create/start/stop instances, resize, view costs',
        icon: <ServerIcon className="w-5 h-5" />,
        category: 'compute',
        readOnlyActions: [
            'ec2:Describe*',
            'ec2:Get*',
            'ec2:List*',
        ],
        readWriteActions: [
            'ec2:RunInstances',
            'ec2:StartInstances',
            'ec2:StopInstances',
            'ec2:RebootInstances',
            'ec2:ModifyInstanceAttribute',
            'ec2:ModifyInstancePlacement',
            'ec2:CreateKeyPair',
            'ec2:ImportKeyPair',
            'ec2:CreateVpc',
            'ec2:CreateSubnet',
            'ec2:CreateSecurityGroup',
            'ec2:AuthorizeSecurityGroupIngress',
            'ec2:AuthorizeSecurityGroupEgress',
        ],
    },
    {
        id: 's3',
        name: 'S3',
        description: 'Object storage - Create buckets, lifecycle policies, storage class transitions',
        icon: <CircleStackIcon className="w-5 h-5" />,
        category: 'storage',
        readOnlyActions: [
            's3:List*',
            's3:Get*',
        ],
        readWriteActions: [
            's3:CreateBucket',
            's3:DeleteBucket',
            's3:PutBucketLifecycleConfiguration',
            's3:PutIntelligentTieringConfiguration',
            's3:PutBucketTagging',
            's3:PutBucketVersioning',
            's3:PutBucketEncryption',
            's3:PutBucketPublicAccessBlock',
        ],
    },
    {
        id: 'rds',
        name: 'RDS',
        description: 'Managed databases - Create/start/stop instances, modify, backups',
        icon: <CircleStackIcon className="w-5 h-5" />,
        category: 'database',
        readOnlyActions: [
            'rds:Describe*',
            'rds:List*',
        ],
        readWriteActions: [
            'rds:CreateDBInstance',
            'rds:StartDBInstance',
            'rds:StopDBInstance',
            'rds:ModifyDBInstance',
            'rds:AddTagsToResource',
            'rds:CreateDBSubnetGroup',
        ],
    },
    {
        id: 'lambda',
        name: 'Lambda',
        description: 'Serverless functions - Create functions, optimize memory, concurrency, timeout',
        icon: <CodeBracketIcon className="w-5 h-5" />,
        category: 'compute',
        readOnlyActions: [
            'lambda:List*',
            'lambda:Get*',
        ],
        readWriteActions: [
            'lambda:CreateFunction',
            'lambda:UpdateFunctionConfiguration',
            'lambda:UpdateFunctionCode',
            'lambda:PutFunctionConcurrency',
            'lambda:TagResource',
        ],
    },
    {
        id: 'dynamodb',
        name: 'DynamoDB',
        description: 'NoSQL database - Create tables, optimize capacity, enable auto-scaling',
        icon: <CircleStackIcon className="w-5 h-5" />,
        category: 'database',
        readOnlyActions: [
            'dynamodb:Describe*',
            'dynamodb:List*',
        ],
        readWriteActions: [
            'dynamodb:CreateTable',
            'dynamodb:UpdateTable',
            'dynamodb:UpdateContinuousBackups',
            'dynamodb:TagResource',
        ],
    },
    {
        id: 'ecs',
        name: 'ECS',
        description: 'Container orchestration - Create clusters, optimize task definitions, scaling',
        icon: <CpuChipIcon className="w-5 h-5" />,
        category: 'compute',
        readOnlyActions: [
            'ecs:Describe*',
            'ecs:List*',
        ],
        readWriteActions: [
            'ecs:CreateCluster',
            'ecs:UpdateService',
            'ecs:RegisterTaskDefinition',
            'ecs:TagResource',
        ],
    },
    {
        id: 'cloudwatch',
        name: 'CloudWatch',
        description: 'Monitoring & logs - View metrics, logs, set up alarms',
        icon: <CpuChipIcon className="w-5 h-5" />,
        category: 'monitoring',
        readOnlyActions: [
            'cloudwatch:Describe*',
            'cloudwatch:Get*',
            'cloudwatch:List*',
            'logs:Describe*',
            'logs:Get*',
            'logs:FilterLogEvents',
        ],
        readWriteActions: [
            'cloudwatch:PutMetricAlarm',
            'logs:CreateLogGroup',
            'logs:PutRetentionPolicy',
        ],
    },
    {
        id: 'ce',
        name: 'Cost Explorer',
        description: 'Cost analytics - View detailed cost and usage reports, forecasts, anomalies',
        icon: <CircleStackIcon className="w-5 h-5" />,
        category: 'analytics',
        readOnlyActions: [
            'ce:GetCostAndUsage',
            'ce:GetCostForecast',
            'ce:GetAnomalies',
            'ce:GetAnomalyMonitors',
            'ce:GetAnomalySubscriptions',
            'ce:GetReservationUtilization',
            'ce:GetSavingsPlansUtilization',
            'ce:GetRightsizingRecommendation',
            'ce:GetDimensionValues',
            'ce:GetTags',
            'ce:DescribeCostCategoryDefinition',
            'ce:ListCostCategoryDefinitions',
        ],
        readWriteActions: [],
    },
    {
        id: 'savingsplans',
        name: 'Savings Plans',
        description: 'Reserved capacity - View savings plans and recommendations',
        icon: <CircleStackIcon className="w-5 h-5" />,
        category: 'analytics',
        readOnlyActions: [
            'savingsplans:Describe*',
            'savingsplans:List*',
        ],
        readWriteActions: [],
    },
];

export const AWSConnector: React.FC<AWSConnectorProps> = ({ onConnect, onClose }) => {
    const [step, setStep] = useState<SetupStep>('services');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedItem, setCopiedItem] = useState<string | null>(null);

    // Service selection with individual permissions - Default to all core services for cost optimization
    const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({
        'ec2': [...AWS_SERVICES.find(s => s.id === 'ec2')!.readOnlyActions],
        's3': [...AWS_SERVICES.find(s => s.id === 's3')!.readOnlyActions],
        'rds': [...AWS_SERVICES.find(s => s.id === 'rds')!.readOnlyActions],
        'lambda': [...AWS_SERVICES.find(s => s.id === 'lambda')!.readOnlyActions],
        'ce': [...AWS_SERVICES.find(s => s.id === 'ce')!.readOnlyActions],
        'cloudwatch': [...AWS_SERVICES.find(s => s.id === 'cloudwatch')!.readOnlyActions],
        'savingsplans': [...AWS_SERVICES.find(s => s.id === 'savingsplans')!.readOnlyActions],
    });
    const [expandedServices, setExpandedServices] = useState<string[]>([]);
    const [fullAccessServices, setFullAccessServices] = useState<Set<string>>(new Set());

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

    // Generate a unique external ID for the user
    const generatedExternalId = useMemo(() => {
        return `costkatana-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }, []);

    // Get list of selected services (services with at least one permission)
    const selectedServices = useMemo(() => {
        return Object.keys(selectedPermissions).filter(serviceId =>
            selectedPermissions[serviceId] && selectedPermissions[serviceId].length > 0
        );
    }, [selectedPermissions]);

    const toggleService = (serviceId: string) => {
        if (selectedPermissions[serviceId] && selectedPermissions[serviceId].length > 0) {
            // Deselect all permissions for this service
            setSelectedPermissions(prev => ({
                ...prev,
                [serviceId]: []
            }));
            // Also remove from full access if it was enabled
            setFullAccessServices(prev => {
                const newSet = new Set(prev);
                newSet.delete(serviceId);
                return newSet;
            });
        } else {
            // Select all read-only permissions by default
            const service = AWS_SERVICES.find(s => s.id === serviceId);
            if (service) {
                setSelectedPermissions(prev => ({
                    ...prev,
                    [serviceId]: [...service.readOnlyActions]
                }));
            }
        }
    };

    const togglePermission = (serviceId: string, permission: string) => {
        // Don't allow toggling individual permissions when full access is enabled
        if (fullAccessServices.has(serviceId)) {
            return;
        }

        setSelectedPermissions(prev => {
            const currentPerms = prev[serviceId] || [];
            if (currentPerms.includes(permission)) {
                return {
                    ...prev,
                    [serviceId]: currentPerms.filter(p => p !== permission)
                };
            } else {
                return {
                    ...prev,
                    [serviceId]: [...currentPerms, permission]
                };
            }
        });
    };

    const toggleServiceExpansion = (serviceId: string) => {
        if (expandedServices.includes(serviceId)) {
            setExpandedServices(expandedServices.filter(id => id !== serviceId));
        } else {
            setExpandedServices([...expandedServices, serviceId]);
        }
    };

    const selectAllPermissions = (serviceId: string) => {
        // If full access is enabled, this is a no-op (already has all permissions)
        if (fullAccessServices.has(serviceId)) {
            return;
        }

        const service = AWS_SERVICES.find(s => s.id === serviceId);
        if (service) {
            const allPerms = permissionMode === 'read-only'
                ? service.readOnlyActions
                : [...service.readOnlyActions, ...service.readWriteActions];
            setSelectedPermissions(prev => ({
                ...prev,
                [serviceId]: allPerms
            }));
        }
    };

    const deselectAllPermissions = (serviceId: string) => {
        setSelectedPermissions(prev => ({
            ...prev,
            [serviceId]: []
        }));
    };

    const toggleFullAccess = (serviceId: string) => {
        const service = AWS_SERVICES.find(s => s.id === serviceId);
        if (!service) return;

        setFullAccessServices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(serviceId)) {
                // Disabling full access - revert to read-only permissions by default
                newSet.delete(serviceId);
                setSelectedPermissions(prevPerms => ({
                    ...prevPerms,
                    [serviceId]: [...service.readOnlyActions]
                }));
            } else {
                // Enabling full access - use wildcard permission for complete access
                // This includes create, update, delete, and all other operations
                // Backend permission boundary will still block banned actions
                newSet.add(serviceId);
                // Use wildcard permission: service:*
                setSelectedPermissions(prevPerms => ({
                    ...prevPerms,
                    [serviceId]: [`${serviceId}:*`]
                }));
                // Automatically switch to read-write mode when full access is enabled
                // Full access includes write permissions, so mode should reflect that
                setPermissionMode('read-write');
            }
            return newSet;
        });
    };

    const toggleAllServices = () => {
        if (selectedServices.length === AWS_SERVICES.length) {
            setSelectedPermissions({ 'cost-explorer': [...AWS_SERVICES.find(s => s.id === 'cost-explorer')!.readOnlyActions] });
        } else {
            const allPerms: Record<string, string[]> = {};
            AWS_SERVICES.forEach(service => {
                allPerms[service.id] = [...service.readOnlyActions];
            });
            setSelectedPermissions(allPerms);
        }
    };

    const generateCloudFormationTemplate = useCallback((mode: 'read-only' | 'read-write', permissions: Record<string, string[]>) => {
        // Separate full access services from individual permissions
        const fullAccessServiceIds = Object.keys(permissions).filter(serviceId =>
            fullAccessServices.has(serviceId) && permissions[serviceId].length > 0
        );

        // Collect individual permissions (non-full-access services)
        const individualActions: string[] = [];
        Object.entries(permissions).forEach(([serviceId, perms]) => {
            // Skip full access services - they'll use wildcards
            if (fullAccessServices.has(serviceId)) {
                return;
            }
            // Ensure each action has the correct service prefix
            const prefixedActions = perms.map(action =>
                action.includes(':') ? action : `${serviceId}:${action}`
            );
            individualActions.push(...prefixedActions);
        });

        // Remove duplicates from individual actions
        const uniqueIndividualActions = [...new Set(individualActions)];

        // Build full access wildcards (most efficient - single wildcard per service)
        const fullAccessWildcards = fullAccessServiceIds.map(serviceId => `${serviceId}:*`);

        // Combine all actions into single array (more compact)
        const allActions = [...fullAccessWildcards, ...uniqueIndividualActions];

        // Build compact action list (YAML format, minimal spacing)
        const actionsList = allActions.length > 0
            ? allActions.map(a => `- ${a}`).join('\n                  ')
            : '[]';

        // Ultra-compact template to minimize policy size
        // Note: No tag condition to allow service-level operations like s3:ListAllMyBuckets
        return `AWSTemplateFormatVersion: '2010-09-09'
Description: CostKatana IAM Role
Resources:
  CostKatanaRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: CostKatanaRole-${Date.now().toString().slice(-6)}
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              AWS: arn:aws:iam::${COSTKATANA_AWS_ACCOUNT_ID}:root
            Action: sts:AssumeRole
            Condition:
              StringEquals:
                sts:ExternalId: '${generatedExternalId}'
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/AWSBillingReadOnlyAccess
      Policies:
        - PolicyName: CKPolicy
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  ${actionsList}
                Resource: '*'
              - Effect: Deny
                Action:
                  - iam:*User*
                  - iam:*Group*
                  - iam:*Password*
                  - iam:*AccessKey*
                  - iam:*MFA*
                  - iam:DeleteRole*
                  - iam:PutRolePolicy
                  - organizations:*
                  - account:*
                Resource: '*'
Outputs:
          RoleArn:
            Value: !GetAtt CostKatanaRole.Arn
          ExternalId:
            Value: '${generatedExternalId}'`;
    }, [generatedExternalId, fullAccessServices]);

    const handleCreateConnection = async () => {
        if (!connectionName || !roleArn) {
            setError('Connection name and Role ARN are required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // If we already have a created connection and the user is just navigating back and forth,
            // check if the details are the same
            if (createdConnection) {
                // If the connection details are the same, just move to test step
                if (createdConnection.connectionName === connectionName &&
                    createdConnection.roleArn === roleArn &&
                    createdConnection.environment === environment &&
                    createdConnection.description === description) {
                    setStep('test');
                    return;
                }
                // If details changed, we need to create a new connection
                // Clear the old one first
                setCreatedConnection(null);
            }

            const result = await awsService.createConnection({
                connectionName,
                description,
                environment,
                roleArn,
                permissionMode,
                allowedRegions,
                externalId: generatedExternalId, // Pass the external ID we generated for the CloudFormation template
                selectedPermissions, // Pass the granular permissions
            });

            setCreatedConnection(result.connection);
            setStep('test');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create connection';

            // If the error is about duplicate connection, try to fetch the existing one
            if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
                try {
                    // Get all connections and find the matching one
                    const connectionsResult = await awsService.listConnections();
                    const existingConnection = connectionsResult.connections.find(
                        conn => conn.connectionName === connectionName && conn.roleArn === roleArn
                    );

                    if (existingConnection) {
                        setCreatedConnection({
                            ...existingConnection,
                            externalId: generatedExternalId
                        });
                        setStep('test');
                        setError(null);
                        return;
                    }
                } catch (fetchError) {
                    // If we can't fetch connections, show the original error
                    setError(errorMessage);
                }
            } else {
                setError(errorMessage);
            }
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
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Test failed';
            setTestResult({ success: false, error: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text: string, itemName: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedItem(itemName);
        setTimeout(() => setCopiedItem(null), 2000);
    };

    const downloadTemplate = () => {
        const template = generateCloudFormationTemplate(permissionMode, selectedPermissions);
        const blob = new Blob([template], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'costkatana-iam-role.yaml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const regions = [
        'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
        'eu-west-1', 'eu-west-2', 'eu-central-1',
        'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
    ];

    const stepLabels = ['Select Services', 'Setup Guide', 'Connection Details', 'Test', 'Complete'];
    const stepKeys: SetupStep[] = ['services', 'guide', 'details', 'test', 'complete'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-auto rounded-xl glass border border-primary-500/20 bg-gradient-dark-panel shadow-2xl">
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
                    {stepKeys.map((s, i) => (
                        <div key={s} className="flex flex-col items-center gap-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s
                                    ? 'bg-gradient-to-r from-[#06ec9e] to-[#009454] text-white shadow-lg shadow-primary-500/30'
                                    : stepKeys.indexOf(step) > i
                                        ? 'bg-success-500 text-white'
                                        : 'bg-secondary-700 text-secondary-400'
                                    }`}
                            >
                                {stepKeys.indexOf(step) > i ? '✓' : i + 1}
                            </div>
                            <span className="text-xs text-secondary-400">{stepLabels[i]}</span>
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

                    {/* Step 1: Service Selection */}
                    {step === 'services' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Select AWS Services</h3>
                                <p className="text-sm text-secondary-400">
                                    Choose which AWS services you want CostKatana to access. We'll create a custom IAM policy with only the required permissions.
                                </p>
                            </div>

                            {/* Quick Selection */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-dark-bg-200 border border-primary-500/15">
                                <div>
                                    <span className="text-white font-medium">
                                        {selectedServices.length} of {AWS_SERVICES.length} services selected
                                    </span>
                                    <p className="text-xs text-secondary-400 mt-1">
                                        {Object.entries(selectedPermissions).reduce((sum, [serviceId, perms]) => {
                                            // If full access is enabled, count all available permissions for that service
                                            if (fullAccessServices.has(serviceId)) {
                                                const service = AWS_SERVICES.find(s => s.id === serviceId);
                                                if (service) {
                                                    return sum + service.readOnlyActions.length + service.readWriteActions.length;
                                                }
                                            }
                                            return sum + perms.length;
                                        }, 0)} total permissions granted
                                        {fullAccessServices.size > 0 && (
                                            <span className="text-[#FF9900] ml-2">
                                                ({fullAccessServices.size} service{fullAccessServices.size !== 1 ? 's' : ''} with full access)
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <button
                                    onClick={toggleAllServices}
                                    className="px-4 py-2 text-sm font-medium text-primary-400 bg-primary-500/10 border border-primary-500/30 rounded-lg hover:bg-primary-500/20 transition-colors"
                                >
                                    {selectedServices.length === AWS_SERVICES.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            {/* Services by Category */}
                            {['compute', 'storage', 'database', 'analytics', 'monitoring'].map(category => {
                                const categoryServices = AWS_SERVICES.filter(s => s.category === category);
                                if (categoryServices.length === 0) return null;

                                return (
                                    <div key={category} className="space-y-2">
                                        <h4 className="text-sm font-semibold text-secondary-300 uppercase tracking-wide">
                                            {category}
                                        </h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {categoryServices.map(service => {
                                                const servicePermissions = selectedPermissions[service.id] || [];
                                                const isSelected = servicePermissions.length > 0;
                                                const isExpanded = expandedServices.includes(service.id);
                                                const availablePerms = permissionMode === 'read-only'
                                                    ? service.readOnlyActions
                                                    : [...service.readOnlyActions, ...service.readWriteActions];

                                                return (
                                                    <div
                                                        key={service.id}
                                                        className={`rounded-lg border-2 transition-all ${isSelected
                                                            ? 'border-primary-500 bg-primary-500/5'
                                                            : 'border-primary-500/20 bg-dark-bg-200'
                                                            }`}
                                                    >
                                                        {/* Service Header */}
                                                        <div className="p-4">
                                                            <div className="flex items-start gap-3">
                                                                <div
                                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isSelected
                                                                        ? 'bg-primary-500/20 text-primary-400'
                                                                        : 'bg-secondary-700 text-secondary-400'
                                                                        }`}
                                                                >
                                                                    {service.icon}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-white font-semibold">{service.name}</span>
                                                                        <div className="flex items-center gap-2">
                                                                            {isSelected && (
                                                                                <span className="text-xs text-primary-400">
                                                                                    {fullAccessServices.has(service.id) ? (
                                                                                        <span className="text-[#FF9900] font-semibold">Full Access</span>
                                                                                    ) : (
                                                                                        `${servicePermissions.length}/${availablePerms.length}`
                                                                                    )}
                                                                                </span>
                                                                            )}
                                                                            <button
                                                                                onClick={() => toggleService(service.id)}
                                                                                className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${isSelected
                                                                                    ? 'border-primary-500 bg-primary-500'
                                                                                    : 'border-secondary-500'
                                                                                    }`}
                                                                            >
                                                                                {isSelected && '✓'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm text-secondary-400 mb-2">{service.description}</p>

                                                                    {/* Expand/Collapse Button */}
                                                                    <button
                                                                        onClick={() => toggleServiceExpansion(service.id)}
                                                                        className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                                                                    >
                                                                        <span>{isExpanded ? '▼' : '►'}</span>
                                                                        <span>{isExpanded ? 'Hide' : 'Show'} permissions ({availablePerms.length})</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Expanded Permissions */}
                                                        {isExpanded && (
                                                            <div className="border-t border-primary-500/10 p-4 bg-black/20">
                                                                {/* Full Access Checkbox */}
                                                                <div className="mb-4 p-3 rounded-lg bg-[#FF9900]/10 border border-[#FF9900]/30">
                                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                                        <div className="relative flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={fullAccessServices.has(service.id)}
                                                                                onChange={() => toggleFullAccess(service.id)}
                                                                                className="sr-only"
                                                                            />
                                                                            <div
                                                                                className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-300 ${fullAccessServices.has(service.id)
                                                                                    ? 'border-[#FF9900] bg-[#FF9900] shadow-lg shadow-[#FF9900]/30'
                                                                                    : 'border-secondary-500 bg-dark-bg-200 hover:border-[#FF9900]/50 hover:bg-[#FF9900]/5'
                                                                                    }`}
                                                                            >
                                                                                {fullAccessServices.has(service.id) && (
                                                                                    <CheckCircleIcon className="w-4 h-4 text-white" />
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm font-semibold text-[#FF9900]">
                                                                                    Full Access to {service.name}
                                                                                </span>
                                                                                <span className="px-2 py-0.5 text-xs bg-[#FF9900]/20 text-[#FF9900] border border-[#FF9900]/30 rounded">
                                                                                    Master Switch
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-xs text-secondary-400 mt-1">
                                                                                Enable full access to {service.name} including create, update, delete, and all operations. Individual permissions will be disabled. Backend security boundaries still apply.
                                                                            </p>
                                                                        </div>
                                                                    </label>
                                                                </div>

                                                                <div className="flex items-center justify-between mb-3">
                                                                    <span className="text-xs font-semibold text-secondary-300 uppercase">
                                                                        Individual Permissions
                                                                    </span>
                                                                    {!fullAccessServices.has(service.id) && (
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => selectAllPermissions(service.id)}
                                                                                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                                                                            >
                                                                                Select All
                                                                            </button>
                                                                            <span className="text-secondary-600">|</span>
                                                                            <button
                                                                                onClick={() => deselectAllPermissions(service.id)}
                                                                                className="text-xs text-secondary-400 hover:text-secondary-300 transition-colors"
                                                                            >
                                                                                Deselect All
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Permission List */}
                                                                <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                                                                    <div className="text-xs font-semibold text-primary-400 uppercase mb-2">Read Permissions</div>
                                                                    {service.readOnlyActions.map(permission => {
                                                                        const isFullAccess = fullAccessServices.has(service.id);
                                                                        // If full access is enabled, all permissions are considered checked (via wildcard)
                                                                        const isChecked = isFullAccess || servicePermissions.includes(permission);
                                                                        return (
                                                                            <label
                                                                                key={permission}
                                                                                className={`flex items-center gap-2 p-2 rounded transition-colors group ${isFullAccess
                                                                                    ? 'opacity-50 cursor-not-allowed'
                                                                                    : 'hover:bg-white/5 cursor-pointer'
                                                                                    }`}
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isChecked}
                                                                                    onChange={() => togglePermission(service.id, permission)}
                                                                                    disabled={isFullAccess}
                                                                                    className={`w-4 h-4 text-primary-500 rounded border-secondary-500 ${isFullAccess ? 'cursor-not-allowed' : ''}`}
                                                                                />
                                                                                <div className="flex-1 flex items-center justify-between">
                                                                                    <code className={`text-xs font-mono transition-colors ${isFullAccess
                                                                                        ? 'text-secondary-500'
                                                                                        : 'text-secondary-300 group-hover:text-white'
                                                                                        }`}>{permission}</code>
                                                                                    <span className="px-2 py-0.5 text-xs bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded">
                                                                                        Read
                                                                                    </span>
                                                                                </div>
                                                                            </label>
                                                                        );
                                                                    })}
                                                                    {permissionMode === 'read-write' && service.readWriteActions.length > 0 && (
                                                                        <>
                                                                            <div className="my-3 border-t border-secondary-700 pt-2">
                                                                                <span className="text-xs font-semibold text-[#FF9900] uppercase">Write Permissions</span>
                                                                            </div>
                                                                            {service.readWriteActions.map(permission => {
                                                                                const isFullAccess = fullAccessServices.has(service.id);
                                                                                // If full access is enabled, all permissions are considered checked (via wildcard)
                                                                                const isChecked = isFullAccess || servicePermissions.includes(permission);
                                                                                return (
                                                                                    <label
                                                                                        key={permission}
                                                                                        className={`flex items-center gap-2 p-2 rounded transition-colors group ${isFullAccess
                                                                                            ? 'opacity-50 cursor-not-allowed'
                                                                                            : 'hover:bg-white/5 cursor-pointer'
                                                                                            }`}
                                                                                    >
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={isChecked}
                                                                                            onChange={() => togglePermission(service.id, permission)}
                                                                                            disabled={isFullAccess}
                                                                                            className={`w-4 h-4 text-[#FF9900] rounded border-secondary-500 ${isFullAccess ? 'cursor-not-allowed' : ''}`}
                                                                                        />
                                                                                        <div className="flex-1 flex items-center justify-between">
                                                                                            <code className={`text-xs font-mono transition-colors ${isFullAccess
                                                                                                ? 'text-secondary-500'
                                                                                                : 'text-secondary-300 group-hover:text-white'
                                                                                                }`}>{permission}</code>
                                                                                            <span className="px-2 py-0.5 text-xs bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20 rounded">
                                                                                                Write
                                                                                            </span>
                                                                                        </div>
                                                                                    </label>
                                                                                );
                                                                            })}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Warning if no services selected */}
                            {selectedServices.length === 0 && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning-500/15 border border-warning-500/30">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-warning-400 flex-shrink-0" />
                                    <p className="text-sm text-warning-300">
                                        Please select at least one service to continue.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => setStep('guide')}
                                    disabled={selectedServices.length === 0}
                                    className="px-6 py-3 bg-gradient-to-r from-[#06ec9e] to-[#009454] text-white font-semibold rounded-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue with {selectedServices.length} Service{selectedServices.length !== 1 ? 's' : ''}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Setup Guide */}
                    {step === 'guide' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">How to Connect Your AWS Account</h3>
                                <p className="text-sm text-secondary-400">
                                    Follow these steps to securely connect your AWS account to CostKatana using cross-account IAM roles.
                                </p>
                            </div>

                            {/* Selected Services Summary */}
                            <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/20">
                                <h4 className="text-sm font-semibold text-primary-400 mb-2">Selected AWS Services</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedServices.map(serviceId => {
                                        const service = AWS_SERVICES.find(s => s.id === serviceId);
                                        return service ? (
                                            <span
                                                key={serviceId}
                                                className="px-3 py-1.5 text-xs font-medium bg-primary-500/20 text-primary-300 border border-primary-500/30 rounded-full"
                                            >
                                                {service.name}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                                <button
                                    onClick={() => setStep('services')}
                                    className="mt-2 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                                >
                                    ← Change services
                                </button>
                            </div>

                            {/* Permission Mode Selection */}
                            <div className="p-4 rounded-lg bg-dark-bg-200 border border-primary-500/15">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-semibold text-white">
                                        Select Permission Mode
                                    </label>
                                    {fullAccessServices.size > 0 && (
                                        <span className="px-2 py-1 text-xs bg-[#FF9900]/20 text-[#FF9900] border border-[#FF9900]/30 rounded">
                                            Auto: Read-Write (Full Access enabled)
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            // If full access is enabled, prevent switching to read-only
                                            if (fullAccessServices.size > 0) {
                                                return;
                                            }
                                            setPermissionMode('read-only');
                                        }}
                                        disabled={fullAccessServices.size > 0}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${permissionMode === 'read-only'
                                            ? 'border-primary-500 bg-primary-500/10'
                                            : 'border-primary-500/20 hover:border-primary-500/40'
                                            } ${fullAccessServices.size > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span className="text-white font-medium block mb-1">Read-Only</span>
                                        <span className="text-xs text-secondary-400">View resources, costs, and recommendations</span>
                                    </button>
                                    <button
                                        onClick={() => setPermissionMode('read-write')}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${permissionMode === 'read-write'
                                            ? 'border-primary-500 bg-primary-500/10'
                                            : 'border-primary-500/20 hover:border-primary-500/40'
                                            }`}
                                    >
                                        <span className="text-white font-medium block mb-1">Read-Write</span>
                                        <span className="text-xs text-secondary-400">Apply optimizations (with approval)</span>
                                    </button>
                                </div>
                                {fullAccessServices.size > 0 && (
                                    <div className="mt-3 p-2 rounded bg-[#FF9900]/10 border border-[#FF9900]/20">
                                        <p className="text-xs text-[#FF9900]">
                                            <strong>Note:</strong> Full Access is enabled for {fullAccessServices.size} service{fullAccessServices.size !== 1 ? 's' : ''}, which includes write permissions. Permission Mode is automatically set to Read-Write.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Step-by-step guide */}
                            <div className="space-y-4">
                                {/* Step 1 */}
                                <div className="p-4 rounded-lg bg-dark-bg-200 border border-primary-500/15">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                                        <div className="flex-1">
                                            <h4 className="text-white font-medium mb-2">Download CloudFormation Template</h4>
                                            <p className="text-sm text-secondary-400 mb-3">
                                                This template creates an IAM role with permissions for {selectedServices.length} selected service{selectedServices.length !== 1 ? 's' : ''}.
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={downloadTemplate}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500/20 border border-primary-500/30 rounded-lg hover:bg-primary-500/30 transition-colors"
                                                >
                                                    <DocumentTextIcon className="w-4 h-4" />
                                                    Download Template
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(generateCloudFormationTemplate(permissionMode, selectedPermissions), 'template')}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-300 border border-primary-500/20 rounded-lg hover:bg-white/5 transition-colors"
                                                >
                                                    <ClipboardDocumentIcon className="w-4 h-4" />
                                                    {copiedItem === 'template' ? 'Copied!' : 'Copy'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="p-4 rounded-lg bg-dark-bg-200 border border-primary-500/15">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                                        <div className="flex-1">
                                            <h4 className="text-white font-medium mb-2">Deploy in AWS CloudFormation</h4>
                                            <p className="text-sm text-secondary-400 mb-3">
                                                Go to AWS CloudFormation console and create a new stack using the template.
                                            </p>
                                            <a
                                                href="https://console.aws.amazon.com/cloudformation/home#/stacks/create/template"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#FF9900] bg-[#FF9900]/10 border border-[#FF9900]/30 rounded-lg hover:bg-[#FF9900]/20 transition-colors"
                                            >
                                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                                Open AWS CloudFormation
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="p-4 rounded-lg bg-dark-bg-200 border border-primary-500/15">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                                        <div className="flex-1">
                                            <h4 className="text-white font-medium mb-2">Copy the Role ARN</h4>
                                            <p className="text-sm text-secondary-400 mb-3">
                                                After the stack is created, go to the <strong className="text-white">Outputs</strong> tab and copy the <strong className="text-white">RoleArn</strong> value.
                                            </p>
                                            <div className="p-3 rounded-lg bg-black/50 border border-primary-500/10">
                                                <code className="text-xs text-secondary-300 font-mono">
                                                    arn:aws:iam::YOUR_ACCOUNT_ID:role/CostKatanaRole
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* External ID Info */}
                            <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/30">
                                <div className="flex items-start gap-3">
                                    <ShieldCheckIcon className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-primary-400 mb-1">Your External ID</h4>
                                        <p className="text-xs text-primary-400/80 mb-2">
                                            This ID is embedded in the template and prevents confused deputy attacks.
                                        </p>
                                        <div className="flex items-center gap-2 p-2 rounded bg-black/30 border border-primary-500/20">
                                            <code className="flex-1 text-xs text-white font-mono break-all">{generatedExternalId}</code>
                                            <button
                                                onClick={() => copyToClipboard(generatedExternalId, 'externalId')}
                                                className="px-2 py-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                                            >
                                                {copiedItem === 'externalId' ? '✓' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep('services')}
                                    className="px-6 py-3 text-secondary-300 hover:text-white transition-colors"
                                >
                                    ← Back to Services
                                </button>
                                <button
                                    onClick={() => setStep('details')}
                                    className="px-6 py-3 bg-gradient-to-r from-[#06ec9e] to-[#009454] text-white font-semibold rounded-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all"
                                >
                                    I've Created the Role → Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Connection Details */}
                    {step === 'details' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Enter Connection Details</h3>
                                <p className="text-sm text-secondary-400">
                                    Provide the Role ARN from CloudFormation outputs and name your connection.
                                </p>
                            </div>

                            {/* Show if connection already created */}
                            {createdConnection && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-success-500/15 border border-success-500/30">
                                    <CheckCircleIcon className="w-5 h-5 text-success-400 flex-shrink-0" />
                                    <p className="text-sm text-success-300">
                                        Connection already created. You can update details or continue to test.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Role ARN - Most Important */}
                                <div className="p-4 rounded-lg bg-[#FF9900]/5 border border-[#FF9900]/30">
                                    <label className="block text-sm font-semibold text-[#FF9900] mb-2">
                                        IAM Role ARN *
                                    </label>
                                    <input
                                        type="text"
                                        value={roleArn}
                                        onChange={(e) => setRoleArn(e.target.value)}
                                        placeholder="arn:aws:iam::123456789012:role/CostKatanaRole"
                                        className="w-full px-4 py-3 rounded-lg bg-dark-bg-200 border-2 border-[#FF9900]/30 text-white placeholder-secondary-500 focus:border-[#FF9900] focus:outline-none transition-colors font-mono text-sm"
                                    />
                                    <p className="mt-2 text-xs text-secondary-400">
                                        Find this in CloudFormation → Your Stack → Outputs tab → RoleArn value
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                                        Connection Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={connectionName}
                                        onChange={(e) => setConnectionName(e.target.value)}
                                        placeholder="e.g., Production AWS, My Dev Account"
                                        className="w-full px-4 py-3 rounded-lg bg-dark-bg-200 border-2 border-primary-500/20 text-white placeholder-secondary-500 focus:border-primary-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="e.g., Main production AWS account for company XYZ"
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-lg bg-dark-bg-200 border-2 border-primary-500/20 text-white placeholder-secondary-500 focus:border-primary-500 focus:outline-none transition-colors resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
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
                                        <div className="px-4 py-3 rounded-lg bg-dark-bg-200 border-2 border-primary-500/20 text-white">
                                            {permissionMode === 'read-only' ? 'Read-Only' : 'Read-Write'}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                                        Allowed Regions
                                    </label>
                                    <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-dark-bg-200 border border-primary-500/15">
                                        {regions.map((region) => (
                                            <label key={region} className="flex items-center gap-2 text-sm text-secondary-300 cursor-pointer hover:text-white transition-colors">
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
                                                    className="text-primary-500 rounded"
                                                />
                                                {region}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Validation hint */}
                            {roleArn && !roleArn.startsWith('arn:aws:iam::') && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning-500/15 border border-warning-500/30">
                                    <InformationCircleIcon className="w-5 h-5 text-warning-400 flex-shrink-0" />
                                    <p className="text-sm text-warning-300">
                                        Role ARN should start with <code className="font-mono bg-black/30 px-1 rounded">arn:aws:iam::</code>
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep('guide')}
                                    className="px-6 py-3 text-secondary-300 hover:text-white transition-colors"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleCreateConnection}
                                    disabled={!connectionName || !roleArn || loading}
                                    className="px-6 py-3 bg-gradient-to-r from-[#06ec9e] to-[#009454] text-white font-semibold rounded-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating Connection...' : createdConnection ? 'Continue to Test' : 'Create & Test Connection'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Test Connection */}
                    {step === 'test' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Test Your Connection</h3>
                                <p className="text-sm text-secondary-400">
                                    We'll verify that CostKatana can securely access your AWS account using the IAM role.
                                </p>
                            </div>

                            <div className="p-6 rounded-lg bg-dark-bg-200 border border-primary-500/15 text-center">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#FF9900]/10 flex items-center justify-center">
                                    <CloudIcon className="w-10 h-10 text-[#FF9900]" />
                                </div>
                                <h4 className="text-white font-semibold mb-2">{connectionName}</h4>
                                <p className="text-sm text-secondary-400 mb-1 font-mono">{roleArn}</p>
                                <p className="text-xs text-secondary-500 mb-6">
                                    {environment} • {permissionMode} • {allowedRegions.length} region(s)
                                </p>
                                <button
                                    onClick={handleTestConnection}
                                    disabled={loading}
                                    className="px-8 py-3 bg-gradient-to-r from-[#06ec9e] to-[#009454] text-white font-semibold rounded-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all disabled:opacity-50"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Testing Connection...
                                        </span>
                                    ) : 'Test Connection'}
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
                                                    Latency: {testResult.latencyMs}ms • Your AWS account is now connected
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <ExclamationTriangleIcon className="w-8 h-8 text-danger-400 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-danger-300">Connection Failed</p>
                                                <p className="text-sm text-danger-400/80">{testResult.error}</p>
                                                <p className="text-xs text-danger-400/60 mt-1">
                                                    Please verify the Role ARN and ensure the CloudFormation stack completed successfully.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {!testResult?.success && (
                                <div className="flex justify-between pt-4">
                                    <button
                                        onClick={() => {
                                            // When going back, preserve the created connection
                                            setStep('details');
                                        }}
                                        className="px-6 py-3 text-secondary-300 hover:text-white transition-colors"
                                    >
                                        ← Back to Edit
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Complete */}
                    {step === 'complete' && (
                        <div className="text-center py-8">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-success-500/20 to-primary-500/20 flex items-center justify-center">
                                <CheckCircleIcon className="w-14 h-14 text-success-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">🎉 AWS Connected!</h3>
                            <p className="text-secondary-400 mb-4 max-w-md mx-auto">
                                Your AWS account <strong className="text-white">{connectionName}</strong> is now connected to CostKatana.
                            </p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-lg bg-success-500/10 border border-success-500/20">
                                <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
                                <span className="text-sm text-success-300">Active • {permissionMode}</span>
                            </div>
                            <div className="space-y-3">
                                <p className="text-sm text-secondary-400">
                                    You can now use natural language in chat to:
                                </p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <span className="px-3 py-1.5 text-xs bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-full">
                                        View EC2 costs
                                    </span>
                                    <span className="px-3 py-1.5 text-xs bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-full">
                                        Analyze spending
                                    </span>
                                    <span className="px-3 py-1.5 text-xs bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-full">
                                        Get recommendations
                                    </span>
                                    {permissionMode === 'read-write' && (
                                        <span className="px-3 py-1.5 text-xs bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20 rounded-full">
                                            Optimize resources
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="mt-8 px-8 py-3 bg-gradient-to-r from-[#06ec9e] to-[#009454] text-white font-semibold rounded-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all"
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
