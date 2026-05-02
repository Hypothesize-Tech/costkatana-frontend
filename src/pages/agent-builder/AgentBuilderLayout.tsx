import React from 'react';
import { NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import {
  HomeIcon,
  Squares2X2Icon,
  SparklesIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';

const TABS = [
  { to: '/agent-builder',                label: 'Agents',          icon: HomeIcon, end: true },
  { to: '/agent-builder/templates',      label: 'Templates',       icon: Squares2X2Icon },
  { to: '/agent-builder/text-to-agent',  label: 'Text → Agent',    icon: SparklesIcon },
  { to: '/agent-builder/knowledge-base', label: 'Knowledge base',  icon: CircleStackIcon },
];

/**
 * Renders inside the main CostKatana Layout (sidebar + topbar). Provides a
 * lightweight tab bar for the three top-level agent-builder sub-pages, and
 * defers fully to the page itself when the user drills into a specific agent
 * (the canvas chrome takes over).
 */
const AgentBuilderLayout: React.FC = () => {
  const location = useLocation();
  const params = useParams();
  // Hide the tab bar once the user enters a specific agent — those pages
  // (builder, trace, checkpoint, deploy) need the full viewport.
  const inAgentDetail = !!params.agentId;
  const showTabs = !inAgentDetail;

  return (
    <div className="min-h-full">
      {showTabs && (
        <div className="bg-gradient-light-ambient dark:bg-gradient-dark-ambient pt-2 sm:pt-4 px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {TABS.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) =>
                    [
                      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      isActive
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                        : 'glass border border-primary-200/30 dark:border-primary-500/20 text-secondary-700 dark:text-secondary-200 hover:border-primary-400/60',
                    ].join(' ')
                  }
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
      <Outlet />
    </div>
  );
};

export default AgentBuilderLayout;
