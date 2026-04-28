import React from 'react';
import { ToolCallCard, ToolCallCardData } from './ToolCallCard';

interface Props {
  calls: ToolCallCardData[];
}

/**
 * Vertical stack of tool-call cards. Rendered between the thinking block and
 * the main answer body so the LLM's tool activity stays visible but quiet.
 */
export const ToolCallsList: React.FC<Props> = ({ calls }) => {
  if (!calls?.length) return null;
  return (
    <div className="flex flex-col gap-1.5 mb-3">
      {calls.map((c) => (
        <ToolCallCard key={c.id} call={c} />
      ))}
    </div>
  );
};

export default ToolCallsList;
