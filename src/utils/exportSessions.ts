/**
 * Export utilities for session data and charts
 * Supports JSON and Excel formats
 */

import * as XLSX from 'xlsx';
import { Session } from '../services/sessions.service';

export interface ChartDataPoint {
  date: string;
  count: number;
  cost: number;
  spans: number;
}

/**
 * Export chart data to JSON file
 */
export const exportChartDataToJSON = (chartData: ChartDataPoint[], filename: string = 'chart-data') => {
  const dataStr = JSON.stringify(chartData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export chart data to Excel file
 */
export const exportChartDataToExcel = (chartData: ChartDataPoint[], filename: string = 'chart-data') => {
  const worksheet = XLSX.utils.json_to_sheet(chartData.map(d => ({
    'Date': d.date,
    'Session Count': d.count,
    'Total Cost ($)': d.cost.toFixed(4),
    'Total Spans': d.spans
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Chart Data');

  XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export sessions to JSON file
 */
export const exportSessionsToJSON = (sessions: Session[], filename: string = 'sessions') => {
  const dataStr = JSON.stringify(sessions, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export sessions to Excel file
 */
export const exportSessionsToExcel = (sessions: Session[], filename: string = 'sessions') => {
  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const worksheet = XLSX.utils.json_to_sheet(sessions.map(session => {
    const duration = session.duration || 
      (session.endedAt ? new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime() : 
      Date.now() - new Date(session.startedAt).getTime());

    return {
      'Session ID': session.sessionId,
      'Label': session.label || (session.metadata as any)?.label || 'N/A',
      'Status': session.status,
      'Source': session.source || 'N/A',
      'Started': new Date(session.startedAt).toLocaleString(),
      'Duration': formatDuration(duration),
      'Spans': session.summary?.totalSpans || 0,
      'Cost ($)': (session.summary?.totalCost || 0).toFixed(4),
      'Input Tokens': session.summary?.totalTokens?.input || 0,
      'Output Tokens': session.summary?.totalTokens?.output || 0
    };
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sessions');

  XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Combined export function with format selection
 */
export const exportData = (
  data: Session[] | ChartDataPoint[],
  format: 'json' | 'excel',
  type: 'sessions' | 'chart',
  filename?: string
) => {
  const defaultFilename = type === 'sessions' ? 'sessions' : 'chart-data';
  const name = filename || defaultFilename;

  if (type === 'sessions') {
    if (format === 'json') {
      exportSessionsToJSON(data as Session[], name);
    } else {
      exportSessionsToExcel(data as Session[], name);
    }
  } else {
    if (format === 'json') {
      exportChartDataToJSON(data as ChartDataPoint[], name);
    } else {
      exportChartDataToExcel(data as ChartDataPoint[], name);
    }
  }
};

