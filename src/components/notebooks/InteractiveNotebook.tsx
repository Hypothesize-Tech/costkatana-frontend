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
      .replace(/### (.*?)(?=\n|$)/g, '<h3 class="text-lg font-bold text-purple-800 mt-4 mb-2">$1</h3>')
      .replace(/## (.*?)(?=\n|$)/g, '<h2 class="text-xl font-bold text-purple-800 mt-4 mb-2">$1</h2>')
      .replace(/# (.*?)(?=\n|$)/g, '<h1 class="text-2xl font-bold text-purple-800 mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-purple-800">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/- (.*?)(?=\n|$)/g, '<li class="ml-4 mb-1">• $1</li>')
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
      case 'markdown': return 'bg-gray-100 text-gray-700';
      case 'query': return 'bg-blue-100 text-blue-700';
      case 'visualization': return 'bg-green-100 text-green-700';
      case 'insight': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderCellOutput = (cell: NotebookCell) => {
    if (!execution?.results[cell.id]) return null;

    const result = execution.results[cell.id];

    switch (result.type) {
      case 'query_result':
        return (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-blue-800">Query Results</span>
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <span>{result.total_count || result.results?.length || 0} records</span>
                <span>•</span>
                <span>{result.execution_time}ms</span>
              </div>
            </div>

            {result.parsed_query && (
              <div className="mb-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
                <strong>Query:</strong> {result.parsed_query}
              </div>
            )}

            {result.results && result.results.length > 0 ? (
              <div className="space-y-2">
                {result.results.map((item: any, index: number) => (
                  <div key={index} className="p-3 bg-white rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-gray-900">
                          {item.operation_name || item.service_name || 'Unknown Operation'}
                        </span>
                        {item.timestamp && (
                          <div className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {item.cost_usd && (
                          <span className="text-green-600 font-medium">
                            ${item.cost_usd.toFixed(4)}
                          </span>
                        )}
                        {item.duration_ms && (
                          <div className="text-xs text-gray-600">{item.duration_ms}ms</div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {item.status && (
                        <span className={`px-2 py-1 rounded-full ${item.status === 'success' ? 'bg-green-100 text-green-700' :
                          item.status === 'error' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                          {item.status}
                        </span>
                      )}
                      {item.gen_ai_model && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                          {item.gen_ai_model}
                        </span>
                      )}
                      {item.http_method && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {item.http_method}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {result.total_count > result.results.length && (
                  <div className="text-center text-sm text-blue-600 mt-2">
                    Showing {result.results.length} of {result.total_count} results
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No results found for this query
              </div>
            )}

            {result.insights && Array.isArray(result.insights) && result.insights.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-sm font-medium text-yellow-800 mb-2">AI Insights:</div>
                {result.insights.map((insight: string, index: number) => (
                  <div key={index} className="text-sm text-yellow-700 mb-1">• {insight}</div>
                ))}
              </div>
            )}
            {result.insights && !Array.isArray(result.insights) && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-sm font-medium text-yellow-800 mb-2">AI Insights:</div>
                <div className="text-sm text-yellow-700">• {String(result.insights)}</div>
              </div>
            )}
          </div>
        );

      case 'visualization':
        return (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm font-medium text-green-800 mb-3">
              Visualization: {result.chart_type || 'Chart'}
            </div>

            {result.data && (result.data.labels || result.data.datasets) ? (
              <div className="bg-white rounded border p-4">
                {result.chart_type === 'pie' || result.chart_type === 'doughnut' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Enhanced Pie Chart */}
                    <div className="flex items-center justify-center">
                      <div className="relative w-64 h-64">
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
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Operation Distribution</h3>
                      {result.data.labels.map((label: string, index: number) => {
                        const value = result.data.datasets[0]?.data?.[index] || 0;
                        const total = result.data.datasets[0]?.data?.reduce((sum: number, val: number) => sum + val, 0) || 1;
                        const percentage = ((value / total) * 100).toFixed(1);
                        const color = result.data.datasets[0]?.backgroundColor?.[index] || '#3b82f6';

                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-800">
                                  {label.split('.').pop() || label}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {label.includes('.') ? label.split('.').slice(0, -1).join('.') : 'Operation'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-800">{value.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">{percentage}%</div>
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
                    <div className="mt-2 text-center text-sm text-gray-600">
                      {result.data.datasets[0]?.label || 'Data'}
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
                      <BarChart3 className="w-16 h-16 text-green-400 mx-auto mb-2" />
                      <span className="text-green-600">Chart: {result.chart_type}</span>
                      <div className="text-sm text-gray-500 mt-1">
                        {result.data.labels?.length || result.data.labels?.x?.length || 0} data points
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 bg-white rounded border flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <div>No visualization data available</div>
                </div>
              </div>
            )}
          </div>
        );

      case 'insights':
        return (
          <div className="mt-4 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <div className="text-lg font-semibold text-purple-800">AI Insights</div>
            </div>

            <div className="space-y-4">
              {/* Handle nested insights object */}
              {result.insights && typeof result.insights === 'object' && result.insights.insights ? (
                Array.isArray(result.insights.insights) ? (
                  result.insights.insights.map((insight: string, index: number) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
                      <div className="prose prose-sm max-w-none text-purple-700">
                        {renderMarkdown(insight)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
                    <div className="prose prose-sm max-w-none text-purple-700">
                      {renderMarkdown(String(result.insights.insights))}
                    </div>
                  </div>
                )
              ) : result.insights && Array.isArray(result.insights) ? (
                result.insights.map((insight: string, index: number) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
                    <div className="prose prose-sm max-w-none text-purple-700">
                      {renderMarkdown(insight)}
                    </div>
                  </div>
                ))
              ) : result.insights && typeof result.insights === 'string' ? (
                <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
                  <div className="prose prose-sm max-w-none text-purple-700">
                    {renderMarkdown(result.insights)}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
                  <div className="text-sm text-purple-700">No insights available</div>
                </div>
              )}
            </div>

            {/* Handle nested recommendations */}
            {result.insights && typeof result.insights === 'object' && result.insights.recommendations && Array.isArray(result.insights.recommendations) && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-4 h-4 text-purple-600" />
                  <div className="text-md font-semibold text-purple-800">AI Recommendations:</div>
                </div>
                <div className="space-y-2">
                  {result.insights.recommendations.slice(0, 5).map((rec: string, index: number) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-purple-500 font-bold mt-1">→</span>
                        <div className="prose prose-sm max-w-none text-purple-700 flex-1">
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
                    <div key={index} className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-purple-500 font-bold mt-1">→</span>
                        <div className="prose prose-sm max-w-none text-purple-700 flex-1">
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
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm font-medium text-red-800">Error</div>
            <div className="text-sm text-red-700">{result.message}</div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading notebook...</div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No notebook selected</div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-lg ${className}`}>
      {/* Enhanced Notebook Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{notebook.title}</h2>
              <p className="text-gray-600 mt-1">{notebook.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>📊 {notebook.cells?.length || 0} cells</span>
                <span>⏱️ Last updated: {new Date().toLocaleDateString()}</span>
                {execution && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${execution.status === 'completed' ? 'bg-green-100 text-green-700' :
                    execution.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
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
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={executeNotebook}
              disabled={isExecuting}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-2 rounded-lg transition-all shadow-sm font-medium"
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
          <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                ⚡ Execution completed in {execution.execution_time_ms}ms
              </span>
              {execution.status === 'completed' && (
                <span className="text-sm text-gray-600">
                  Completed in {execution.execution_time_ms}ms
                </span>
              )}
            </div>
            {execution.error && (
              <div className="mt-2 text-sm text-red-600">{execution.error}</div>
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
              <div key={cell.id} className="border border-gray-200 rounded-lg">
                {/* Cell Header */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCellTypeColor(cell.type)}`}>
                      {cell.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingCell(isEditing ? null : cell.id)}
                      className="p-1 text-gray-500 hover:text-gray-700 rounded"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCell(cell.id)}
                      className="p-1 text-gray-500 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => addCell('markdown', index)}
                      className="p-1 text-gray-500 hover:text-gray-700 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cell Content */}
                <div className="p-4">
                  {isEditing ? (
                    <textarea
                      value={cell.content}
                      onChange={(e) => updateCell(cell.id, { content: e.target.value })}
                      className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter ${cell.type} content...`}
                    />
                  ) : (
                    <div className="min-h-[2rem]">
                      {cell.type === 'markdown' ? (
                        <div className="prose prose-sm max-w-none">
                          {cell.content.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      ) : (
                        <div className="font-mono text-sm bg-gray-100 p-3 rounded">
                          {cell.content}
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
          <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <button
              onClick={() => addCell('markdown')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              Markdown
            </button>
            <button
              onClick={() => addCell('query')}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
              Query
            </button>
            <button
              onClick={() => addCell('visualization')}
              className="flex items-center gap-2 px-3 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Chart
            </button>
            <button
              onClick={() => addCell('insight')}
              className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              Insight
            </button>
          </div>
        </div>
      </div>

      {/* Drill-Down Modal */}
      {showDrillDownModal && selectedHeatmapCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedHeatmapCell.day} {selectedHeatmapCell.timeSlot}
                  </h2>
                  <p className="text-gray-600">Detailed usage analysis for this time period</p>
                </div>
                <button
                  onClick={() => setShowDrillDownModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600">{selectedHeatmapCell.requests}</div>
                  <div className="text-sm text-blue-800">Total Requests</div>
                  <div className="text-xs text-gray-600 mt-1">API calls made</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600">${selectedHeatmapCell.cost}</div>
                  <div className="text-sm text-green-800">Total Cost</div>
                  <div className="text-xs text-gray-600 mt-1">
                    ${(selectedHeatmapCell.cost / selectedHeatmapCell.requests).toFixed(4)} per request
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-600">{selectedHeatmapCell.errorRate}%</div>
                  <div className="text-sm text-red-800">Error Rate</div>
                  <div className="text-xs text-gray-600 mt-1">{selectedHeatmapCell.errors} failed requests</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-600">{selectedHeatmapCell.avgDuration}ms</div>
                  <div className="text-sm text-purple-800">Avg Duration</div>
                  <div className="text-xs text-gray-600 mt-1">Response time</div>
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
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Detailed query for this time period will be implemented in future versions
                    console.log('Querying detailed data for:', selectedHeatmapCell);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
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

