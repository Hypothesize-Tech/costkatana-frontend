import { useEffect, useMemo, useState } from 'react';
import { PromptTemplateService } from '@/services/promptTemplate.service';
import type { TemplateVersion } from '@/types/promptTemplate.types';

interface PromptVersionHistoryProps {
  templateId: string;
  refreshKey?: number;
  onPinned?: () => void;
}

interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  oldLine?: number;
  newLine?: number;
}

export const PromptVersionHistory: React.FC<PromptVersionHistoryProps> = ({
  templateId,
  refreshKey,
  onPinned,
}) => {
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diff, setDiff] = useState<{ from: number; to: number; lines: DiffLine[] } | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    PromptTemplateService.getTemplateVersions(templateId)
      .then((v) => {
        if (!cancelled) {
          setVersions(v);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load versions');
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [templateId, refreshKey]);

  const sorted = useMemo(
    () => [...versions].sort((a, b) => b.version - a.version),
    [versions],
  );

  const showDiff = async (from: number, to: number) => {
    setDiffLoading(true);
    try {
      const d = await PromptTemplateService.getTemplateVersionDiff(templateId, from, to);
      setDiff(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load diff');
    } finally {
      setDiffLoading(false);
    }
  };

  const pin = async (version: number) => {
    try {
      await PromptTemplateService.pinTemplateVersion(templateId, version);
      onPinned?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to pin');
    }
  };

  if (loading) {
    return (
      <div className="text-xs text-secondary-500 dark:text-secondary-400 px-2 py-4">
        Loading versions…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-danger-600 dark:text-danger-400 px-2 py-4">
        {error}
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="text-xs text-secondary-500 dark:text-secondary-400 px-2 py-4">
        No versions yet. Save a change to create the first version.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {sorted.map((v, idx) => {
          const previous = sorted[idx + 1];
          return (
            <li
              key={v._id ?? `${v.templateId}-${v.version}`}
              className="rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100 dark:bg-dark-bg-100 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-50">
                    v{v.version}
                  </span>
                  <span className="text-[11px] text-secondary-500 dark:text-secondary-400">
                    {new Date(v.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {previous && (
                    <button
                      type="button"
                      onClick={() => showDiff(previous.version, v.version)}
                      className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline"
                      disabled={diffLoading}
                    >
                      Diff vs v{previous.version}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => pin(v.version)}
                    className="text-[11px] px-2 py-1 rounded border border-primary-200/30 dark:border-primary-500/20 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  >
                    Pin
                  </button>
                </div>
              </div>
              {v.changelog && (
                <div className="text-[11px] text-secondary-600 dark:text-secondary-300 mt-1">
                  {v.changelog}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {diff && (
        <div className="rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100 dark:bg-dark-bg-100 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-secondary-700 dark:text-secondary-200">
              Diff: v{diff.from} → v{diff.to}
            </span>
            <button
              type="button"
              onClick={() => setDiff(null)}
              className="text-[11px] text-secondary-500 dark:text-secondary-400 hover:underline"
            >
              Close
            </button>
          </div>
          <pre className="text-[11px] font-mono leading-relaxed max-h-72 overflow-auto">
            {diff.lines.map((line, i) => (
              <div
                key={i}
                className={
                  line.type === 'add'
                    ? 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-200'
                    : line.type === 'remove'
                      ? 'bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-200'
                      : 'text-secondary-600 dark:text-secondary-300'
                }
              >
                <span className="select-none mr-2">
                  {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                </span>
                {line.content || ' '}
              </div>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PromptVersionHistory;
