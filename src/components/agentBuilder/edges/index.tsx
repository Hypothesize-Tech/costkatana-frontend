import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
} from '@xyflow/react';

const DEFAULT_EDGE_COLOR = '#06ec9e'; // CostKatana primary

export const DefaultEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
  data,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 18,
  });

  const stroke = (data as { color?: string })?.color ?? DEFAULT_EDGE_COLOR;
  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        stroke,
        strokeWidth: selected ? 2 : 1.4,
        opacity: selected ? 1 : 0.78,
        filter: selected ? `drop-shadow(0 0 6px ${stroke})` : undefined,
      }}
    />
  );
};

export const LabeledBranchEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
  label,
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 18,
  });

  const stroke = label === 'true' ? '#06ec9e' : '#f43f5e';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke,
          strokeWidth: selected ? 2 : 1.4,
          opacity: selected ? 1 : 0.85,
          filter: selected ? `drop-shadow(0 0 6px ${stroke})` : undefined,
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono"
          >
            <span
              className="px-1.5 py-0.5 rounded border bg-white dark:bg-dark-bg-100"
              style={{
                color: stroke,
                borderColor: stroke,
              }}
            >
              {label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export const EDGE_TYPES = {
  default: DefaultEdge,
  'labeled-branch': LabeledBranchEdge,
};
