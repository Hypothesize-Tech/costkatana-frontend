import React, { useState, useEffect } from 'react';
import { awsService, AWSConnection, ParsedIntent, ExecutionPlan, AllowedAction } from '../services/aws.service';
import AWSConnectionSetup from '../components/aws/AWSConnectionSetup';
import ExecutionApproval from '../components/aws/ExecutionApproval';
import AWSAuditViewer from '../components/aws/AWSAuditViewer';

type TabType = 'connections' | 'command' | 'audit' | 'settings';

export const AWSIntegration: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('connections');
    const [connections, setConnections] = useState<AWSConnection[]>([]);
    const [selectedConnection, setSelectedConnection] = useState<AWSConnection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Connection setup modal
    const [showSetupModal, setShowSetupModal] = useState(false);

    // Command input state
    const [commandInput, setCommandInput] = useState('');
    const [intent, setIntent] = useState<ParsedIntent | null>(null);
    const [plan, setPlan] = useState<ExecutionPlan | null>(null);
    const [allowedActions, setAllowedActions] = useState<AllowedAction[]>([]);

    // Approval modal
    const [showApprovalModal, setShowApprovalModal] = useState(false);

    useEffect(() => {
        loadConnections();
        loadAllowedActions();
    }, []);

    const loadConnections = async () => {
        setLoading(true);
        try {
            const result = await awsService.listConnections();
            setConnections(result.connections);
            if (result.connections.length > 0 && !selectedConnection) {
                setSelectedConnection(result.connections[0]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load connections');
        } finally {
            setLoading(false);
        }
    };

    const loadAllowedActions = async () => {
        try {
            const result = await awsService.getAllowedActions();
            setAllowedActions(result.actions);
        } catch (err) {
            console.error('Failed to load allowed actions:', err);
        }
    };

    const handleParseIntent = async () => {
        if (!commandInput.trim()) return;

        setLoading(true);
        setError(null);
        setIntent(null);
        setPlan(null);

        try {
            const result = await awsService.parseIntent(commandInput, selectedConnection?.id);
            setIntent(result.intent);

            if (!result.intent.blocked && result.intent.suggestedAction && selectedConnection) {
                const planResult = await awsService.generatePlan(result.intent, selectedConnection.id);
                setPlan(planResult.plan);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse intent');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConnection = async (id: string) => {
        if (!confirm('Are you sure you want to delete this connection?')) return;

        try {
            await awsService.deleteConnection(id);
            await loadConnections();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete connection');
        }
    };

    const handleTestConnection = async (id: string) => {
        try {
            const result = await awsService.testConnection(id);
            if (result.success) {
                alert(`Connection healthy! Latency: ${result.latencyMs}ms`);
            } else {
                alert(`Connection failed: ${result.error}`);
            }
            await loadConnections();
        } catch (err) {
            alert('Test failed');
        }
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'active': return '#10b981';
            case 'error': return '#ef4444';
            case 'pending_verification': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const getRiskColor = (risk: string): string => {
        switch (risk) {
            case 'low': return '#10b981';
            case 'medium': return '#f59e0b';
            case 'high': return '#ef4444';
            case 'critical': return '#dc2626';
            default: return '#6b7280';
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>AWS Integration</h1>
                    <p style={styles.subtitle}>
                        Connect your AWS accounts and optimize costs with AI-powered recommendations
                    </p>
                </div>
                <button onClick={() => setShowSetupModal(true)} style={styles.addButton}>
                    + Add Connection
                </button>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                {(['connections', 'command', 'audit', 'settings'] as TabType[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            ...styles.tab,
                            borderBottomColor: activeTab === tab ? '#3b82f6' : 'transparent',
                            color: activeTab === tab ? '#f9fafb' : '#9ca3af',
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {error && (
                <div style={styles.errorBanner}>
                    <span>⚠️</span> {error}
                    <button onClick={() => setError(null)} style={styles.dismissButton}>×</button>
                </div>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && (
                <div style={styles.content}>
                    {loading ? (
                        <div style={styles.loadingState}>Loading connections...</div>
                    ) : connections.length === 0 ? (
                        <div style={styles.emptyState}>
                            <h3>No AWS Connections</h3>
                            <p>Connect your AWS account to start optimizing costs</p>
                            <button onClick={() => setShowSetupModal(true)} style={styles.primaryButton}>
                                Add Your First Connection
                            </button>
                        </div>
                    ) : (
                        <div style={styles.connectionGrid}>
                            {connections.map((conn) => (
                                <div
                                    key={conn.id}
                                    style={{
                                        ...styles.connectionCard,
                                        borderColor: selectedConnection?.id === conn.id ? '#3b82f6' : '#374151',
                                    }}
                                    onClick={() => setSelectedConnection(conn)}
                                >
                                    <div style={styles.connectionHeader}>
                                        <h3 style={styles.connectionName}>{conn.connectionName}</h3>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: `${getStatusColor(conn.status)}20`,
                                            color: getStatusColor(conn.status),
                                        }}>
                                            {conn.status}
                                        </span>
                                    </div>

                                    <div style={styles.connectionDetails}>
                                        <p><strong>Environment:</strong> {conn.environment}</p>
                                        <p><strong>Mode:</strong> {conn.permissionMode}</p>
                                        <p><strong>Executions:</strong> {conn.totalExecutions}</p>
                                        {conn.lastUsed && (
                                            <p><strong>Last Used:</strong> {new Date(conn.lastUsed).toLocaleDateString()}</p>
                                        )}
                                    </div>

                                    <div style={styles.connectionActions}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleTestConnection(conn.id); }}
                                            style={styles.actionButton}
                                        >
                                            Test
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteConnection(conn.id); }}
                                            style={styles.deleteButton}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Command Tab */}
            {activeTab === 'command' && (
                <div style={styles.content}>
                    {!selectedConnection ? (
                        <div style={styles.warningBox}>
                            Please select a connection first from the Connections tab
                        </div>
                    ) : (
                        <>
                            <div style={styles.commandSection}>
                                <h3 style={styles.sectionTitle}>Natural Language Command</h3>
                                <p style={styles.sectionDescription}>
                                    Describe what you want to do with your AWS resources
                                </p>

                                <div style={styles.commandInputContainer}>
                                    <textarea
                                        value={commandInput}
                                        onChange={(e) => setCommandInput(e.target.value)}
                                        placeholder="e.g., Stop all idle EC2 instances in us-east-1 that haven't been used in 7 days"
                                        style={styles.commandInput}
                                    />
                                    <button
                                        onClick={handleParseIntent}
                                        disabled={loading || !commandInput.trim()}
                                        style={{
                                            ...styles.parseButton,
                                            opacity: loading || !commandInput.trim() ? 0.5 : 1,
                                        }}
                                    >
                                        {loading ? 'Processing...' : 'Analyze'}
                                    </button>
                                </div>
                            </div>

                            {/* Intent Result */}
                            {intent && (
                                <div style={styles.intentResult}>
                                    <h4 style={styles.resultTitle}>Intent Analysis</h4>

                                    {intent.blocked ? (
                                        <div style={styles.blockedBox}>
                                            <span style={styles.blockedIcon}>🚫</span>
                                            <div>
                                                <strong>Blocked</strong>
                                                <p>{intent.blockReason}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={styles.intentDetails}>
                                                <div style={styles.intentItem}>
                                                    <span style={styles.intentLabel}>Interpreted As</span>
                                                    <span style={styles.intentValue}>{intent.interpretedAction}</span>
                                                </div>
                                                <div style={styles.intentItem}>
                                                    <span style={styles.intentLabel}>Confidence</span>
                                                    <span style={styles.intentValue}>{(intent.confidence * 100).toFixed(0)}%</span>
                                                </div>
                                                <div style={styles.intentItem}>
                                                    <span style={styles.intentLabel}>Risk Level</span>
                                                    <span style={{
                                                        ...styles.riskBadge,
                                                        backgroundColor: `${getRiskColor(intent.riskLevel)}20`,
                                                        color: getRiskColor(intent.riskLevel),
                                                    }}>
                                                        {intent.riskLevel}
                                                    </span>
                                                </div>
                                            </div>

                                            {intent.warnings.length > 0 && (
                                                <div style={styles.warningsBox}>
                                                    <strong>Warnings:</strong>
                                                    <ul>
                                                        {intent.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Plan Preview */}
                            {plan && !intent?.blocked && (
                                <div style={styles.planPreview}>
                                    <div style={styles.planHeader}>
                                        <h4 style={styles.resultTitle}>Execution Plan</h4>
                                        <button
                                            onClick={() => setShowApprovalModal(true)}
                                            style={styles.reviewButton}
                                        >
                                            Review & Approve
                                        </button>
                                    </div>

                                    <div style={styles.planSummary}>
                                        <div style={styles.planItem}>
                                            <span>{plan.summary.totalSteps} steps</span>
                                        </div>
                                        <div style={styles.planItem}>
                                            <span>{plan.summary.resourcesAffected} resources</span>
                                        </div>
                                        <div style={styles.planItem}>
                                            <span style={{
                                                color: plan.summary.estimatedCostImpact < 0 ? '#10b981' : '#ef4444',
                                            }}>
                                                {plan.summary.estimatedCostImpact < 0 ? '-' : '+'}
                                                ${Math.abs(plan.summary.estimatedCostImpact).toFixed(2)}/mo
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div style={styles.quickActions}>
                                <h4 style={styles.sectionTitle}>Quick Actions</h4>
                                <div style={styles.actionGrid}>
                                    {allowedActions.slice(0, 6).map((action) => (
                                        <button
                                            key={action.action}
                                            onClick={() => setCommandInput(action.description)}
                                            style={styles.quickActionButton}
                                        >
                                            <span style={styles.actionName}>{action.name}</span>
                                            <span style={{
                                                ...styles.actionRisk,
                                                color: getRiskColor(action.risk),
                                            }}>
                                                {action.risk}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Audit Tab */}
            {activeTab === 'audit' && (
                <div style={styles.content}>
                    <AWSAuditViewer connectionId={selectedConnection?.id} />
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div style={styles.content}>
                    <div style={styles.settingsSection}>
                        <h3 style={styles.sectionTitle}>Security Settings</h3>
                        <div style={styles.settingItem}>
                            <div>
                                <strong>Kill Switch Status</strong>
                                <p style={styles.settingDescription}>Emergency stop for all AWS operations</p>
                            </div>
                            <span style={styles.statusActive}>Active</span>
                        </div>
                        <div style={styles.settingItem}>
                            <div>
                                <strong>Execution Mode</strong>
                                <p style={styles.settingDescription}>Current mode for new connections</p>
                            </div>
                            <span>Simulation First</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Connection Setup Modal */}
            {showSetupModal && (
                <div style={styles.modalOverlay}>
                    <AWSConnectionSetup
                        onConnectionCreated={(conn: AWSConnection) => {
                            setShowSetupModal(false);
                            loadConnections();
                        }}
                        onClose={() => setShowSetupModal(false)}
                    />
                </div>
            )}

            {/* Approval Modal */}
            {showApprovalModal && plan && selectedConnection && (
                <div style={styles.modalOverlay}>
                    <ExecutionApproval
                        plan={plan}
                        connectionId={selectedConnection.id}
                        onApprove={(token: string) => {
                            setShowApprovalModal(false);
                            // Handle execution
                        }}
                        onReject={() => {
                            setShowApprovalModal(false);
                            setPlan(null);
                        }}
                        onClose={() => setShowApprovalModal(false)}
                    />
                </div>
            )}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
    },
    title: {
        margin: 0,
        color: '#f8fafc',
        fontSize: '28px',
        fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
    },
    subtitle: {
        margin: '8px 0 0 0',
        color: '#94a3b8',
    },
    addButton: {
        background: 'linear-gradient(135deg, #06ec9e, #009454)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(6, 236, 158, 0.4)',
        transition: 'all 0.3s ease',
    },
    tabs: {
        display: 'flex',
        borderBottom: '1px solid rgba(6, 236, 158, 0.2)',
        marginBottom: '24px',
    },
    tab: {
        background: 'none',
        border: 'none',
        borderBottom: '2px solid transparent',
        padding: '12px 24px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
    },
    errorBanner: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        color: '#fca5a5',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid rgba(239, 68, 68, 0.3)',
    },
    dismissButton: {
        marginLeft: 'auto',
        background: 'none',
        border: 'none',
        color: '#fca5a5',
        fontSize: '20px',
        cursor: 'pointer',
    },
    content: {
        minHeight: '400px',
    },
    loadingState: {
        textAlign: 'center' as const,
        padding: '60px',
        color: '#94a3b8',
    },
    emptyState: {
        textAlign: 'center' as const,
        padding: '60px',
        color: '#94a3b8',
    },
    primaryButton: {
        background: 'linear-gradient(135deg, #06ec9e, #009454)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '14px',
        cursor: 'pointer',
        marginTop: '16px',
        fontWeight: 600,
        boxShadow: '0 4px 15px rgba(6, 236, 158, 0.4)',
        transition: 'all 0.3s ease',
    },
    connectionGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
    },
    connectionCard: {
        backgroundColor: '#0C1012',
        borderRadius: '12px',
        padding: '20px',
        border: '2px solid rgba(6, 236, 158, 0.2)',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    connectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    connectionName: {
        margin: 0,
        color: '#f8fafc',
        fontSize: '18px',
        fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
    },
    statusBadge: {
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 500,
    },
    connectionDetails: {
        color: '#94a3b8',
        fontSize: '14px',
        marginBottom: '16px',
    },
    connectionActions: {
        display: 'flex',
        gap: '8px',
    },
    actionButton: {
        background: 'linear-gradient(135deg, #64748b, #334155)',
        color: '#f8fafc',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 16px',
        fontSize: '13px',
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'all 0.3s ease',
    },
    deleteButton: {
        backgroundColor: 'transparent',
        color: '#ef4444',
        border: '1px solid #ef4444',
        borderRadius: '6px',
        padding: '8px 16px',
        fontSize: '13px',
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'all 0.3s ease',
    },
    warningBox: {
        backgroundColor: 'rgba(234, 179, 8, 0.15)',
        color: '#fde047',
        padding: '16px',
        borderRadius: '8px',
        textAlign: 'center' as const,
        border: '1px solid rgba(234, 179, 8, 0.3)',
    },
    commandSection: {
        marginBottom: '24px',
    },
    sectionTitle: {
        margin: '0 0 8px 0',
        color: '#f8fafc',
        fontSize: '18px',
        fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
    },
    sectionDescription: {
        margin: '0 0 16px 0',
        color: '#94a3b8',
        fontSize: '14px',
    },
    commandInputContainer: {
        display: 'flex',
        gap: '12px',
    },
    commandInput: {
        flex: 1,
        backgroundColor: 'rgba(12, 16, 18, 0.8)',
        border: '2px solid rgba(6, 236, 158, 0.2)',
        borderRadius: '8px',
        padding: '16px',
        color: '#f8fafc',
        fontSize: '14px',
        minHeight: '100px',
        resize: 'vertical' as const,
        transition: 'all 0.3s ease',
    },
    parseButton: {
        background: 'linear-gradient(135deg, #06ec9e, #009454)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '16px 32px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        alignSelf: 'flex-start',
        boxShadow: '0 4px 15px rgba(6, 236, 158, 0.4)',
        transition: 'all 0.3s ease',
    },
    intentResult: {
        backgroundColor: '#0C1012',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid rgba(6, 236, 158, 0.15)',
    },
    resultTitle: {
        margin: '0 0 16px 0',
        color: '#f8fafc',
        fontSize: '16px',
        fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
    },
    blockedBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        padding: '16px',
        borderRadius: '8px',
        color: '#fca5a5',
        border: '1px solid rgba(239, 68, 68, 0.3)',
    },
    blockedIcon: {
        fontSize: '32px',
    },
    intentDetails: {
        display: 'flex',
        gap: '32px',
        flexWrap: 'wrap' as const,
    },
    intentItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    intentLabel: {
        color: '#94a3b8',
        fontSize: '12px',
    },
    intentValue: {
        color: '#f8fafc',
        fontSize: '16px',
        fontWeight: 500,
    },
    riskBadge: {
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 500,
    },
    warningsBox: {
        marginTop: '16px',
        backgroundColor: 'rgba(234, 179, 8, 0.15)',
        padding: '12px 16px',
        borderRadius: '8px',
        color: '#fde047',
        fontSize: '14px',
        border: '1px solid rgba(234, 179, 8, 0.3)',
    },
    planPreview: {
        backgroundColor: '#0C1012',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid rgba(6, 236, 158, 0.15)',
    },
    planHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    reviewButton: {
        background: 'linear-gradient(135deg, #06ec9e, #009454)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '14px',
        cursor: 'pointer',
        fontWeight: 600,
        boxShadow: '0 4px 15px rgba(6, 236, 158, 0.4)',
        transition: 'all 0.3s ease',
    },
    planSummary: {
        display: 'flex',
        gap: '32px',
    },
    planItem: {
        color: '#cbd5e1',
        fontSize: '14px',
    },
    quickActions: {
        marginTop: '24px',
    },
    actionGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
        marginTop: '16px',
    },
    quickActionButton: {
        backgroundColor: '#0C1012',
        border: '1px solid rgba(6, 236, 158, 0.2)',
        borderRadius: '8px',
        padding: '16px',
        cursor: 'pointer',
        textAlign: 'left' as const,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'all 0.3s ease',
    },
    actionName: {
        color: '#f8fafc',
        fontSize: '14px',
        fontWeight: 500,
    },
    actionRisk: {
        fontSize: '12px',
        textTransform: 'uppercase' as const,
    },
    settingsSection: {
        backgroundColor: '#0C1012',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(6, 236, 158, 0.15)',
    },
    settingItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: '1px solid rgba(6, 236, 158, 0.1)',
        color: '#cbd5e1',
    },
    settingDescription: {
        margin: '4px 0 0 0',
        color: '#94a3b8',
        fontSize: '13px',
    },
    statusActive: {
        color: '#06ec9e',
        fontWeight: 500,
    },
    modalOverlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(4px)',
    },
};

export default AWSIntegration;
