import React, { useState, useEffect } from 'react';
import { Play, Square, Save, Plus, Trash2, Edit3, BarChart3, FileText, Lightbulb, Search, BookOpen } from 'lucide-react';
import NotebookService, { Notebook, NotebookCell, NotebookExecution } from '../../services/notebook.service';
import { ModernHeatmap } from './ModernHeatmap';

interface InteractiveNotebookProps {
  notebookId?: string;
  onSave?: (notebook: Notebook) => void;
  className?: string;
}

export const InteractiveNotebook: React.FC<InteractiveNotebookProps> = ({
  notebookId,
  onSave,
  className = ''
}) => {
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [execution, setExecution] = useState<NotebookExecution | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<any>(null);
  const [showDrillDownModal, setShowDrillDownModal] = useState(false);

  // Simple markdown renderer for insights
  const renderMarkdown = (text: string) => {
    if (!text) return <span>{text}</span>;

    const htmlContent = text
      .replace(/### (.*?)(?=\n|$)/g, '<h3 class="text-lg font-display font-bold gradient-text-primary mt-4 mb-2">$1</h3>')
      .replace(/## (.*?)(?=\n|$)/g, '<h2 class="text-xl font-display font-bold gradient-text-primary mt-4 mb-2">$1</h2>')
      .replace(/# (.*?)(?=\n|$)/g, '<h1 class="text-2xl font-display font-bold gradient-text-primary mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-display font-semibold gradient-text-primary">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic font-body text-light-text-secondary dark:text-dark-text-secondary">$1</em>')
      .replace(/- (.*?)(?=\n|$)/g, '<li class="ml-4 mb-1 font-body text-light-text-primary dark:text-dark-text-primary">• $1</li>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  useEffect(() => {
    if (notebookId) {
      loadNotebook();
    }
  }, [notebookId]);

  const loadNotebook = async () => {
    if (!notebookId) return;

    setLoading(true);
    try {
      const loadedNotebook = await NotebookService.getNotebook(notebookId);
      setNotebook(loadedNotebook);
    } catch (error) {
      console.error('Failed to load notebook:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeNotebook = async () => {
    if (!notebook) return;

    setIsExecuting(true);
    try {
      const executionResult = await NotebookService.executeNotebook(notebook.id);
      setExecution(executionResult);

      // Poll for completion if still running
      if (executionResult.status === 'running') {
        pollExecution(executionResult.execution_id);
      }
    } catch (error) {
      console.error('Failed to execute notebook:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const pollExecution = async (executionId: string) => {
    const poll = async () => {
      try {
        const result = await NotebookService.getExecution(executionId);
        setExecution(result);

        if (result.status === 'running') {
          setTimeout(poll, 2000); // Poll every 2 seconds
        }
      } catch (error) {
        console.error('Failed to poll execution:', error);
      }
    };

    poll();
  };

  const saveNotebook = async () => {
    if (!notebook) return;

    try {
      const updated = await NotebookService.updateNotebook(notebook.id, notebook);
      setNotebook(updated);
      onSave?.(updated);
    } catch (error) {
      console.error('Failed to save notebook:', error);
    }
  };

  const addCell = (type: NotebookCell['type'], index?: number) => {
    if (!notebook) return;

    const newCell: NotebookCell = {
      id: `cell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: getDefaultContent(type),
      metadata: {}
    };

    const cells = [...notebook.cells];
    const insertIndex = index !== undefined ? index + 1 : cells.length;
    cells.splice(insertIndex, 0, newCell);

    setNotebook({ ...notebook, cells });
  };

  const updateCell = (cellId: string, updates: Partial<NotebookCell>) => {
    if (!notebook) return;

    const cells = notebook.cells.map(cell =>
      cell.id === cellId ? { ...cell, ...updates } : cell
    );

    setNotebook({ ...notebook, cells });
  };

  const deleteCell = (cellId: string) => {
    if (!notebook) return;

    const cells = notebook.cells.filter(cell => cell.id !== cellId);
    setNotebook({ ...notebook, cells });
  };

  const getDefaultContent = (type: NotebookCell['type']): string => {
    switch (type) {
      case 'markdown':
        return '# New Section\n\nAdd your analysis notes here...';
      case 'query':
        return 'What are my most expensive operations today?';
      case 'visualization':
        return 'cost_timeline';
      case 'insight':
        return 'analyze_cost_spike';
      default:
        return '';
    }
  };

  const getCellIcon = (type: NotebookCell['type']) => {
    switch (type) {
      case 'markdown': return FileText;
      case 'query': return Search;
      case 'visualization': return BarChart3;
      case 'insight': return Lightbulb;
      default: return FileText;
    }
  };

  const getCellTypeColor = (type: NotebookCell['type']) => {
    switch (type) {
      case 'markdown': return 'bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300';
      case 'query': return 'bg-gradient-primary/20 text-primary-700 dark:text-primary-300';
      case 'visualization': return 'bg-gradient-success/20 text-success-700 dark:text-success-300';
      case 'insight': return 'bg-gradient-accent/20 text-accent-700 dark:text-accent-300';
      default: return 'bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300';
    }
  };

  const renderCellOutput = (cell: NotebookCell) => {
    if (!execution?.results[cell.id]) return null;

    const result = execution.results[cell.id];

    switch (result.type) {
      case 'query_result':
        return (
          <div className="mt-6 glass p-6 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">📊</span>
                </div>
                <span className="font-display font-semibold gradient-text-primary">Query Results</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="px-3 py-1 rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 font-display font-medium">
                  {result.total_count || result.results?.length || 0} records
                </span>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary">•</span>
                <span className="px-3 py-1 rounded-full bg-gradient-success/20 text-success-700 dark:text-success-300 font-display font-medium">
                  {result.execution_time}ms
                </span>
              </div>
            </div>

            {result.parsed_query && (
              <div className="mb-4 glass p-4 rounded-lg border border-accent-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-accent flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs">🔍</span>
                  </div>
                  <span className="font-display font-semibold gradient-text-accent text-sm">Parsed Query:</span>
                </div>
                <code className="font-mono text-sm bg-accent-100/50 dark:bg-accent-900/50 p-2 rounded block gradient-text-primary">
                  {result.parsed_query}
                </code>
              </div>
            )}

            {result.results && result.results.length > 0 ? (
              <div className="space-y-2">
                {result.results.map((item: any, index: number) => (
                  <div key={index} className="glass p-4 rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl hover:border-primary-300/50 transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <span className="font-display font-semibold gradient-text-primary text-lg">
                          {item.operation_name || item.service_name || 'Unknown Operation'}
                        </span>
                        {item.timestamp && (
                          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {item.cost_usd && (
                          <span className="font-display font-bold gradient-text-success text-lg">
                            ${item.cost_usd.toFixed(4)}
                          </span>
                        )}
                        {item.duration_ms && (
                          <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">{item.duration_ms}ms</div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.status && (
                        <span className={`px-3 py-1 rounded-full font-display font-medium text-sm ${item.status === 'success' ? 'bg-gradient-success/20 text-success-700 dark:text-success-300' :
                          item.status === 'error' ? 'bg-gradient-danger/20 text-danger-700 dark:text-danger-300' :
                            'bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300'
                          }`}>
                          {item.status}
                        </span>
                      )}
                      {item.gen_ai_model && (
                        <span className="px-3 py-1 bg-gradient-accent/20 text-accent-700 dark:text-accent-300 rounded-full font-display font-medium text-sm">
                          {item.gen_ai_model}
                        </span>
                      )}
                      {item.http_method && (
                        <span className="px-3 py-1 bg-gradient-primary/20 text-primary-700 dark:text-primary-300 rounded-full font-display font-medium text-sm">
                          {item.http_method}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {result.total_count > result.results.length && (
                  <div className="text-center mt-4">
                    <span className="px-4 py-2 rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 font-display font-medium text-sm">
                      Showing {result.results.length} of {result.total_count} results
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-secondary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔍</span>
                </div>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">No results found for this query</p>
              </div>
            )}

            {result.insights && Array.isArray(result.insights) && result.insights.length > 0 && (
              <div className="mt-4 glass p-4 rounded-xl border border-warning-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-warning flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs">💡</span>
                  </div>
                  <span className="font-display font-semibold gradient-text-warning">AI Insights:</span>
                </div>
                <div className="space-y-2">
                  {result.insights.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-warning-500 mt-1">•</span>
                      <span className="font-body text-light-text-primary dark:text-dark-text-primary">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.insights && !Array.isArray(result.insights) && (
              <div className="mt-4 glass p-4 rounded-xl border border-warning-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-warning flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs">💡</span>
                  </div>
                  <span className="font-display font-semibold gradient-text-warning">AI Insights:</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-warning-500 mt-1">•</span>
                  <span className="font-body text-light-text-primary dark:text-dark-text-primary">{String(result.insights)}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'visualization':
        return (
          <div className="mt-6 glass p-6 rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-semibold gradient-text-success">
                Visualization: {result.chart_type || 'Chart'}
              </span>
            </div>

            {result.data && (result.data.labels || result.data.datasets) ? (
              <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl p-6">
                {result.chart_type === 'pie' || result.chart_type === 'doughnut' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Enhanced Pie Chart */}
                    <div className="flex items-center justify-center">
                      <div className="relative w-64 h-64 glass rounded-xl p-4">
                        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                          {(() => {
                            const data = result.data.datasets[0]?.data || [];
                            const total = data.reduce((sum: number, value: number) => sum + value, 0);
                            let currentAngle = 0;
                            const colors = result.data.datasets[0]?.backgroundColor || [
                              '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
                            ];

                            return data.map((value: number, index: number) => {
                              const percentage = (value / total) * 100;
                              const angle = (value / total) * 360;
                              const startAngle = currentAngle;
                              const endAngle = currentAngle + angle;
                              currentAngle += angle;

                              // Calculate path for pie slice
                              const startAngleRad = (startAngle * Math.PI) / 180;
                              const endAngleRad = (endAngle * Math.PI) / 180;
                              const radius = 80;
                              const centerX = 100;
                              const centerY = 100;

                              const x1 = centerX + radius * Math.cos(startAngleRad);
                              const y1 = centerY + radius * Math.sin(startAngleRad);
                              const x2 = centerX + radius * Math.cos(endAngleRad);
                              const y2 = centerY + radius * Math.sin(endAngleRad);

                              const largeArcFlag = angle > 180 ? 1 : 0;

                              const pathData = [
                                `M ${centerX} ${centerY}`,
                                `L ${x1} ${y1}`,
                                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                'Z'
                              ].join(' ');

                              return (
                                <path
                                  key={index}
                                  d={pathData}
                                  fill={colors[index] || '#3b82f6'}
                                  stroke="white"
                                  strokeWidth="2"
                                  className="hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                  <title>{`${result.data.labels[index]}: ${value} (${percentage.toFixed(1)}%)`}</title>
                                </path>
                              );
                            });
                          })()}
                        </svg>

                        {/* Center label */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800">
                              {result.data.datasets[0]?.data?.reduce((sum: number, value: number) => sum + value, 0) || 0}
                            </div>
                            <div className="text-sm text-gray-600">Total</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Legend and Data */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-display font-bold gradient-text-primary mb-4">Operation Distribution</h3>
                      {result.data.labels.map((label: string, index: number) => {
                        const value = result.data.datasets[0]?.data?.[index] || 0;
                        const total = result.data.datasets[0]?.data?.reduce((sum: number, val: number) => sum + val, 0) || 1;
                        const percentage = ((value / total) * 100).toFixed(1);
                        const color = result.data.datasets[0]?.backgroundColor?.[index] || '#3b82f6';

                        return (
                          <div key={index} className="flex items-center justify-between p-4 glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl hover:border-primary-300/50 transition-all duration-300 hover:scale-[1.02]">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                              <div>
                                <div className="font-display font-semibold gradient-text-primary">
                                  {label.split('.').pop() || label}
                                </div>
                                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                  {label.includes('.') ? label.split('.').slice(0, -1).join('.') : 'Operation'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-display font-bold gradient-text-primary">{value.toLocaleString()}</div>
                              <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">{percentage}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : result.chart_type === 'line' || result.chart_type === 'bar' ? (
                  <div>
                    <div className="h-48 relative">
                      <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                        {result.data.datasets[0]?.data?.slice(0, 8).map((value: number, index: number) => (
                          <div key={index} className="flex flex-col items-center">
                            <div
                              className="bg-blue-500 rounded-t"
                              style={{
                                height: `${Math.max(8, (value / Math.max(...result.data.datasets[0].data)) * 120)}px`,
                                width: '20px'
                              }}
                            />
                            <span className="text-xs mt-1 text-center">
                              {result.data.labels?.[index] || `${index + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <span className="px-4 py-2 rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 font-display font-medium">
                        {result.data.datasets[0]?.label || 'Data'}
                      </span>
                    </div>
                  </div>
                ) : result.chart_type === 'heatmap' ? (
                  <ModernHeatmap
                    data={result.data}
                    onCellClick={(cellData) => {
                      setSelectedHeatmapCell(cellData);
                      setShowDrillDownModal(true);
                    }}
                  />





                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-success/20 flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-success-600" />
                      </div>
                      <span className="font-display font-semibold gradient-text-success text-lg">Chart: {result.chart_type}</span>
                      <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">
                        {result.data.labels?.length || result.data.labels?.x?.length || 0} data points
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 glass rounded-xl border border-primary-200/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-secondary-600" />
                  </div>
                  <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">No visualization data available</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'insights':
        return (
          <div className="mt-6 glass p-6 rounded-xl border border-accent-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-lg">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div className="text-xl font-display font-bold gradient-text-accent">AI Insights</div>
            </div>

            <div className="space-y-4">
              {/* Handle nested insights object */}
              {result.insights && typeof result.insights === 'object' && result.insights.insights ? (
                Array.isArray(result.insights.insights) ? (
                  result.insights.insights.map((insight: string, index: number) => (
                    <div key={index} className="glass p-4 rounded-lg border border-accent-200/30 shadow-lg backdrop-blur-xl hover:border-accent-300/50 transition-all duration-300">
                      <div className="prose prose-sm max-w-none">
                        {renderMarkdown(insight)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass p-4 rounded-lg border border-accent-200/30 shadow-lg backdrop-blur-xl">
                    <div className="prose prose-sm max-w-none">
                      {renderMarkdown(String(result.insights.insights))}
                    </div>
                  </div>
                )
              ) : result.insights && Array.isArray(result.insights) ? (
                result.insights.map((insight: string, index: number) => (
                  <div key={index} className="glass p-4 rounded-lg border border-accent-200/30 shadow-lg backdrop-blur-xl hover:border-accent-300/50 transition-all duration-300">
                    <div className="prose prose-sm max-w-none">
                      {renderMarkdown(insight)}
                    </div>
                  </div>
                ))
              ) : result.insights && typeof result.insights === 'string' ? (
                <div className="glass p-4 rounded-lg border border-accent-200/30">
                  <div className="prose prose-sm max-w-none">
                    {renderMarkdown(result.insights)}
                  </div>
                </div>
              ) : (
                <div className="glass p-4 rounded-lg border border-accent-200/30 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-accent/20 flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl">🤔</span>
                  </div>
                  <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">No insights available</div>
                </div>
              )}
            </div>

            {/* Handle nested recommendations */}
            {result.insights && typeof result.insights === 'object' && result.insights.recommendations && Array.isArray(result.insights.recommendations) && (
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Search className="w-3 h-3 text-white" />
                  </div>
                  <div className="font-display font-semibold gradient-text">AI Recommendations:</div>
                </div>
                <div className="space-y-2">
                  {result.insights.recommendations.slice(0, 5).map((rec: string, index: number) => (
                    <div key={index} className="glass p-3 rounded-lg border border-primary-200/30 hover:border-primary-300/50 transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center mt-1">
                          <span className="text-white text-xs">→</span>
                        </div>
                        <div className="prose prose-sm max-w-none flex-1">
                          {renderMarkdown(rec)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Handle direct recommendations */}
            {result.recommendations && Array.isArray(result.recommendations) && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-4 h-4 text-purple-600" />
                  <div className="text-md font-semibold text-purple-800">Recommendations:</div>
                </div>
                <div className="space-y-2">
                  {result.recommendations.slice(0, 5).map((rec: string, index: number) => (
                    <div key={index} className="glass p-3 rounded-lg border border-primary-200/30 hover:border-primary-300/50 transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center mt-1">
                          <span className="text-white text-xs">→</span>
                        </div>
                        <div className="prose prose-sm max-w-none flex-1">
                          {renderMarkdown(rec)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="mt-6 glass p-6 rounded-xl border border-danger-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
                <span className="text-white text-sm">⚠️</span>
              </div>
              <span className="font-display font-semibold gradient-text-danger">Error</span>
            </div>
            <div className="font-body text-light-text-primary dark:text-dark-text-primary">{result.message}</div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">📓</span>
          </div>
          <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">Loading notebook...</div>
        </div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-secondary/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">No notebook selected</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel ${className}`}>
      {/* Enhanced Notebook Header */}
      <div className="p-6 border-b border-primary-200/30 bg-gradient-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold gradient-text-primary">{notebook.title}</h2>
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mt-2">{notebook.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="px-3 py-1 rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 font-display font-medium">
                  📊 {notebook.cells?.length || 0} cells
                </span>
                <span className="px-3 py-1 rounded-full bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 font-display font-medium">
                  ⏱️ {new Date().toLocaleDateString()}
                </span>
                {execution && (
                  <span className={`px-3 py-1 rounded-full font-display font-medium ${execution.status === 'completed' ? 'bg-gradient-success/20 text-success-700 dark:text-success-300' :
                    execution.status === 'failed' ? 'bg-gradient-danger/20 text-danger-700 dark:text-danger-300' :
                      'bg-gradient-warning/20 text-warning-700 dark:text-warning-300'
                    }`}>
                    {execution.status === 'completed' ? '✅ Completed' :
                      execution.status === 'failed' ? '❌ Failed' :
                        '🔄 Running'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveNotebook}
              className="btn-secondary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={executeNotebook}
              disabled={isExecuting}
              className={`btn-primary flex items-center gap-2 ${isExecuting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isExecuting ? (
                <>
                  <Square className="w-4 h-4 animate-pulse" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run All
                </>
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Execution Status */}
        {execution && execution.execution_time_ms && (
          <div className="mt-4 glass p-4 rounded-lg border border-success-200/30 shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-success flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs">⚡</span>
                </div>
                <span className="font-display font-semibold gradient-text-success">
                  Execution completed in {execution.execution_time_ms}ms
                </span>
              </div>
              {execution.status === 'completed' && (
                <span className="px-3 py-1 rounded-full bg-gradient-success/20 text-success-700 dark:text-success-300 font-display font-medium text-sm">
                  ✅ {execution.execution_time_ms}ms
                </span>
              )}
            </div>
            {execution.error && (
              <div className="mt-3 p-3 glass rounded-lg border border-danger-200/30">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-danger flex items-center justify-center">
                    <span className="text-white text-xs">⚠</span>
                  </div>
                  <span className="font-body text-light-text-primary dark:text-dark-text-primary">{execution.error}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notebook Cells */}
      <div className="p-6">
        <div className="space-y-6">
          {notebook.cells.map((cell, index) => {
            const Icon = getCellIcon(cell.type);
            const isEditing = editingCell === cell.id;

            return (
              <div key={cell.id} className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                {/* Cell Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-primary/5 border-b border-primary-200/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary/20 flex items-center justify-center shadow-lg">
                      <Icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className={`px-3 py-1 rounded-full font-display font-medium ${getCellTypeColor(cell.type)}`}>
                      {cell.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingCell(isEditing ? null : cell.id)}
                      className="w-8 h-8 rounded-lg glass border border-primary-200/30 flex items-center justify-center text-light-text-tertiary dark:text-dark-text-tertiary hover:text-primary-500 hover:border-primary-200/50 transition-all duration-300 hover:scale-110"
                      title="Edit cell"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCell(cell.id)}
                      className="w-8 h-8 rounded-lg glass border border-primary-200/30 flex items-center justify-center text-light-text-tertiary dark:text-dark-text-tertiary hover:text-danger-500 hover:border-danger-200/50 transition-all duration-300 hover:scale-110"
                      title="Delete cell"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => addCell('markdown', index)}
                      className="w-8 h-8 rounded-lg glass border border-primary-200/30 flex items-center justify-center text-light-text-tertiary dark:text-dark-text-tertiary hover:text-success-500 hover:border-success-200/50 transition-all duration-300 hover:scale-110"
                      title="Add cell below"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cell Content */}
                <div className="p-6">
                  {isEditing ? (
                    <textarea
                      value={cell.content}
                      onChange={(e) => updateCell(cell.id, { content: e.target.value })}
                      className="input w-full h-32 resize-none"
                      placeholder={`Enter ${cell.type} content...`}
                    />
                  ) : (
                    <div className="min-h-[2rem]">
                      {cell.type === 'markdown' ? (
                        <div className="prose prose-sm max-w-none">
                          {cell.content.split('\n').map((line, i) => (
                            <p key={i} className="font-body text-light-text-primary dark:text-dark-text-primary">{line}</p>
                          ))}
                        </div>
                      ) : (
                        <div className="glass p-4 rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl">
                          <code className="font-mono text-sm gradient-text-primary block">
                            {cell.content}
                          </code>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cell Output */}
                  {renderCellOutput(cell)}
                </div>
              </div>
            );
          })}

          {/* Add Cell Buttons */}
          <div className="glass p-6 rounded-xl border-2 border-dashed border-primary-200/50 shadow-lg backdrop-blur-xl text-center">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => addCell('markdown')}
                className="flex items-center gap-2 px-4 py-3 glass rounded-lg border border-secondary-200/30 shadow-lg backdrop-blur-xl text-secondary-600 hover:text-secondary-800 hover:border-secondary-300/50 transition-all duration-300 hover:scale-105"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-secondary/20 flex items-center justify-center shadow-lg">
                  <FileText className="w-3 h-3" />
                </div>
                <span className="font-display font-medium">Markdown</span>
              </button>
              <button
                onClick={() => addCell('query')}
                className="flex items-center gap-2 px-4 py-3 glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl text-primary-600 hover:text-primary-800 hover:border-primary-300/50 transition-all duration-300 hover:scale-105"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-primary/20 flex items-center justify-center shadow-lg">
                  <Search className="w-3 h-3" />
                </div>
                <span className="font-display font-medium">Query</span>
              </button>
              <button
                onClick={() => addCell('visualization')}
                className="flex items-center gap-2 px-4 py-3 glass rounded-lg border border-success-200/30 shadow-lg backdrop-blur-xl text-success-600 hover:text-success-800 hover:border-success-300/50 transition-all duration-300 hover:scale-105"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-success/20 flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-3 h-3" />
                </div>
                <span className="font-display font-medium">Chart</span>
              </button>
              <button
                onClick={() => addCell('insight')}
                className="flex items-center gap-2 px-4 py-3 glass rounded-lg border border-accent-200/30 shadow-lg backdrop-blur-xl text-accent-600 hover:text-accent-800 hover:border-accent-300/50 transition-all duration-300 hover:scale-105"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-accent/20 flex items-center justify-center shadow-lg">
                  <Lightbulb className="w-3 h-3" />
                </div>
                <span className="font-display font-medium">Insight</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drill-Down Modal */}
      {showDrillDownModal && selectedHeatmapCell && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-display font-bold gradient-text-primary">
                    {selectedHeatmapCell.day} {selectedHeatmapCell.timeSlot}
                  </h2>
                  <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mt-2">Detailed usage analysis for this time period</p>
                </div>
                <button
                  onClick={() => setShowDrillDownModal(false)}
                  className="w-10 h-10 rounded-lg glass border border-primary-200/30 flex items-center justify-center text-light-text-tertiary dark:text-dark-text-tertiary hover:text-danger-500 hover:border-danger-200/50 transition-all duration-300 hover:scale-110"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="glass p-6 rounded-xl border border-primary-200/30 text-center">
                  <div className="text-4xl font-display font-bold gradient-text-primary mb-2">{selectedHeatmapCell.requests}</div>
                  <div className="font-display font-semibold text-primary-700 dark:text-primary-300">Total Requests</div>
                  <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">API calls made</div>
                </div>
                <div className="glass p-6 rounded-xl border border-success-200/30 text-center">
                  <div className="text-4xl font-display font-bold gradient-text-success mb-2">${selectedHeatmapCell.cost}</div>
                  <div className="font-display font-semibold text-success-700 dark:text-success-300">Total Cost</div>
                  <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    ${(selectedHeatmapCell.cost / selectedHeatmapCell.requests).toFixed(4)} per request
                  </div>
                </div>
                <div className="glass p-6 rounded-xl border border-danger-200/30 text-center">
                  <div className="text-4xl font-display font-bold gradient-text-danger mb-2">{selectedHeatmapCell.errorRate}%</div>
                  <div className="font-display font-semibold text-danger-700 dark:text-danger-300">Error Rate</div>
                  <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">{selectedHeatmapCell.errors} failed requests</div>
                </div>
                <div className="glass p-6 rounded-xl border border-accent-200/30 text-center">
                  <div className="text-4xl font-display font-bold gradient-text-accent mb-2">{selectedHeatmapCell.avgDuration}ms</div>
                  <div className="font-display font-semibold text-accent-700 dark:text-accent-300">Avg Duration</div>
                  <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">Response time</div>
                </div>
              </div>

              {/* Performance Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Top Operations */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Operation</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-white rounded border">
                      <div>
                        <div className="font-medium text-gray-900">{selectedHeatmapCell.topOperation}</div>
                        <div className="text-sm text-gray-600">Primary operation</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">{selectedHeatmapCell.topOperationCount}</div>
                        <div className="text-xs text-gray-500">requests</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Insights */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Insights</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${selectedHeatmapCell.errorRate > 5 ? 'bg-red-500' : selectedHeatmapCell.errorRate > 2 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                      <span className="text-sm">
                        {selectedHeatmapCell.errorRate > 5 ? 'High error rate - needs attention' :
                          selectedHeatmapCell.errorRate > 2 ? 'Moderate error rate - monitor closely' :
                            'Low error rate - performing well'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${selectedHeatmapCell.avgDuration > 500 ? 'bg-red-500' : selectedHeatmapCell.avgDuration > 200 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                      <span className="text-sm">
                        {selectedHeatmapCell.avgDuration > 500 ? 'Slow response times - optimize performance' :
                          selectedHeatmapCell.avgDuration > 200 ? 'Moderate response times - room for improvement' :
                            'Fast response times - excellent performance'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${selectedHeatmapCell.requests > 50 ? 'bg-green-500' : selectedHeatmapCell.requests > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm">
                        {selectedHeatmapCell.requests > 50 ? 'High traffic period - peak usage' :
                          selectedHeatmapCell.requests > 20 ? 'Moderate traffic - normal usage' :
                            'Low traffic period - minimal usage'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Optimization Recommendations</h3>
                <div className="space-y-2">
                  {selectedHeatmapCell.errorRate > 5 && (
                    <div className="flex items-start gap-2">
                      <span className="text-red-500">⚠️</span>
                      <span className="text-sm">High error rate detected. Review logs and implement error handling improvements.</span>
                    </div>
                  )}
                  {selectedHeatmapCell.avgDuration > 300 && (
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-500">⏱️</span>
                      <span className="text-sm">Response times could be improved. Consider caching or performance optimization.</span>
                    </div>
                  )}
                  {selectedHeatmapCell.cost / selectedHeatmapCell.requests > 0.1 && (
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">💰</span>
                      <span className="text-sm">High cost per request. Review pricing models and usage patterns.</span>
                    </div>
                  )}
                  {selectedHeatmapCell.requests > 100 && (
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500">📈</span>
                      <span className="text-sm">High traffic period. Consider scaling resources during this time.</span>
                    </div>
                  )}
                  {selectedHeatmapCell.errorRate <= 2 && selectedHeatmapCell.avgDuration <= 200 && (
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✅</span>
                      <span className="text-sm">Excellent performance! This time period is operating optimally.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDrillDownModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Detailed query for this time period will be implemented in future versions
                    console.log('Querying detailed data for:', selectedHeatmapCell);
                  }}
                  className="btn-primary"
                >
                  View Detailed Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveNotebook;

