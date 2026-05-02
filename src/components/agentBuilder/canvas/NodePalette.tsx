import React from 'react';
import {
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  CubeTransparentIcon,
  MagnifyingGlassIcon,
  CircleStackIcon,
  CodeBracketSquareIcon,
  ArrowPathRoundedSquareIcon,
  PauseCircleIcon,
  BookmarkIcon,
  PencilSquareIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import type { NodeType } from '../../../services/agentPlatform.service';
import { NODE_COLOR } from '../nodes';
import { useAgentBuilderStore } from '../../../stores/agentBuilderStore';

interface PaletteEntry {
  type: NodeType;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  group: 'Input' | 'LLM' | 'Tools' | 'Logic' | 'Memory' | 'Output';
}

const ENTRIES: PaletteEntry[] = [
  { type: 'user-message-input',       name: 'User message',     desc: 'Chat trigger',          group: 'Input',  icon: ChatBubbleLeftRightIcon },
  { type: 'webhook-input',            name: 'Webhook',          desc: 'HTTP trigger',          group: 'Input',  icon: GlobeAltIcon },
  { type: 'llm-call',                 name: 'LLM call',         desc: 'Model + prompt',        group: 'LLM',    icon: CubeTransparentIcon },
  { type: 'web-search',               name: 'Web search',       desc: 'Google CSE',            group: 'Tools',  icon: MagnifyingGlassIcon },
  { type: 'vector-store-bedrock-kb',  name: 'Knowledge base',   desc: 'Bedrock RAG',           group: 'Tools',  icon: CircleStackIcon },
  { type: 'api-call',                 name: 'API call',         desc: 'HTTP request',          group: 'Tools',  icon: CodeBracketSquareIcon },
  { type: 'if-else',                  name: 'If / else',        desc: 'Branch on condition',   group: 'Logic',  icon: ArrowPathRoundedSquareIcon },
  { type: 'checkpoint',               name: 'Checkpoint',       desc: 'Human approval',        group: 'Logic',  icon: PauseCircleIcon },
  { type: 'memory-read',              name: 'Memory read',      desc: 'Recall slot',           group: 'Memory', icon: BookmarkIcon },
  { type: 'memory-write',             name: 'Memory write',     desc: 'Persist slot',          group: 'Memory', icon: PencilSquareIcon },
  { type: 'response-output',          name: 'Response',         desc: 'Final reply',           group: 'Output', icon: ArrowRightIcon },
];

const GROUPS: PaletteEntry['group'][] = ['Input', 'LLM', 'Tools', 'Logic', 'Memory', 'Output'];

const NodePalette: React.FC<{ onDragStart?: (type: NodeType) => void }> = ({
  onDragStart,
}) => {
  const addNode = useAgentBuilderStore((s) => s.addNode);
  const existingCount = useAgentBuilderStore((s) => s.nodes.length);

  const handleDragStart = (e: React.DragEvent, type: NodeType, name: string) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify({ type, name }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(type);
  };

  const handleClick = (type: NodeType, name: string) => {
    const col = existingCount % 4;
    const row = Math.floor(existingCount / 4);
    addNode(type, name, { x: 120 + col * 240, y: 80 + row * 140 });
  };

  return (
    <aside className="w-[230px] flex-shrink-0 bg-white dark:bg-dark-bg-100 border-r border-primary-200/30 dark:border-primary-500/20 overflow-y-auto">
      <div className="px-4 py-3 border-b border-primary-200/30 dark:border-primary-500/20">
        <div className="text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
          Palette
        </div>
        <div className="text-[10px] text-secondary-400 dark:text-secondary-500 mt-0.5">
          Click or drag onto canvas
        </div>
      </div>
      {GROUPS.map((group) => (
        <section
          key={group}
          className="px-3 py-3 border-b border-primary-200/20 dark:border-primary-500/10 last:border-0"
        >
          <div className="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-2 px-1">
            {group}
          </div>
          <div className="flex flex-col gap-1">
            {ENTRIES.filter((e) => e.group === group).map((entry) => (
              <div
                key={entry.type}
                draggable
                onDragStart={(e) => handleDragStart(e, entry.type, entry.name)}
                onClick={() => handleClick(entry.type, entry.name)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer border border-transparent hover:border-primary-200/40 dark:hover:border-primary-500/20 hover:bg-light-bg-100/60 dark:hover:bg-dark-bg-200/40 transition-colors"
              >
                <span
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-white shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${NODE_COLOR[entry.type]}, ${NODE_COLOR[entry.type]}cc)`,
                  }}
                >
                  <entry.icon className="w-3 h-3" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-secondary-800 dark:text-secondary-100 truncate">
                    {entry.name}
                  </div>
                  <div className="text-[10px] text-secondary-500 dark:text-secondary-400 truncate">
                    {entry.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </aside>
  );
};

export default NodePalette;
