import React from 'react';
import type { Citation } from '@/services/chat.service';
import { CitationMarker } from './CitationMarker';

/**
 * Citation marker sentinel token injected into markdown before it reaches
 * ReactMarkdown. Chosen for its low collision risk: the brackets are rare
 * Unicode brackets (U+27E6 / U+27E7) that don't conflict with markdown syntax
 * or normal English punctuation.
 */
const TOKEN_OPEN = '⟦cite:';
const TOKEN_CLOSE = '⟧';
export const CITATION_TOKEN_REGEX = /⟦cite:(\d+)⟧/g;

/**
 * Normalize the assistant message content + its citations into a display
 * structure. The assistant message is a single concatenated string (joining
 * Claude's text blocks). Offsets in each citation are relative to their
 * `textBlockIndex` — we convert them to absolute offsets by tracking block
 * start positions inside the joined string.
 *
 * NOTE: We rely on the backend joining text blocks without separators. If
 * that ever changes, update `blockStartOffsets` here to match.
 */
export function injectCitationTokens(
  content: string,
  citations: Citation[] | undefined,
): { text: string; numbered: Array<Citation & { number: number }> } {
  if (!citations || citations.length === 0) {
    return { text: content, numbered: [] };
  }

  // Assign stable 1-based numbers in the order Claude emitted the citations.
  const numbered = citations.map((c, i) => ({ ...c, number: i + 1 }));

  // Build per-block start offsets in the joined content. We do a best-effort
  // reconstruction: walk the content char-by-char, treating each paragraph
  // break (double newline) as a possible block boundary. Anthropic's text
  // blocks are typically paragraph-aligned, but this is heuristic.
  const blockStarts = computeBlockStartOffsets(content, citations);

  // Collect insertion points. For each citation with resolved offsets,
  // compute the absolute position inside `content`. For unresolved (-1)
  // offsets, append at the end of the block.
  const insertions: Array<{ pos: number; number: number }> = [];
  for (const c of numbered) {
    const base = blockStarts[c.textBlockIndex] ?? 0;
    let pos: number;
    if (c.endOffset >= 0) {
      pos = base + c.endOffset;
    } else {
      const nextBlockStart = blockStarts[c.textBlockIndex + 1];
      pos = typeof nextBlockStart === 'number' ? nextBlockStart : content.length;
    }
    // Try to snap to a cited_text match near `pos` when available — the
    // backend's offset resolution is pre-markdown, so when markdown added
    // characters (bold asterisks etc.) we may be a few chars off.
    if (c.citedText) {
      const snapped = snapToCitedText(content, c.citedText, pos);
      if (snapped >= 0) pos = snapped;
    }
    insertions.push({ pos: Math.min(Math.max(pos, 0), content.length), number: c.number });
  }

  // Insert tokens from the end backward so earlier positions stay valid.
  insertions.sort((a, b) => b.pos - a.pos);
  let out = content;
  for (const ins of insertions) {
    out = `${out.slice(0, ins.pos)}${TOKEN_OPEN}${ins.number}${TOKEN_CLOSE}${out.slice(ins.pos)}`;
  }

  return { text: out, numbered };
}

/**
 * Recursively walk ReactMarkdown children, splitting any string that contains
 * citation tokens into alternating text + CitationMarker elements.
 */
export function interpolateCitationMarkers(
  children: React.ReactNode,
  numbered: Array<Citation & { number: number }>,
  onActivate?: (c: Citation) => void,
): React.ReactNode {
  if (numbered.length === 0) return children;

  const byNumber = new Map<number, Citation & { number: number }>();
  for (const c of numbered) byNumber.set(c.number, c);

  const walk = (node: React.ReactNode, keyPrefix: string): React.ReactNode => {
    if (typeof node === 'string') {
      if (!node.includes(TOKEN_OPEN)) return node;
      const parts: React.ReactNode[] = [];
      let lastIdx = 0;
      let match: RegExpExecArray | null;
      const re = new RegExp(CITATION_TOKEN_REGEX.source, 'g');
      while ((match = re.exec(node)) !== null) {
        if (match.index > lastIdx) {
          parts.push(node.slice(lastIdx, match.index));
        }
        const n = Number(match[1]);
        const cit = byNumber.get(n);
        if (cit) {
          parts.push(
            <CitationMarker
              key={`${keyPrefix}-cit-${n}-${match.index}`}
              citation={cit}
              number={n}
              onActivate={onActivate}
            />,
          );
        }
        lastIdx = match.index + match[0].length;
      }
      if (lastIdx < node.length) parts.push(node.slice(lastIdx));
      return parts;
    }
    if (Array.isArray(node)) {
      return node.map((child, i) => walk(child, `${keyPrefix}-${i}`));
    }
    if (React.isValidElement(node)) {
      const el = node as React.ReactElement<{ children?: React.ReactNode }>;
      const kids = el.props?.children;
      if (kids === undefined) return node;
      return React.cloneElement(el, {
        ...el.props,
        children: walk(kids, `${keyPrefix}-${el.key ?? 'k'}`),
      });
    }
    return node;
  };

  return walk(children, 'cm');
}

/** Compute absolute start offsets for each text block index in the joined
 *  content. If the joined content has N text blocks but we don't know where
 *  their boundaries are, we fall back to paragraph breaks as delimiters. */
function computeBlockStartOffsets(content: string, citations: Citation[]): number[] {
  const maxBlock = citations.reduce((m, c) => Math.max(m, c.textBlockIndex), 0);
  if (maxBlock === 0) return [0];

  // Heuristic: split on paragraph boundaries (\n\n). If the paragraph count
  // matches the number of blocks, each paragraph is its own block.
  const paragraphs: number[] = [0];
  const re = /\n\n/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    paragraphs.push(m.index + m[0].length);
  }
  if (paragraphs.length >= maxBlock + 1) {
    return paragraphs.slice(0, maxBlock + 1);
  }
  // Not enough paragraph breaks — fall back to single block at offset 0.
  const offsets: number[] = [];
  for (let i = 0; i <= maxBlock; i++) offsets.push(0);
  return offsets;
}

/** Snap an insertion position to the end of the nearest `cited_text`
 *  occurrence inside `content`, preferring positions ≤ the candidate. */
function snapToCitedText(
  content: string,
  citedText: string,
  approximate: number,
): number {
  if (citedText.length < 3) return -1;
  // Search window ±200 chars around the candidate.
  const lo = Math.max(0, approximate - 200);
  const hi = Math.min(content.length, approximate + 200);
  const window = content.slice(lo, hi);
  const idx = window.indexOf(citedText);
  if (idx < 0) return -1;
  return lo + idx + citedText.length;
}
