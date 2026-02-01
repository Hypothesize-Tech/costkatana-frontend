import React, { useState } from 'react';
import {
  ArrowPathIcon,
  BeakerIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { ragEvalService, type RAGEvalResponse, type RAGEvalDatasetItem, type RAGPatternType } from '../../services/ragEval.service';
import { useNotification } from '../../contexts/NotificationContext';

const PATTERNS: { value: RAGPatternType; label: string }[] = [
  { value: 'naive', label: 'Naive' },
  { value: 'adaptive', label: 'Adaptive' },
  { value: 'iterative', label: 'Iterative' },
  { value: 'recursive', label: 'Recursive' },
];

const METRIC_LABELS: Record<keyof RAGEvalResponse['aggregate']['mean'], string> = {
  contextRelevance: 'Context Relevance',
  answerFaithfulness: 'Answer Faithfulness',
  answerRelevance: 'Answer Relevance',
  retrievalPrecision: 'Retrieval Precision',
  retrievalRecall: 'Retrieval Recall',
  overall: 'Overall',
};

export const RAGEvalDashboardComponent: React.FC = () => {
  const [dataset, setDataset] = useState<RAGEvalDatasetItem[]>([
    { question: '' },
    { question: '' },
  ]);
  const [pattern, setPattern] = useState<RAGPatternType>('adaptive');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RAGEvalResponse | null>(null);
  const { showNotification } = useNotification();

  const addRow = () => {
    if (dataset.length >= 50) {
      showNotification('Maximum 50 questions per run', 'warning');
      return;
    }
    setDataset((prev) => [...prev, { question: '' }]);
  };

  const removeRow = (index: number) => {
    if (dataset.length <= 1) return;
    setDataset((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: 'question' | 'groundTruth', value: string) => {
    setDataset((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const runEval = async () => {
    const valid = dataset.filter((r) => r.question.trim());
    if (valid.length === 0) {
      showNotification('Add at least one question', 'error');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const response = await ragEvalService.evaluate({
        dataset: valid.map((r) => ({ question: r.question.trim(), groundTruth: r.groundTruth?.trim() || undefined })),
        pattern,
      });
      setResult(response);
      showNotification(`Evaluated ${response.totalSamples} samples`, 'success');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = e?.response?.data?.message || e?.message || 'RAG evaluation failed';
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold gradient-text-primary mb-2">RAG Evaluation</h2>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Run RAGAS-aligned metrics (faithfulness, relevancy, context precision/recall) on your knowledge base
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border shadow-xl glass backdrop-blur-xl border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6">
        <h3 className="text-lg font-display font-bold gradient-text-primary mb-4">Dataset</h3>
        <div className="space-y-3 mb-4">
          {dataset.map((row, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-2 sm:items-start">
              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  placeholder="Question"
                  value={row.question}
                  onChange={(e) => updateRow(index, 'question', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-primary-200/50 dark:border-primary-500/30 bg-white/80 dark:bg-dark-card/80 text-light-text-primary dark:text-dark-text-primary font-body text-sm placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
                <input
                  type="text"
                  placeholder="Ground truth (optional)"
                  value={row.groundTruth ?? ''}
                  onChange={(e) => updateRow(index, 'groundTruth', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-primary-200/50 dark:border-primary-500/30 bg-white/80 dark:bg-dark-card/80 text-light-text-primary dark:text-dark-text-primary font-body text-sm placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeRow(index)}
                disabled={dataset.length <= 1}
                className="p-2 rounded-lg border border-primary-200/30 dark:border-primary-500/20 text-light-text-secondary dark:text-dark-text-secondary hover:bg-danger-500/10 hover:text-danger-600 dark:hover:text-danger-400 hover:border-danger-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Remove row"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            type="button"
            onClick={addRow}
            disabled={dataset.length >= 50}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary-200/30 dark:border-primary-500/20 text-primary-600 dark:text-primary-400 font-display font-semibold hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all disabled:opacity-50"
          >
            <PlusIcon className="w-5 h-5" />
            Add question
          </button>
          <label className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <span className="font-display font-semibold">Pattern:</span>
            <select
              value={pattern}
              onChange={(e) => setPattern(e.target.value as RAGPatternType)}
              className="px-3 py-2 rounded-lg border border-primary-200/50 dark:border-primary-500/30 bg-white/80 dark:bg-dark-card/80 text-light-text-primary dark:text-dark-text-primary font-body text-sm focus:ring-2 focus:ring-primary-500/50"
            >
              {PATTERNS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          onClick={runEval}
          disabled={loading}
          className="px-4 py-2.5 bg-gradient-primary text-white rounded-lg font-display font-semibold hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 shadow-lg glow-primary transition-all duration-200"
        >
          <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Running evaluation...' : 'Run evaluation'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Aggregate cards */}
          <div className="rounded-xl border shadow-xl glass backdrop-blur-xl border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6">
            <h3 className="text-lg font-display font-bold gradient-text-primary mb-4">Aggregate metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {(Object.keys(METRIC_LABELS) as (keyof RAGEvalResponse['aggregate']['mean'])[]).map((key) => (
                <div
                  key={key}
                  className="p-3 rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50"
                >
                  <p className="text-xs font-display text-light-text-secondary dark:text-dark-text-secondary truncate" title={METRIC_LABELS[key]}>
                    {METRIC_LABELS[key]}
                  </p>
                  <p className="text-lg font-display font-bold gradient-text-primary mt-1">
                    {(result.aggregate.mean[key] ?? 0).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-3">
              {result.totalSamples} samples, {result.failedSamples} failed
            </p>
          </div>

          {/* Per-sample table */}
          <div className="rounded-xl border shadow-xl glass backdrop-blur-xl border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden">
            <h3 className="text-lg font-display font-bold gradient-text-primary p-4 sm:p-6 pb-0">Per-sample results</h3>
            <div className="overflow-x-auto p-4 sm:p-6">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-primary-200/30 dark:border-primary-500/20">
                    <th className="text-left py-2 px-2 text-light-text-secondary dark:text-dark-text-secondary font-display font-semibold">#</th>
                    <th className="text-left py-2 px-2 text-light-text-secondary dark:text-dark-text-secondary font-display font-semibold">Question</th>
                    <th className="text-left py-2 px-2 text-light-text-secondary dark:text-dark-text-secondary font-display font-semibold">Answer</th>
                    <th className="text-left py-2 px-2 text-light-text-secondary dark:text-dark-text-secondary font-display font-semibold">Overall</th>
                    <th className="text-left py-2 px-2 text-light-text-secondary dark:text-dark-text-secondary font-display font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((row, i) => (
                    <tr key={i} className="border-b border-primary-100/30 dark:border-primary-600/20 last:border-0">
                      <td className="py-2 px-2 text-light-text-secondary dark:text-dark-text-secondary">{i + 1}</td>
                      <td className="py-2 px-2 text-light-text-primary dark:text-dark-text-primary max-w-[200px] truncate" title={row.question}>
                        {row.question}
                      </td>
                      <td className="py-2 px-2 text-light-text-primary dark:text-dark-text-primary max-w-[240px] truncate" title={row.answer}>
                        {row.answer || '—'}
                      </td>
                      <td className="py-2 px-2">
                        <span className="font-display font-semibold text-primary-600 dark:text-primary-400">
                          {(row.metrics.overall ?? 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        {row.success ? (
                          <CheckCircleIcon className="w-5 h-5 text-success-500 dark:text-success-400" title="Success" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-danger-500 dark:text-danger-400" title="Failed" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-primary-200/30 dark:border-primary-500/20 glass backdrop-blur-xl">
          <BeakerIcon className="w-16 h-16 text-primary-500/50 dark:text-primary-400/50 mb-4" />
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">Add questions and run evaluation to see RAGAS-aligned metrics</p>
        </div>
      )}
    </div>
  );
};
