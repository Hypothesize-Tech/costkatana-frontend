import React, { useState, useRef, useLayoutEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Citation } from '@/services/chat.service';

interface CitationMarkerProps {
  citation: Citation;
  /** Display number — the 1-based index of this citation across the message. */
  number: number;
  /**
   * Called when the marker is clicked. Hosts use this to scroll the sources
   * panel to the matching row (or vice versa — click a source chip to scroll
   * the inline marker into view).
   */
  onActivate?: (citation: Citation) => void;
}

/**
 * Numbered pill rendered inline inside assistant markdown. On hover/focus it
 * reveals a popover with Claude's `cited_text`, the document title, and the
 * exact location (page range, char range, or content-block index) the
 * citation points at — so users can verify every claim against the source.
 */
export const CitationMarker: React.FC<CitationMarkerProps> = ({
  citation,
  number,
  onActivate,
}) => {
  const [open, setOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<'top' | 'bottom'>('top');
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // Flip the popover below the marker when there isn't enough room above
  // (e.g. citation on the first line of the message).
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPopoverPos(rect.top < 180 ? 'bottom' : 'top');
  }, [open]);

  const handleActivate = () => {
    onActivate?.(citation);
    setOpen((v) => !v);
  };

  const locationLabel = formatLocation(citation);

  return (
    <span className="citation-marker-wrapper relative inline-block align-baseline">
      <button
        ref={btnRef}
        type="button"
        onClick={handleActivate}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label={`Citation ${number}: ${citation.document.title}`}
        aria-expanded={open}
        className="inline-flex items-center justify-center min-w-[1.4em] h-[1.4em] px-[0.35em] mx-[0.15em] text-[0.72em] font-bold leading-none rounded-md bg-primary-500/15 text-primary-500 hover:bg-primary-500/25 hover:text-primary-600 dark:hover:text-primary-400 border border-primary-500/30 transition-all align-super cursor-pointer"
      >
        {number}
      </button>

      {open && (
        <span
          role="tooltip"
          className={`absolute z-50 w-80 max-w-[min(22rem,90vw)] left-1/2 -translate-x-1/2 ${
            popoverPos === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } glass rounded-xl border border-primary-200/30 backdrop-blur-xl p-3 shadow-xl text-left`}
          // Keep open while the user moves into the popover itself.
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-primary-500">
              Citation {number}
            </span>
            <span className="text-[11px] font-body text-light-text-secondary dark:text-dark-text-secondary">
              {locationLabel}
            </span>
          </div>
          <p className="text-xs font-body italic text-light-text-primary dark:text-dark-text-primary line-clamp-4 mb-2">
            &ldquo;{citation.citedText}&rdquo;
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-light-text-secondary dark:text-dark-text-secondary truncate">
              {citation.document.title}
            </span>
            {citation.document.url && (
              <a
                href={citation.document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                onClick={(e) => e.stopPropagation()}
              >
                Open
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </span>
      )}
    </span>
  );
};

function formatLocation(c: Citation): string {
  const { type, start, end } = c.location;
  if (type === 'page') {
    return start === end ? `p. ${start}` : `pp. ${start}–${end}`;
  }
  if (type === 'char') {
    return `chars ${start}–${end}`;
  }
  return `block ${start}${start !== end ? `–${end}` : ''}`;
}

export default CitationMarker;
