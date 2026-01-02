import React, { useState, useEffect } from 'react';
import { awsService, AuditLogEntry } from '../../services/aws.service';

interface AWSAuditViewerProps {
  connectionId?: string;
}

export const AWSAuditViewer: React.FC<AWSAuditViewerProps> = ({ connectionId }) => {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    eventType: '',
    startDate: '',
    endDate: '',
  });
  const [anchorData, setAnchorData] = useState<any>(null);
  const [chainVerification, setChainVerification] = useState<any>(null);

  const limit = 20;

  useEffect(() => {
    loadAuditLogs();
    loadAnchorData();
  }, [page, filters, connectionId]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const result = await awsService.getAuditLogs({
        connectionId,
        eventType: filters.eventType || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        limit,
        offset: page * limit,
      });
      setEntries(result.entries);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const loadAnchorData = async () => {
    try {
      const data = await awsService.getAuditAnchor();
      setAnchorData(data);
    } catch (err) {
      console.error('Failed to load anchor data:', err);
    }
  };

  const verifyChain = async () => {
    try {
      const result = await awsService.verifyAuditChain();
      setChainVerification(result);
    } catch (err) {
      setChainVerification({ valid: false, error: 'Verification failed' });
    }
  };

  const getEventTypeColor = (eventType: string): string => {
    if (eventType.includes('created') || eventType.includes('completed')) return '#10b981';
    if (eventType.includes('failed') || eventType.includes('denied')) return '#ef4444';
    if (eventType.includes('blocked') || eventType.includes('cancelled')) return '#f59e0b';
    return '#3b82f6';
  };

  const getResultBadge = (result: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      success: { bg: '#064e3b', text: '#6ee7b7' },
      failure: { bg: '#7f1d1d', text: '#fca5a5' },
      blocked: { bg: '#78350f', text: '#fcd34d' },
      pending: { bg: '#1e3a5f', text: '#93c5fd' },
    };
    const style = colors[result] || colors.pending;
    
    return (
      <span style={{
        backgroundColor: style.bg,
        color: style.text,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 500,
      }}>
        {result}
      </span>
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const eventTypes = [
    'connection_created', 'connection_deleted',
    'intent_parsed', 'plan_generated', 'plan_approved', 'plan_rejected',
    'execution_started', 'execution_completed', 'execution_failed',
    'kill_switch_activated', 'permission_denied', 'simulation_executed',
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Audit Log</h2>
        <div style={styles.headerActions}>
          <button onClick={verifyChain} style={styles.verifyButton}>
            Verify Chain Integrity
          </button>
        </div>
      </div>

      {/* Chain Integrity Status */}
      {anchorData && (
        <div style={styles.integrityBanner}>
          <div style={styles.integrityItem}>
            <span style={styles.integrityLabel}>Chain Position</span>
            <span style={styles.integrityValue}>{anchorData.chainPosition}</span>
          </div>
          <div style={styles.integrityItem}>
            <span style={styles.integrityLabel}>Total Anchors</span>
            <span style={styles.integrityValue}>{anchorData.totalAnchors}</span>
          </div>
          {anchorData.latestAnchor && (
            <div style={styles.integrityItem}>
              <span style={styles.integrityLabel}>Latest Anchor</span>
              <span style={styles.integrityValue}>
                {anchorData.latestAnchor.anchorHash.substring(0, 12)}...
              </span>
            </div>
          )}
          {chainVerification && (
            <div style={{
              ...styles.verificationResult,
              backgroundColor: chainVerification.valid ? '#064e3b' : '#7f1d1d',
            }}>
              {chainVerification.valid 
                ? `✓ Chain verified (${chainVerification.entriesChecked} entries)`
                : `✗ Chain broken at position ${chainVerification.brokenAt}`
              }
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div style={styles.filters}>
        <select
          value={filters.eventType}
          onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
          style={styles.filterSelect}
        >
          <option value="">All Event Types</option>
          {eventTypes.map((type) => (
            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
          ))}
        </select>
        
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          style={styles.filterInput}
          placeholder="Start Date"
        />
        
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          style={styles.filterInput}
          placeholder="End Date"
        />
        
        <button
          onClick={() => setFilters({ eventType: '', startDate: '', endDate: '' })}
          style={styles.clearButton}
        >
          Clear
        </button>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Audit Log Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Timestamp</th>
              <th style={styles.th}>Event Type</th>
              <th style={styles.th}>Result</th>
              <th style={styles.th}>Details</th>
              <th style={styles.th}>Hash</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={styles.loadingCell}>Loading...</td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.emptyCell}>No audit logs found</td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.entryId} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={styles.timestamp}>{formatDate(entry.timestamp)}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.eventType,
                      color: getEventTypeColor(entry.eventType),
                    }}>
                      {entry.eventType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {getResultBadge(entry.result)}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.details}>
                      {entry.action?.service && (
                        <span>Service: {entry.action.service}</span>
                      )}
                      {entry.action?.planId && (
                        <span>Plan: {entry.action.planId.substring(0, 12)}...</span>
                      )}
                      {entry.impact?.resourceCount && (
                        <span>Resources: {entry.impact.resourceCount}</span>
                      )}
                      {entry.error && (
                        <span style={styles.errorText}>{entry.error}</span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <code style={styles.hash}>{entry.entryId.substring(0, 16)}...</code>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={styles.pagination}>
        <span style={styles.paginationInfo}>
          Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}
        </span>
        <div style={styles.paginationButtons}>
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            style={{
              ...styles.pageButton,
              opacity: page === 0 ? 0.5 : 1,
            }}
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={(page + 1) * limit >= total}
            style={{
              ...styles.pageButton,
              opacity: (page + 1) * limit >= total ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#0C1012',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid rgba(6, 236, 158, 0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    color: '#f8fafc',
    fontSize: '20px',
    fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  verifyButton: {
    background: 'linear-gradient(135deg, #64748b, #334155)',
    color: '#f8fafc',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 600,
    boxShadow: '0 4px 15px rgba(100, 116, 139, 0.4)',
    transition: 'all 0.3s ease',
  },
  integrityBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    backgroundColor: '#0C1012',
    padding: '16px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid rgba(6, 236, 158, 0.15)',
  },
  integrityItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  integrityLabel: {
    color: '#94a3b8',
    fontSize: '12px',
  },
  integrityValue: {
    color: '#f8fafc',
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
  },
  verificationResult: {
    marginLeft: 'auto',
    padding: '8px 16px',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
  },
  filterSelect: {
    backgroundColor: 'rgba(12, 16, 18, 0.8)',
    border: '2px solid rgba(6, 236, 158, 0.2)',
    borderRadius: '8px',
    padding: '8px 12px',
    color: '#f8fafc',
    fontSize: '14px',
    minWidth: '180px',
    transition: 'all 0.3s ease',
  },
  filterInput: {
    backgroundColor: 'rgba(12, 16, 18, 0.8)',
    border: '2px solid rgba(6, 236, 158, 0.2)',
    borderRadius: '8px',
    padding: '8px 12px',
    color: '#f8fafc',
    fontSize: '14px',
    transition: 'all 0.3s ease',
  },
  clearButton: {
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: '1px solid rgba(6, 236, 158, 0.3)',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
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
  tableContainer: {
    overflow: 'auto',
    borderRadius: '8px',
    border: '1px solid rgba(6, 236, 158, 0.15)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    backgroundColor: '#0C1012',
    color: '#94a3b8',
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    borderBottom: '1px solid rgba(6, 236, 158, 0.15)',
  },
  tr: {
    borderBottom: '1px solid rgba(6, 236, 158, 0.1)',
  },
  td: {
    padding: '12px 16px',
    color: '#cbd5e1',
    fontSize: '14px',
    verticalAlign: 'top' as const,
  },
  loadingCell: {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#94a3b8',
  },
  emptyCell: {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#64748b',
  },
  timestamp: {
    color: '#94a3b8',
    fontSize: '13px',
    whiteSpace: 'nowrap' as const,
  },
  eventType: {
    fontWeight: 500,
    textTransform: 'capitalize' as const,
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '13px',
    color: '#94a3b8',
  },
  errorText: {
    color: '#fca5a5',
  },
  hash: {
    backgroundColor: 'rgba(6, 236, 158, 0.1)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#06ec9e',
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(6, 236, 158, 0.15)',
  },
  paginationInfo: {
    color: '#94a3b8',
    fontSize: '14px',
  },
  paginationButtons: {
    display: 'flex',
    gap: '8px',
  },
  pageButton: {
    background: 'linear-gradient(135deg, #64748b, #334155)',
    color: '#f8fafc',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.3s ease',
  },
};

export default AWSAuditViewer;
