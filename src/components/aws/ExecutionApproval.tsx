import React, { useState, useMemo } from 'react';
import { ExecutionPlan, awsService } from '../../services/aws.service';

interface ExecutionApprovalProps {
  plan: ExecutionPlan;
  connectionId: string;
  onApprove?: (approvalToken: string) => void;
  onReject?: () => void;
  onSimulate?: () => void;
  onClose?: () => void;
}

export const ExecutionApproval: React.FC<ExecutionApprovalProps> = ({
  plan,
  connectionId,
  onApprove,
  onReject,
  onSimulate,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'impact' | 'diagram'>('overview');
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const riskColors: Record<string, string> = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626',
  };

  const getRiskLevel = (score: number): string => {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  };

  const formatCost = (cost: number): string => {
    const sign = cost >= 0 ? '+' : '';
    return `${sign}$${Math.abs(cost).toFixed(2)}`;
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await awsService.approvePlan(plan.planId, connectionId);
      onApprove?.(result.approvalToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await awsService.simulatePlan(plan, connectionId);
      setSimulationResult(result.simulation);
      onSimulate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const timeRemaining = useMemo(() => {
    const expires = new Date(plan.expiresAt).getTime();
    const now = Date.now();
    const remaining = Math.max(0, expires - now);
    return Math.round(remaining / 60000);
  }, [plan.expiresAt]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Execution Approval Required</h2>
          <p style={styles.subtitle}>
            Plan ID: {plan.planId.substring(0, 20)}... • Expires in {timeRemaining} minutes
          </p>
        </div>
        <button onClick={onClose} style={styles.closeButton}>×</button>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Risk Banner */}
      <div style={{
        ...styles.riskBanner,
        backgroundColor: `${riskColors[getRiskLevel(plan.summary.riskScore)]}20`,
        borderColor: riskColors[getRiskLevel(plan.summary.riskScore)],
      }}>
        <div style={styles.riskScore}>
          <span style={{ fontSize: '32px', fontWeight: 'bold', color: riskColors[getRiskLevel(plan.summary.riskScore)] }}>
            {plan.summary.riskScore}
          </span>
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>Risk Score</span>
        </div>
        <div style={styles.riskDetails}>
          <div style={styles.riskItem}>
            <span style={styles.riskLabel}>Resources Affected</span>
            <span style={styles.riskValue}>{plan.summary.resourcesAffected}</span>
          </div>
          <div style={styles.riskItem}>
            <span style={styles.riskLabel}>Cost Impact</span>
            <span style={{
              ...styles.riskValue,
              color: plan.summary.estimatedCostImpact < 0 ? '#10b981' : '#ef4444',
            }}>
              {formatCost(plan.summary.estimatedCostImpact)}/mo
            </span>
          </div>
          <div style={styles.riskItem}>
            <span style={styles.riskLabel}>Duration</span>
            <span style={styles.riskValue}>{formatDuration(plan.summary.estimatedDuration)}</span>
          </div>
          <div style={styles.riskItem}>
            <span style={styles.riskLabel}>Reversible</span>
            <span style={{
              ...styles.riskValue,
              color: plan.summary.reversible ? '#10b981' : '#ef4444',
            }}>
              {plan.summary.reversible ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {(['overview', 'steps', 'impact', 'diagram'] as const).map((tab) => (
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

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {activeTab === 'overview' && (
          <div style={styles.overviewGrid}>
            <div style={styles.overviewCard}>
              <h4 style={styles.cardTitle}>Summary</h4>
              <div style={styles.summaryList}>
                <div style={styles.summaryItem}>
                  <span>Total Steps</span>
                  <span>{plan.summary.totalSteps}</span>
                </div>
                <div style={styles.summaryItem}>
                  <span>Services Affected</span>
                  <span>{plan.summary.servicesAffected.join(', ')}</span>
                </div>
                <div style={styles.summaryItem}>
                  <span>DSL Version</span>
                  <span>{plan.dslVersion}</span>
                </div>
                <div style={styles.summaryItem}>
                  <span>Requires Approval</span>
                  <span>{plan.summary.requiresApproval ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div style={styles.overviewCard}>
              <h4 style={styles.cardTitle}>Security Info</h4>
              <div style={styles.securityInfo}>
                <p>• All actions are logged with hash-chain integrity</p>
                <p>• Temporary credentials expire in 15 minutes</p>
                <p>• Rollback plan available if reversible</p>
                <p>• DSL Hash: {plan.dslHash.substring(0, 16)}...</p>
              </div>
            </div>

            {simulationResult && (
              <div style={styles.overviewCard}>
                <h4 style={styles.cardTitle}>Simulation Results</h4>
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: simulationResult.canPromoteToLive ? '#064e3b' : '#7f1d1d',
                }}>
                  <p style={{ margin: 0, color: '#fff' }}>
                    {simulationResult.canPromoteToLive 
                      ? '✓ Simulation passed - ready for live execution'
                      : '✗ Issues detected - review blockers below'}
                  </p>
                </div>
                {simulationResult.promotionBlockers?.length > 0 && (
                  <ul style={styles.blockerList}>
                    {simulationResult.promotionBlockers.map((blocker: string, i: number) => (
                      <li key={i}>{blocker}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'steps' && (
          <div style={styles.stepsList}>
            {plan.steps.map((step, index) => (
              <div key={step.stepId} style={styles.stepCard}>
                <div style={styles.stepHeader}>
                  <div style={styles.stepNumber}>{index + 1}</div>
                  <div style={styles.stepInfo}>
                    <h4 style={styles.stepTitle}>{step.description}</h4>
                    <p style={styles.stepMeta}>
                      {step.service} • {step.action} • {step.resources.length} resources
                    </p>
                  </div>
                  <div style={{
                    ...styles.stepRisk,
                    backgroundColor: `${riskColors[step.impact.riskLevel]}20`,
                    color: riskColors[step.impact.riskLevel],
                  }}>
                    {step.impact.riskLevel}
                  </div>
                </div>
                
                <div style={styles.stepImpact}>
                  <span>Cost: {formatCost(step.impact.costChange)}</span>
                  <span>Reversible: {step.impact.reversible ? 'Yes' : 'No'}</span>
                  <span>Downtime: {step.impact.downtime ? 'Yes' : 'No'}</span>
                </div>

                {step.resources.length > 0 && (
                  <div style={styles.resourceList}>
                    <span style={styles.resourceLabel}>Resources:</span>
                    {step.resources.slice(0, 5).map((r, i) => (
                      <code key={i} style={styles.resourceCode}>{r}</code>
                    ))}
                    {step.resources.length > 5 && (
                      <span style={styles.moreResources}>+{step.resources.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'impact' && (
          <div style={styles.impactContent}>
            <div style={styles.impactSection}>
              <h4 style={styles.sectionTitle}>Cost Impact Analysis</h4>
              <div style={styles.costBreakdown}>
                <div style={styles.costItem}>
                  <span>Immediate</span>
                  <span style={{ color: '#f9fafb' }}>$0.00</span>
                </div>
                <div style={styles.costItem}>
                  <span>Monthly</span>
                  <span style={{
                    color: plan.summary.estimatedCostImpact < 0 ? '#10b981' : '#ef4444',
                  }}>
                    {formatCost(plan.summary.estimatedCostImpact)}
                  </span>
                </div>
                <div style={styles.costItem}>
                  <span>Annual</span>
                  <span style={{
                    color: plan.summary.estimatedCostImpact < 0 ? '#10b981' : '#ef4444',
                  }}>
                    {formatCost(plan.summary.estimatedCostImpact * 12)}
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.impactSection}>
              <h4 style={styles.sectionTitle}>Risk Factors</h4>
              <div style={styles.riskFactors}>
                {plan.summary.resourcesAffected > 5 && (
                  <div style={styles.riskFactor}>
                    <span style={styles.riskFactorIcon}>⚠️</span>
                    <span>High resource count ({plan.summary.resourcesAffected})</span>
                  </div>
                )}
                {!plan.summary.reversible && (
                  <div style={styles.riskFactor}>
                    <span style={styles.riskFactorIcon}>🚨</span>
                    <span>Non-reversible action</span>
                  </div>
                )}
                {plan.steps.some(s => s.impact.downtime) && (
                  <div style={styles.riskFactor}>
                    <span style={styles.riskFactorIcon}>⏱️</span>
                    <span>May cause downtime</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diagram' && plan.visualization && (
          <div style={styles.diagramContent}>
            <div style={styles.mermaidContainer}>
              <pre style={styles.mermaidCode}>{plan.visualization}</pre>
            </div>
            <p style={styles.diagramHint}>
              Copy this Mermaid diagram to visualize the execution flow
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button
          onClick={onReject}
          style={styles.rejectButton}
          disabled={loading}
        >
          Reject
        </button>
        <button
          onClick={handleSimulate}
          style={styles.simulateButton}
          disabled={loading}
        >
          {loading ? 'Simulating...' : 'Simulate First'}
        </button>
        <button
          onClick={handleApprove}
          style={{
            ...styles.approveButton,
            opacity: loading ? 0.5 : 1,
          }}
          disabled={loading}
        >
          {loading ? 'Approving...' : 'Approve & Execute'}
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#0C1012',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    border: '1px solid rgba(6, 236, 158, 0.2)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    color: '#f8fafc',
    fontSize: '24px',
    fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
  },
  subtitle: {
    margin: '8px 0 0 0',
    color: '#94a3b8',
    fontSize: '14px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontSize: '28px',
    cursor: 'pointer',
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
  riskBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid',
    marginBottom: '24px',
  },
  riskScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '80px',
  },
  riskDetails: {
    display: 'flex',
    gap: '32px',
    flex: 1,
  },
  riskItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  riskLabel: {
    color: '#94a3b8',
    fontSize: '12px',
  },
  riskValue: {
    color: '#f8fafc',
    fontSize: '16px',
    fontWeight: 500,
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid rgba(6, 236, 158, 0.2)',
    marginBottom: '20px',
  },
  tab: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
  tabContent: {
    minHeight: '300px',
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  overviewCard: {
    backgroundColor: '#0C1012',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid rgba(6, 236, 158, 0.15)',
  },
  cardTitle: {
    margin: '0 0 12px 0',
    color: '#f8fafc',
    fontSize: '16px',
    fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
  },
  summaryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#cbd5e1',
    fontSize: '14px',
  },
  securityInfo: {
    color: '#94a3b8',
    fontSize: '13px',
  },
  blockerList: {
    color: '#fca5a5',
    fontSize: '13px',
    marginTop: '12px',
    paddingLeft: '20px',
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  stepCard: {
    backgroundColor: '#0C1012',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid rgba(6, 236, 158, 0.15)',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '12px',
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(6, 236, 158, 0.2)',
    color: '#06ec9e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    margin: 0,
    color: '#f8fafc',
    fontSize: '14px',
  },
  stepMeta: {
    margin: '4px 0 0 0',
    color: '#94a3b8',
    fontSize: '12px',
  },
  stepRisk: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
  },
  stepImpact: {
    display: 'flex',
    gap: '24px',
    color: '#94a3b8',
    fontSize: '13px',
    marginBottom: '12px',
  },
  resourceList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    alignItems: 'center',
  },
  resourceLabel: {
    color: '#94a3b8',
    fontSize: '12px',
  },
  resourceCode: {
    backgroundColor: 'rgba(6, 236, 158, 0.1)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#06ec9e',
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
  },
  moreResources: {
    color: '#64748b',
    fontSize: '12px',
  },
  impactContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  impactSection: {
    backgroundColor: '#0C1012',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid rgba(6, 236, 158, 0.15)',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    color: '#f8fafc',
    fontSize: '16px',
    fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
  },
  costBreakdown: {
    display: 'flex',
    gap: '32px',
  },
  costItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    color: '#94a3b8',
    fontSize: '14px',
  },
  riskFactors: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  riskFactor: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#cbd5e1',
    fontSize: '14px',
  },
  riskFactorIcon: {
    fontSize: '18px',
  },
  diagramContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  mermaidContainer: {
    backgroundColor: '#000000',
    borderRadius: '8px',
    padding: '16px',
    overflow: 'auto',
    border: '1px solid rgba(6, 236, 158, 0.1)',
  },
  mermaidCode: {
    margin: 0,
    color: '#e6edf3',
    fontSize: '12px',
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
    whiteSpace: 'pre-wrap' as const,
  },
  diagramHint: {
    color: '#64748b',
    fontSize: '12px',
    margin: 0,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(6, 236, 158, 0.15)',
  },
  rejectButton: {
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  simulateButton: {
    background: 'linear-gradient(135deg, #64748b, #334155)',
    color: '#f8fafc',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(100, 116, 139, 0.4)',
    transition: 'all 0.3s ease',
  },
  approveButton: {
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
};

export default ExecutionApproval;
