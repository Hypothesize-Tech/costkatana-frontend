import React from 'react';
import { Handle, Position } from '@xyflow/react';

export interface NodeShellProps {
  selected?: boolean;
  /** Tailwind utility for the accent ring (e.g. `from-primary-500 to-emerald-500`). */
  accentClass: string;
  /** Inline color used for handles + the badge text/border. */
  accentColor: string;
  badge: string; // INPUT / LLM / TOOL / LOGIC / HUMAN / OUTPUT
  icon: React.ReactNode;
  title: string;
  fields?: Array<{ label: string; value: React.ReactNode }>;
  hideLeft?: boolean;
  hideRight?: boolean;
  /** Optional second output handle (for if-else true/false). */
  rightHandles?: Array<{ id: string; label: string; offsetY: number }>;
}

const NodeShell: React.FC<NodeShellProps> = ({
  selected,
  accentClass,
  accentColor,
  badge,
  icon,
  title,
  fields,
  hideLeft,
  hideRight,
  rightHandles,
}) => {
  return (
    <div
      className={[
        'relative rounded-xl border min-w-[180px] transition-all duration-150 select-none overflow-hidden',
        'bg-white dark:bg-dark-bg-100 shadow-lg',
        selected
          ? 'border-primary-500 dark:border-primary-400 shadow-primary-500/20'
          : 'border-primary-200/40 dark:border-primary-500/20',
      ].join(' ')}
    >
      {!hideLeft && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: 'var(--xy-bg, #ffffff)',
            border: `2px solid ${accentColor}`,
            width: 11,
            height: 11,
          }}
        />
      )}
      {!hideRight && !rightHandles && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: 'var(--xy-bg, #ffffff)',
            border: `2px solid ${accentColor}`,
            width: 11,
            height: 11,
          }}
        />
      )}
      {!hideRight &&
        rightHandles?.map((h) => (
          <Handle
            key={h.id}
            id={h.id}
            type="source"
            position={Position.Right}
            style={{
              background: 'var(--xy-bg, #ffffff)',
              border: `2px solid ${accentColor}`,
              width: 11,
              height: 11,
              top: h.offsetY,
            }}
          >
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] tracking-wider whitespace-nowrap font-medium"
              style={{ color: accentColor }}
            >
              {h.label}
            </span>
          </Handle>
        ))}

      {/* Top accent bar */}
      <div className={`h-[3px] bg-gradient-to-r ${accentClass}`} />

      <div className="flex items-center gap-2 px-3 py-2 border-b border-primary-200/30 dark:border-primary-500/15 bg-light-bg-100/40 dark:bg-dark-bg-200/40">
        <div
          className={`w-6 h-6 rounded-md bg-gradient-to-br ${accentClass} flex items-center justify-center text-white shadow-sm`}
        >
          {icon}
        </div>
        <span className="font-display text-xs font-semibold text-secondary-900 dark:text-secondary-50 truncate">
          {title}
        </span>
        <span
          className="ml-auto text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border font-medium"
          style={{ color: accentColor, borderColor: `${accentColor}55` }}
        >
          {badge}
        </span>
      </div>
      <div className="px-3 py-2 space-y-1">
        {(fields ?? []).map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-[10px] text-secondary-600 dark:text-secondary-300 font-mono"
          >
            <span className="text-secondary-400 dark:text-secondary-500">{f.label}:</span>
            <span className="text-secondary-800 dark:text-secondary-100 truncate">
              {f.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodeShell;
