import React from 'react';
import { LinkIcon } from '@heroicons/react/24/outline';

export interface SourceChipItem {
  title: string;
  url: string;
  description?: string;
}

interface Props {
  sources: SourceChipItem[];
  max?: number;
}

/**
 * Compact row of clickable source pills. Used inside tool-call cards and for
 * web-search results. Keeps the styling muted so it doesn't overpower the
 * answer body.
 */
export const SourceChips: React.FC<Props> = ({ sources, max = 8 }) => {
  if (!sources?.length) return null;
  const visible = sources.slice(0, max);
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {visible.map((s, i) => {
        let host = s.url;
        try {
          host = new URL(s.url).hostname.replace(/^www\./, '');
        } catch {
          /* keep raw url */
        }
        return (
          <a
            key={`${s.url}-${i}`}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-secondary-200/70 dark:border-secondary-700/60 bg-white/40 dark:bg-dark-card/40 hover:bg-primary-50/60 hover:border-primary-300/50 dark:hover:bg-primary-900/20 dark:hover:border-primary-600/50 px-2 py-0.5 text-[11px] font-medium text-secondary-700 dark:text-secondary-300 transition-colors"
            title={s.title}
          >
            <LinkIcon className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[160px]">{host}</span>
          </a>
        );
      })}
      {sources.length > max && (
        <span className="inline-flex items-center px-2 py-0.5 text-[11px] text-secondary-500 dark:text-secondary-400">
          +{sources.length - max} more
        </span>
      )}
    </div>
  );
};

export default SourceChips;
