import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { NavLink, useLocation } from 'react-router-dom';
import { usePopper } from 'react-popper';
import {
  XMarkIcon,
  HomeIcon,
  CircleStackIcon,
  LightBulbIcon,
  UserIcon,
  FolderIcon,
  DocumentTextIcon,
  BellIcon,
  CogIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  BeakerIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronDownIcon,
  ServerIcon,
  QueueListIcon,
  KeyIcon,
  AcademicCapIcon,
  BoltIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  RocketLaunchIcon,
  BugAntIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/helpers';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// ------------------------------
// Types
// ------------------------------
export type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  description?: string;
};

export type NavCategory = {
  id: string;
  label: string;
  items: NavItem[];
};

// ------------------------------
// Grouped Navigation (Helicon-style)
// ------------------------------
const navCategories: NavCategory[] = [
  {
    id: 'core',
    label: 'Core',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, description: 'Chat with AI & view insights' },
      { name: 'Usage', href: '/usage', icon: CircleStackIcon, description: 'Monitor your API usage' },
      { name: 'Predictive Intelligence', href: '/predictive-intelligence', icon: BoltIcon, description: 'AI-powered cost forecasting and proactive optimization' },
    ],
  },
  {
    id: 'monitor',
    label: 'Monitor',
    items: [
      { name: 'Gateway', href: '/gateway', icon: ServerIcon, description: 'AI Gateway analytics and monitoring' },
      { name: 'Telemetry', href: '/telemetry', icon: ServerIcon, description: 'AI-powered telemetry with intelligent insights and cost optimization' },
      { name: 'Sessions', href: '/sessions', icon: PlayCircleIcon, description: 'View session replays and debug AI traces' },
      { name: 'Cache', href: '/cache', icon: CpuChipIcon, description: 'Redis cache dashboard with semantic matching' },
      { name: 'Advanced Monitoring', href: '/advanced-monitoring', icon: SparklesIcon, description: 'Advanced monitoring tools' },
      { name: 'Alerts', href: '/alerts', icon: BellIcon, description: 'Manage alerts' },
    ],
  },
  {
    id: 'optimize',
    label: 'Optimize & Debug',
    items: [
      { name: 'Workflows', href: '/workflows', icon: QueueListIcon, description: 'Track multi-step AI operations' },
      { name: 'Optimizations', href: '/optimizations', icon: LightBulbIcon, description: 'Optimize performance' },
      { name: 'Unexplained Costs', href: '/unexplained-costs', icon: CircleStackIcon, description: 'Understand why your AI costs changed with detailed attribution and optimization insights' },
    ],
  },
  {
    id: 'security',
    label: 'Security & Compliance',
    items: [
      { name: 'Key Vault', href: '/key-vault', icon: KeyIcon, description: 'Secure API key management' },
      { name: 'Integrations', href: '/integrations', icon: BellIcon, description: 'Connect Slack, Discord & webhooks' },
      { name: 'Webhooks', href: '/webhooks', icon: BellIcon, description: 'Configure webhooks for real-time notifications' },
      { name: 'Moderation', href: '/moderation', icon: ShieldCheckIcon, description: 'View moderation analytics' },
      { name: 'Security', href: '/security', icon: ShieldExclamationIcon, description: 'LLM security guardrails & threat analysis' },
    ],
  },
  {
    id: 'build',
    label: 'Build & Manage',
    items: [
      { name: 'Experimentation', href: '/experimentation', icon: BeakerIcon, description: 'Run experiments' },
      { name: 'Projects', href: '/projects', icon: FolderIcon, description: 'Manage your projects' },
      { name: 'Templates', href: '/templates', icon: DocumentTextIcon, description: 'Browse templates' },
      { name: 'Integration', href: '/integration', icon: CogIcon, description: 'Integration settings' },
      { name: 'Pricing', href: '/pricing', icon: CurrencyDollarIcon, description: 'View pricing plans' },
      { name: 'Profile', href: '/profile', icon: UserIcon, description: 'User profile settings' },
      { name: 'Settings', href: '/settings', icon: CogIcon, description: 'Application settings and preferences' },
    ],
  },
];

// ------------------------------
// Tooltip (unchanged)
// ------------------------------
interface TooltipProps {
  children: React.ReactNode;
  content: string;
  show: boolean;
  placement?: 'right' | 'left' | 'top' | 'bottom';
  delay?: number;
}

const Tooltip = ({ children, content, show, placement = 'right', delay = 200 }: TooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement,
    modifiers: [
      { name: 'offset', options: { offset: [0, 8] } },
      { name: 'preventOverflow', options: { padding: 8 } },
      { name: 'flip', options: { fallbackPlacements: ['left', 'top', 'bottom'] } },
    ],
  });

  const handleMouseEnter = () => {
    if (!show) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowTooltip(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!show) return <>{children}</>;

  return (
    <>
      <div
        ref={setReferenceElement}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block w-full"
      >
        {children}
      </div>
      {showTooltip && (
        <div
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          className="z-[99999] px-4 py-3 text-sm font-medium text-white bg-gradient-dark-panel rounded-xl shadow-2xl pointer-events-none min-w-[200px] max-w-[300px] border border-primary-500/20 backdrop-blur-xl"
        >
          {content}
          <div
            data-popper-arrow
            className="absolute w-2 h-2 bg-gradient-to-br from-primary-500 to-secondary-500 transform rotate-45"
            style={{
              ...(placement === 'right' && { left: '-4px' }),
              ...(placement === 'left' && { right: '-4px' }),
              ...(placement === 'top' && { bottom: '-4px' }),
              ...(placement === 'bottom' && { top: '-4px' }),
            }}
          />
        </div>
      )}
    </>
  );
};

// ------------------------------
// Sidebar
// ------------------------------
export const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) => {
  const location = useLocation();

  // expanded state per category; persisted so it feels sticky
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Map route -> category id for quick lookup
  const routeToCategory = useMemo(() => {
    const map = new Map<string, string>();
    navCategories.forEach((cat) => cat.items.forEach((it) => map.set(it.href, cat.id)));
    return map;
  }, []);

  // Initialize / load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ck.sidebar.categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, boolean>;
        setExpanded(parsed);
      } catch {
        // Ignore parsing errors, use default state
        console.error('Error parsing sidebar state:', saved);
      }
    } else {
      // Default: open the category for the active route
      const activeCat = routeToCategory.get(location.pathname);
      if (activeCat) setExpanded({ [activeCat]: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist when changed
  useEffect(() => {
    localStorage.setItem('ck.sidebar.categories', JSON.stringify(expanded));
  }, [expanded]);

  // Ensure active category is open when navigating (only when expanded sidebar)
  useEffect(() => {
    if (isCollapsed) return;
    const activeCat = routeToCategory.get(location.pathname);
    if (activeCat && !expanded[activeCat]) {
      setExpanded((prev) => ({ ...prev, [activeCat]: true }));
    }
  }, [isCollapsed, location.pathname, expanded, routeToCategory]);

  const toggleCat = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const renderItem = (item: NavItem, collapsed: boolean) => {
    const isActive = location.pathname === item.href;
    const tooltipContent = `${item.name}${item.description ? ` - ${item.description}` : ''}`;

    return (
      <li key={item.name}>
        <Tooltip content={tooltipContent} show={collapsed} placement="right">
          <NavLink
            to={item.href}
            onClick={onClose}
            className={cn(
              isActive
                ? 'bg-gradient-primary text-white shadow-lg glow-primary nav-item active'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 hover:bg-primary-500/10 nav-item',
              'flex items-center p-3 text-sm font-display font-semibold leading-6 rounded-xl group transition-all duration-300',
              collapsed ? 'mx-2.5 justify-center' : 'gap-x-3'
            )}
          >
            <item.icon
              className={cn(
                isActive
                  ? 'text-white'
                  : 'text-light-text-muted dark:text-dark-text-muted group-hover:text-primary-500',
                'w-6 h-6 shrink-0 transition-all duration-300'
              )}
              aria-hidden="true"
            />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        </Tooltip>
      </li>
    );
  };

  const CategoryHeader = ({ id, label }: { id: string; label: string }) => (
    <button
      type="button"
      onClick={() => toggleCat(id)}
      className={cn(
        'w-full flex items-center justify-between text-xs font-display font-bold uppercase tracking-wider',
        'text-light-text-muted dark:text-dark-text-muted px-3 py-2 select-none rounded-lg',
        'hover:text-primary-500 hover:bg-primary-500/5 transition-all duration-300'
      )}
      aria-expanded={!!expanded[id]}
    >
      <span>{label}</span>
      <ChevronDownIcon
        className={cn('w-4 h-4 transition-transform duration-200', expanded[id] ? 'rotate-0' : '-rotate-90')}
      />
    </button>
  );

  const sidebarContent = (collapsed = false) => (
    <nav className="flex relative flex-col flex-1">
      {/* When collapsed, show a floating expand toggle at top */}
      {collapsed && (
        <div className="absolute top-0 left-1/2 z-10 transition-all duration-200 transform -translate-x-1/2">
          <Tooltip content="Expand sidebar" show placement="right">
            <button
              onClick={onToggleCollapse}
              className={cn(
                'p-3 text-light-text-secondary dark:text-dark-text-secondary rounded-xl hover:text-primary-500 glass',
                'hover:bg-primary-500/20 hover:scale-110',
                'flex-shrink-0 transition-all duration-300',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50',
                'shadow-lg border border-primary-200/30'
              )}
              aria-label="Expand sidebar"
            >
              <ChevronDoubleRightIcon className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      )}

      <ul role="list" className={cn('flex flex-col flex-1 gap-y-6', collapsed ? 'pt-14' : 'pt-4')}>
        {navCategories.map((cat) => (
          <li key={cat.id}>
            {/* Category header hidden when collapsed */}
            {!collapsed && (
              <div className="flex justify-between items-center px-1">
                <CategoryHeader id={cat.id} label={cat.label} />
              </div>
            )}

            {/* Item list */}
            <ul
              role="list"
              className={cn(
                'mt-2 space-y-1 -mx-2',
                collapsed ? '' : 'px-1',
                collapsed
                  ? ''
                  : expanded[cat.id]
                    ? 'max-h-[640px] transition-[max-height] duration-300 ease-in-out'
                    : 'max-h-0 overflow-hidden transition-[max-height] duration-300 ease-in-out'
              )}
            >
              {cat.items.map((item) => renderItem(item, collapsed))}
            </ul>

            {/* Divider between categories */}
            {collapsed ? (
              <div className="mx-2 my-4 border-t border-primary-200/30" />
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-dark-bg/90 backdrop-blur-sm" />
          </Transition.Child>

          <div className="flex fixed inset-0">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="flex relative flex-1 mr-16 w-full max-w-xs">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="flex absolute top-0 left-full justify-center pt-5 w-16">
                    <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="w-6 h-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                <div className="flex overflow-y-auto flex-col gap-y-5 px-6 pb-2 glass grow light:bg-gradient-light-panel dark:bg-gradient-dark-panel">
                  <div className="flex items-center h-16 shrink-0">
                    <div className="flex justify-center items-center w-10 h-10 rounded-xl bg-gradient-primary shadow-lg glow-primary">
                      <span className="text-lg font-display font-bold text-white">CK</span>
                    </div>
                  </div>
                  {sidebarContent(false)}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div
        className={cn(
          'hidden transition-all duration-300 lg:fixed lg:inset-y-0 lg:top-16 lg:z-50 lg:flex lg:flex-col',
          isCollapsed ? 'lg:w-16' : 'lg:w-72'
        )}
      >
        <div
          className={cn(
            'flex relative flex-col gap-y-5 glass border-r border-primary-200/30 transition-all duration-300 grow light:bg-gradient-light-panel dark:bg-gradient-dark-panel backdrop-blur-xl',
            isCollapsed ? 'overflow-visible px-2' : 'overflow-y-auto px-6'
          )}
        >
          {/* Collapse button (anchored next to the first item when expanded) */}
          {!isCollapsed && (
            <div className="absolute right-2 top-3">
              <button
                onClick={onToggleCollapse}
                className={cn(
                  'p-2 rounded-xl text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 glass',
                  'hover:bg-primary-500/20 hover:scale-110',
                  'transition-all duration-300 flex-shrink-0',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50'
                )}
                aria-label="Collapse sidebar"
              >
                <ChevronDoubleLeftIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex-1 pt-4">{sidebarContent(isCollapsed)}</div>
        </div>
      </div>
    </>
  );
};
