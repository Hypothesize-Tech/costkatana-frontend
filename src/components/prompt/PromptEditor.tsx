import { useEffect, useState } from 'react';
import { PromptTemplateService } from '@/services/promptTemplate.service';

interface PromptEditorProps {
  templateId: string;
  initialContent: string;
  onSaved?: (newVersionNumber: number) => void;
  agentId?: string;
  nodeId?: string;
  minHeight?: string;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  templateId,
  initialContent,
  onSaved,
  agentId,
  nodeId,
  minHeight = '160px',
}) => {
  const [content, setContent] = useState(initialContent);
  const [changeNote, setChangeNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent, templateId]);

  const dirty = content !== initialContent;

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    setError(null);
    try {
      const v = await PromptTemplateService.createTemplateVersion(templateId, {
        content,
        changeNote: changeNote || undefined,
        agentId,
        nodeId,
      });
      setChangeNote('');
      onSaved?.(v.version);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save version');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        className="w-full rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100 dark:bg-dark-bg-100 px-3 py-2 text-sm font-mono text-secondary-900 dark:text-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
        style={{ minHeight }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="System prompt content…"
        spellCheck={false}
      />
      <input
        type="text"
        className="w-full rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100 dark:bg-dark-bg-100 px-3 py-1.5 text-xs text-secondary-900 dark:text-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
        value={changeNote}
        onChange={(e) => setChangeNote(e.target.value)}
        placeholder="Change note (optional)"
        maxLength={1000}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-secondary-500 dark:text-secondary-400">
          {dirty ? 'Unsaved changes' : 'Up to date'}
        </span>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-500 text-white disabled:opacity-50 hover:bg-primary-600 transition-colors"
        >
          {saving ? 'Saving…' : 'Save as new version'}
        </button>
      </div>
      {error && (
        <div className="text-[11px] text-danger-600 dark:text-danger-400">
          {error}
        </div>
      )}
    </div>
  );
};

export default PromptEditor;
