import React, { useState, useCallback } from 'react';
import { awsService, AWSConnection } from '../../services/aws.service';

interface AWSConnectionSetupProps {
    onConnectionCreated?: (connection: AWSConnection) => void;
    onClose?: () => void;
}

type SetupStep = 'info' | 'role' | 'permissions' | 'test' | 'complete';

const COSTKATANA_AWS_ACCOUNT_ID = import.meta.env.VITE_COSTKATANA_AWS_ACCOUNT_ID || '123456789012';

export const AWSConnectionSetup: React.FC<AWSConnectionSetupProps> = ({
    onConnectionCreated,
    onClose,
}) => {
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
                onConnectionCreated?.(createdConnection);
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
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Connect AWS Account</h2>
                <button onClick={onClose} style={styles.closeButton}>×</button>
            </div>

            {/* Progress Steps */}
            <div style={styles.progressContainer}>
                {['info', 'role', 'permissions', 'test', 'complete'].map((s, i) => (
                    <div key={s} style={styles.progressStep}>
                        <div style={{
                            ...styles.progressDot,
                            backgroundColor: step === s ? '#06ec9e' :
                                ['info', 'role', 'permissions', 'test', 'complete'].indexOf(step) > i ? '#22c55e' : '#334155',
                        }}>
                            {['info', 'role', 'permissions', 'test', 'complete'].indexOf(step) > i ? '✓' : i + 1}
                        </div>
                        <span style={styles.progressLabel}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                    </div>
                ))}
            </div>

            {error && (
                <div style={styles.errorBanner}>
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Step 1: Connection Info */}
            {step === 'info' && (
                <div style={styles.stepContent}>
                    <h3 style={styles.stepTitle}>Connection Details</h3>
                    <p style={styles.stepDescription}>
                        Provide basic information about your AWS connection.
                    </p>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Connection Name *</label>
                        <input
                            type="text"
                            value={connectionName}
                            onChange={(e) => setConnectionName(e.target.value)}
                            placeholder="e.g., Production AWS"
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description..."
                            style={styles.textarea}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Environment</label>
                        <select
                            value={environment}
                            onChange={(e) => setEnvironment(e.target.value as any)}
                            style={styles.select}
                        >
                            <option value="development">Development</option>
                            <option value="staging">Staging</option>
                            <option value="production">Production</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>IAM Role ARN *</label>
                        <input
                            type="text"
                            value={roleArn}
                            onChange={(e) => setRoleArn(e.target.value)}
                            placeholder="arn:aws:iam::123456789012:role/CostKatanaRole"
                            style={styles.input}
                        />
                        <p style={styles.hint}>
                            You'll create this role in the next step. Enter the expected ARN.
                        </p>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Permission Mode</label>
                        <div style={styles.radioGroup}>
                            <label style={styles.radioLabel}>
                                <input
                                    type="radio"
                                    checked={permissionMode === 'read-only'}
                                    onChange={() => setPermissionMode('read-only')}
                                />
                                <span>Read-Only (Recommended for start)</span>
                            </label>
                            <label style={styles.radioLabel}>
                                <input
                                    type="radio"
                                    checked={permissionMode === 'read-write'}
                                    onChange={() => setPermissionMode('read-write')}
                                />
                                <span>Read-Write (Enables optimization actions)</span>
                            </label>
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Allowed Regions</label>
                        <div style={styles.checkboxGrid}>
                            {regions.map((region) => (
                                <label key={region} style={styles.checkboxLabel}>
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
                                    />
                                    <span>{region}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleCreateConnection}
                        disabled={!connectionName || !roleArn || loading}
                        style={{
                            ...styles.primaryButton,
                            opacity: !connectionName || !roleArn || loading ? 0.5 : 1,
                        }}
                    >
                        {loading ? 'Creating...' : 'Continue'}
                    </button>
                </div>
            )}

            {/* Step 2: Create IAM Role */}
            {step === 'role' && createdConnection && (
                <div style={styles.stepContent}>
                    <h3 style={styles.stepTitle}>Create IAM Role</h3>
                    <p style={styles.stepDescription}>
                        Create the IAM role in your AWS account using one of these methods:
                    </p>

                    <div style={styles.infoBox}>
                        <h4 style={styles.infoTitle}>🔐 Your External ID</h4>
                        <div style={styles.externalIdBox}>
                            <code style={styles.code}>{createdConnection.externalId}</code>
                            <button
                                onClick={() => copyToClipboard(createdConnection.externalId || '')}
                                style={styles.copyButton}
                            >
                                Copy
                            </button>
                        </div>
                        <p style={styles.infoText}>
                            This unique ID prevents confused deputy attacks. Keep it secure.
                        </p>
                    </div>

                    <div style={styles.methodTabs}>
                        <div style={styles.methodTab}>
                            <h4>Option 1: CloudFormation (Recommended)</h4>
                            <p>Deploy the IAM role with one click:</p>
                            <div style={styles.codeBlock}>
                                <pre style={styles.pre}>{generateCloudFormationTemplate()}</pre>
                            </div>
                            <button
                                onClick={() => copyToClipboard(generateCloudFormationTemplate())}
                                style={styles.secondaryButton}
                            >
                                Copy Template
                            </button>
                        </div>

                        <div style={styles.methodTab}>
                            <h4>Option 2: AWS CLI</h4>
                            <div style={styles.codeBlock}>
                                <pre style={styles.pre}>{`aws cloudformation create-stack \\
  --stack-name CostKatanaRole \\
  --template-body file://costkatana-role.yaml \\
  --parameters ParameterKey=ExternalId,ParameterValue=${createdConnection.externalId} \\
  --capabilities CAPABILITY_NAMED_IAM`}</pre>
                            </div>
                        </div>
                    </div>

                    <div style={styles.buttonGroup}>
                        <button onClick={() => setStep('info')} style={styles.secondaryButton}>
                            Back
                        </button>
                        <button onClick={() => setStep('test')} style={styles.primaryButton}>
                            I've Created the Role
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Test Connection */}
            {step === 'test' && createdConnection && (
                <div style={styles.stepContent}>
                    <h3 style={styles.stepTitle}>Test Connection</h3>
                    <p style={styles.stepDescription}>
                        Verify that CostKatana can access your AWS account.
                    </p>

                    <div style={styles.testBox}>
                        <div style={styles.testInfo}>
                            <p><strong>Connection:</strong> {createdConnection.connectionName}</p>
                            <p><strong>Role ARN:</strong> {createdConnection.roleArn}</p>
                            <p><strong>Environment:</strong> {createdConnection.environment}</p>
                        </div>

                        {testResult && (
                            <div style={{
                                ...styles.testResult,
                                backgroundColor: testResult.success ? '#064e3b' : '#7f1d1d',
                            }}>
                                {testResult.success ? (
                                    <>
                                        <span style={styles.successIcon}>✓</span>
                                        <span>Connection successful! Latency: {testResult.latencyMs}ms</span>
                                    </>
                                ) : (
                                    <>
                                        <span style={styles.errorIcon}>✗</span>
                                        <span>{testResult.error}</span>
                                    </>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleTestConnection}
                            disabled={loading}
                            style={styles.primaryButton}
                        >
                            {loading ? 'Testing...' : 'Test Connection'}
                        </button>
                    </div>

                    <div style={styles.troubleshootBox}>
                        <h4>Troubleshooting</h4>
                        <ul>
                            <li>Verify the IAM role exists and has the correct name</li>
                            <li>Check the trust policy includes CostKatana's AWS account</li>
                            <li>Ensure the External ID matches exactly</li>
                            <li>Verify the role has the required permissions</li>
                        </ul>
                    </div>

                    <button onClick={() => setStep('role')} style={styles.secondaryButton}>
                        Back
                    </button>
                </div>
            )}

            {/* Step 4: Complete */}
            {step === 'complete' && createdConnection && (
                <div style={styles.stepContent}>
                    <div style={styles.successBox}>
                        <div style={styles.successIcon}>✓</div>
                        <h3 style={styles.successTitle}>Connection Established!</h3>
                        <p style={styles.successText}>
                            Your AWS account is now connected to CostKatana.
                        </p>
                    </div>

                    <div style={styles.nextSteps}>
                        <h4>What's Next?</h4>
                        <ul>
                            <li>View your AWS resources and costs</li>
                            <li>Get AI-powered optimization recommendations</li>
                            <li>Execute cost-saving actions with approval workflow</li>
                        </ul>
                    </div>

                    <button onClick={onClose} style={styles.primaryButton}>
                        Get Started
                    </button>
                </div>
            )}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        backgroundColor: '#0C1012',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid rgba(6, 236, 158, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
    },
    title: {
        margin: 0,
        color: '#f8fafc',
        fontSize: '24px',
        fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
    },
    closeButton: {
        background: 'none',
        border: 'none',
        color: '#9ca3af',
        fontSize: '28px',
        cursor: 'pointer',
    },
    progressContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '32px',
    },
    progressStep: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
    },
    progressDot: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '14px',
    },
    progressLabel: {
        color: '#9ca3af',
        fontSize: '12px',
    },
    errorBanner: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        color: '#fca5a5',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid rgba(239, 68, 68, 0.3)',
    },
    stepContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    stepTitle: {
        margin: 0,
        color: '#f8fafc',
        fontSize: '20px',
        fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
    },
    stepDescription: {
        color: '#94a3b8',
        margin: 0,
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        color: '#cbd5e1',
        fontSize: '14px',
        fontWeight: 600,
        fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
    },
    input: {
        backgroundColor: 'rgba(12, 16, 18, 0.8)',
        border: '2px solid rgba(6, 236, 158, 0.2)',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#f8fafc',
        fontSize: '14px',
        transition: 'all 0.3s ease',
    },
    textarea: {
        backgroundColor: 'rgba(12, 16, 18, 0.8)',
        border: '2px solid rgba(6, 236, 158, 0.2)',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#f8fafc',
        fontSize: '14px',
        minHeight: '80px',
        resize: 'vertical' as const,
        transition: 'all 0.3s ease',
    },
    select: {
        backgroundColor: 'rgba(12, 16, 18, 0.8)',
        border: '2px solid rgba(6, 236, 158, 0.2)',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#f8fafc',
        fontSize: '14px',
        transition: 'all 0.3s ease',
    },
    hint: {
        color: '#64748b',
        fontSize: '12px',
        margin: 0,
    },
    radioGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    radioLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#cbd5e1',
        cursor: 'pointer',
    },
    checkboxGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#cbd5e1',
        cursor: 'pointer',
        fontSize: '14px',
    },
    primaryButton: {
        background: 'linear-gradient(135deg, #06ec9e, #009454)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(6, 236, 158, 0.4)',
        transition: 'all 0.3s ease',
    },
    secondaryButton: {
        background: 'linear-gradient(135deg, #64748b, #334155)',
        color: '#f8fafc',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '14px',
        cursor: 'pointer',
        fontWeight: 600,
        boxShadow: '0 4px 15px rgba(100, 116, 139, 0.4)',
        transition: 'all 0.3s ease',
    },
    infoBox: {
        backgroundColor: 'rgba(6, 236, 158, 0.1)',
        border: '1px solid rgba(6, 236, 158, 0.3)',
        borderRadius: '8px',
        padding: '16px',
    },
    infoTitle: {
        margin: '0 0 12px 0',
        color: '#06ec9e',
        fontSize: '16px',
        fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
    },
    externalIdBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#0C1012',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid rgba(6, 236, 158, 0.2)',
    },
    code: {
        flex: 1,
        fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
        color: '#f8fafc',
        fontSize: '14px',
        wordBreak: 'break-all' as const,
    },
    copyButton: {
        backgroundColor: 'rgba(6, 236, 158, 0.2)',
        color: '#06ec9e',
        border: '1px solid rgba(6, 236, 158, 0.3)',
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 600,
        transition: 'all 0.3s ease',
    },
    infoText: {
        color: '#06ec9e',
        fontSize: '12px',
        margin: '12px 0 0 0',
    },
    methodTabs: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    methodTab: {
        backgroundColor: '#0C1012',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid rgba(6, 236, 158, 0.15)',
    },
    codeBlock: {
        backgroundColor: '#000000',
        borderRadius: '6px',
        padding: '12px',
        overflow: 'auto',
        maxHeight: '300px',
        border: '1px solid rgba(6, 236, 158, 0.1)',
    },
    pre: {
        margin: 0,
        color: '#e6edf3',
        fontSize: '12px',
        fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
        whiteSpace: 'pre-wrap' as const,
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
    },
    testBox: {
        backgroundColor: '#0C1012',
        borderRadius: '8px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1px solid rgba(6, 236, 158, 0.15)',
    },
    testInfo: {
        color: '#cbd5e1',
        fontSize: '14px',
    },
    testResult: {
        padding: '16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#fff',
    },
    successIcon: {
        fontSize: '24px',
        color: '#06ec9e',
    },
    errorIcon: {
        fontSize: '24px',
        color: '#ef4444',
    },
    troubleshootBox: {
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        borderRadius: '8px',
        padding: '16px',
        color: '#fde047',
        fontSize: '14px',
        border: '1px solid rgba(234, 179, 8, 0.3)',
    },
    successBox: {
        textAlign: 'center' as const,
        padding: '32px',
    },
    successTitle: {
        color: '#06ec9e',
        margin: '16px 0 8px 0',
        fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
    },
    successText: {
        color: '#94a3b8',
        margin: 0,
    },
    nextSteps: {
        backgroundColor: '#0C1012',
        borderRadius: '8px',
        padding: '16px',
        color: '#cbd5e1',
        border: '1px solid rgba(6, 236, 158, 0.15)',
    },
};

export default AWSConnectionSetup;
