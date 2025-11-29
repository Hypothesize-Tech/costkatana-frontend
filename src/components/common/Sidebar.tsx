import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Dialog, Transition } from '@headlessui/react';
import { NavLink, useLocation } from 'react-router-dom';
import { usePopper } from 'react-popper';
import {
  XMarkIcon,
  HomeIcon,
  ChartBarIcon,
  BoltIcon,
  ServerIcon,
  SignalIcon,
  FilmIcon,
  CpuChipIcon,
  BellIcon,
  QueueListIcon,
  LightBulbIcon,
  CurrencyDollarIcon,
  KeyIcon,
  PuzzlePieceIcon,
  WifiIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  FolderIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  BanknotesIcon,
  UserCircleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronDownIcon,
  LinkIcon,
  EyeIcon,
  ClipboardDocumentListIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/helpers';
import { useAuth } from '../../hooks';

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
// Grouped Navigation (User Journey Organization)
// ------------------------------
const navCategories: NavCategory[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, description: 'Main dashboard with AI chat' },
      { name: 'Usage', href: '/usage', icon: ChartBarIcon, description: 'API usage monitoring' },
      { name: 'Predictive Intelligence', href: '/predictive-intelligence', icon: BoltIcon, description: 'AI-powered cost forecasting' },
    ],
  },
  {
    id: 'monitor',
    label: 'Monitor',
    items: [
      { name: 'Gateway', href: '/gateway', icon: ServerIcon, description: 'AI Gateway analytics' },
      { name: 'Telemetry', href: '/telemetry', icon: SignalIcon, description: 'AI-powered telemetry dashboard' },
      { name: 'Sessions', href: '/sessions', icon: FilmIcon, description: 'Session replays and debugging' },
      { name: 'Logs', href: '/logs', icon: ClipboardDocumentListIcon, description: 'Operation logs' },
      { name: 'Cache', href: '/cache', icon: CpuChipIcon, description: 'Redis cache dashboard' },
      { name: 'Advanced Monitoring', href: '/advanced-monitoring', icon: EyeIcon, description: 'Advanced monitoring tools' },
      { name: 'Alerts', href: '/alerts', icon: BellIcon, description: 'Alert management' },
    ],
  },
  {
    id: 'optimize',
    label: 'Optimize',
    items: [
      { name: 'Workflows', href: '/workflows', icon: QueueListIcon, description: 'Multi-step AI operations' },
      { name: 'Optimizations', href: '/optimizations', icon: LightBulbIcon, description: 'Performance insights' },
      { name: 'Unexplained Costs', href: '/unexplained-costs', icon: ChartPieIcon, description: 'Cost attribution analysis' },
      { name: 'Experimentation', href: '/experimentation', icon: BeakerIcon, description: 'A/B testing' },
    ],
  },
  {
    id: 'security',
    label: 'Security & Compliance',
    items: [
      { name: 'Key Vault', href: '/key-vault', icon: KeyIcon, description: 'API key management' },
      { name: 'Moderation', href: '/moderation', icon: ShieldCheckIcon, description: 'Content moderation' },
      { name: 'Security', href: '/security', icon: ExclamationTriangleIcon, description: 'LLM security guardrails' },
    ],
  },
  {
    id: 'integrate',
    label: 'Integrate',
    items: [
      { name: 'Integrations', href: '/integrations', icon: PuzzlePieceIcon, description: 'Third-party services' },
      { name: 'Webhooks', href: '/webhooks', icon: WifiIcon, description: 'Webhook configuration' },
      { name: 'Automation', href: '/automation', icon: BoltIcon, description: 'Zapier/Make/n8n cost tracking' },
      { name: 'Integration Settings', href: '/integration', icon: LinkIcon, description: 'Integration configs' },
    ],
  },
  {
    id: 'manage',
    label: 'Manage',
    items: [
      { name: 'Projects', href: '/projects', icon: FolderIcon, description: 'Project management' },
      { name: 'Templates', href: '/templates', icon: DocumentTextIcon, description: 'Prompt templates' },
      { name: 'Pricing', href: '/pricing', icon: BanknotesIcon, description: 'Pricing plans' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      { name: 'Profile', href: '/profile', icon: UserCircleIcon, description: 'User profile' },
      { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, description: 'Application settings' },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    items: [
      { name: 'Admin Dashboard', href: '/admin/dashboard', icon: ChartBarIcon, description: 'Platform analytics' },
      { name: 'User Spending', href: '/admin/user-spending', icon: CurrencyDollarIcon, description: 'User spending tracking' },
    ],
  },
];

// ------------------------------
// Tooltip (Enhanced with theme support)
// ------------------------------
interface TooltipProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  show: boolean;
  placement?: 'right' | 'left' | 'top' | 'bottom';
  delay?: number;
}

const Tooltip = ({ children, title, description, show, delay = 200 }: TooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'right',
    modifiers: [
      { name: 'offset', options: { offset: [12, 0] } },
      { name: 'preventOverflow', options: { padding: 16, rootBoundary: 'viewport' } },
      { name: 'flip', options: { fallbackPlacements: ['left', 'top', 'bottom'] } },
    ],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const tooltipContent = showTooltip && mounted && (
    <div
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
      className={cn(
        'fixed z-[99999] px-4 py-3.5 rounded-xl shadow-xl pointer-events-none min-w-[220px] max-w-[320px]',
        'animate-fade-in',
        'glass backdrop-blur-xl',
        'bg-gradient-light-panel dark:bg-gradient-dark-panel',
        'border border-primary-200/30 dark:border-primary-500/20',
        'shadow-[0_8px_30px_rgba(6,236,158,0.15)] dark:shadow-[0_8px_30px_rgba(6,236,158,0.25)]'
      )}
    >
      <div className="relative">
        <div className="absolute -inset-px bg-gradient-to-r from-[#06ec9e]/10 via-emerald-500/10 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-500/20 dark:to-[#009454]/20 rounded-xl blur-sm" />
        <div className="relative">
          <div className="text-sm font-semibold text-secondary-900 dark:text-white mb-1.5">
            {title}
          </div>
          {description && (
            <div className="text-xs font-normal text-secondary-600 dark:text-white/70 leading-relaxed">
              {description}
            </div>
          )}
        </div>
      </div>
      <div
        data-popper-arrow
        className={cn(
          'absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 transform rotate-45',
          'glass backdrop-blur-xl',
          'bg-gradient-light-panel dark:bg-gradient-dark-panel',
          'border-l border-b border-primary-200/30 dark:border-primary-500/20'
        )}
      />
    </div>
  );

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
      {mounted && tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
};

// ------------------------------
// Sidebar
// ------------------------------
export const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

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

    return (
      <li key={item.name} className="relative">
        <Tooltip title={item.name} description={item.description} show={collapsed} placement="right">
          <NavLink
            to={item.href}
            onClick={onClose}
            className={cn(
              'relative flex items-center rounded-xl group transition-all duration-300',
              'before:absolute before:inset-0 before:rounded-xl before:transition-all before:duration-300',
              'min-h-[44px] [touch-action:manipulation]',
              collapsed ? 'mx-2.5 justify-center p-3' : 'gap-x-3 px-4 py-3',
              isActive
                ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white shadow-xl shadow-[#06ec9e]/30'
                : 'text-secondary-900 dark:text-white hover:text-[#06ec9e] dark:hover:text-emerald-400 active:bg-primary-500/15 dark:active:bg-primary-500/25 hover:bg-primary-500/10 dark:hover:bg-primary-500/20',
              isActive && 'before:bg-gradient-to-r before:from-[#06ec9e]/20 before:via-emerald-400/20 before:to-[#009454]/20 before:blur-sm',
              !isActive && 'hover:before:bg-gradient-to-r hover:before:from-[#06ec9e]/5 hover:before:via-emerald-500/5 hover:before:to-[#009454]/5'
            )}
          >
            {/* Active indicator */}
            {isActive && !collapsed && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#06ec9e] via-emerald-500 to-[#009454] rounded-r-full shadow-lg shadow-[#06ec9e]/50" />
            )}

            <div className={cn(
              'relative flex items-center justify-center rounded-lg transition-all duration-300',
              isActive
                ? 'bg-white/10 backdrop-blur-sm'
                : 'group-hover:bg-primary-500/10 dark:group-hover:bg-primary-500/20',
              collapsed ? 'w-10 h-10' : 'w-9 h-9'
            )}>
              <item.icon
                className={cn(
                  'shrink-0 transition-all duration-300',
                  isActive
                    ? 'text-white scale-110'
                    : 'text-secondary-700 dark:text-white/70 group-hover:text-[#06ec9e] dark:group-hover:text-emerald-400 group-hover:scale-110',
                  collapsed ? 'w-5 h-5' : 'w-5 h-5'
                )}
                aria-hidden="true"
              />
            </div>

            {!collapsed && (
              <span className={cn(
                'truncate font-medium transition-all duration-300',
                isActive
                  ? 'text-white font-semibold'
                  : 'text-secondary-900 dark:text-white group-hover:text-[#06ec9e] dark:group-hover:text-emerald-400',
                'text-sm'
              )}>
                {item.name}
              </span>
            )}
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
        'w-full flex items-center justify-between px-3 py-3 min-h-[44px] select-none rounded-lg',
        'text-xs font-bold uppercase tracking-widest',
        'text-secondary-600 dark:text-white/60',
        'hover:text-[#06ec9e] dark:hover:text-emerald-400',
        'active:bg-primary-500/10 dark:active:bg-primary-500/20',
        'hover:bg-primary-500/5 dark:hover:bg-primary-500/10',
        'transition-all duration-300 [touch-action:manipulation]',
        'border border-transparent hover:border-primary-500/20',
        expanded[id] && 'bg-primary-500/5 dark:bg-primary-500/10 text-[#06ec9e] dark:text-emerald-400 border-primary-500/30'
      )}
      aria-expanded={!!expanded[id]}
    >
      <span className="flex items-center gap-2">
        <div className={cn(
          'w-1.5 h-1.5 rounded-full transition-all duration-300',
          expanded[id]
            ? 'bg-[#06ec9e] shadow-lg shadow-[#06ec9e]/50'
            : 'bg-secondary-400 dark:bg-white/30'
        )} />
        <span>{label}</span>
      </span>
      <ChevronDownIcon
        className={cn(
          'w-4 h-4 transition-all duration-300',
          expanded[id]
            ? 'rotate-0 text-[#06ec9e] dark:text-emerald-400'
            : '-rotate-90 text-secondary-500 dark:text-white/40'
        )}
      />
    </button>
  );

  const sidebarContent = (collapsed = false) => (
    <nav className="flex relative flex-col flex-1">
      {/* When collapsed, show a floating expand toggle at top */}
      {collapsed && (
        <div className="absolute top-4 left-1/2 z-10 transition-all duration-200 transform -translate-x-1/2">
          <Tooltip title="Expand sidebar" show={true} placement="right">
            <button
              onClick={onToggleCollapse}
              className={cn(
                'p-2.5 rounded-xl glass backdrop-blur-md',
                'border border-primary-500/30 dark:border-primary-500/40',
                'bg-gradient-light-panel dark:bg-gradient-dark-panel',
                'text-[#06ec9e] hover:text-[#06ec9e]/80',
                'hover:bg-primary-500/20 dark:hover:bg-primary-500/30',
                'hover:scale-110 hover:shadow-lg hover:shadow-[#06ec9e]/30',
                'flex-shrink-0 transition-all duration-300',
                'focus:outline-none focus:ring-2 focus:ring-[#06ec9e] focus:ring-opacity-50',
                'shadow-md'
              )}
              aria-label="Expand sidebar"
            >
              <ChevronDoubleRightIcon className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      )}

      <ul role="list" className={cn('flex flex-col flex-1 gap-y-5', collapsed ? 'pt-16' : 'pt-6')}>
        {navCategories.filter(cat => cat.id !== 'admin' || isAdmin).map((cat, index) => (
          <li key={cat.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            {/* Category header hidden when collapsed */}
            {!collapsed && (
              <div className="flex justify-between items-center px-1 mb-2">
                <CategoryHeader id={cat.id} label={cat.label} />
              </div>
            )}

            {/* Item list */}
            <ul
              role="list"
              className={cn(
                'space-y-1.5',
                collapsed ? 'mx-1' : 'px-1',
                collapsed
                  ? ''
                  : expanded[cat.id]
                    ? 'max-h-[800px] transition-all duration-500 ease-out opacity-100'
                    : 'max-h-0 overflow-hidden transition-all duration-500 ease-in opacity-0'
              )}
            >
              {cat.items.map((item, itemIndex) => (
                <div
                  key={item.name}
                  className="animate-fade-in"
                  style={{ animationDelay: `${(index * 50) + (itemIndex * 30)}ms` }}
                >
                  {renderItem(item, collapsed)}
                </div>
              ))}
            </ul>

            {/* Divider between categories */}
            {collapsed && index < navCategories.filter(cat => cat.id !== 'admin' || isAdmin).length - 1 && (
              <div className="mx-3 my-3 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
            )}
            {!collapsed && index < navCategories.filter(cat => cat.id !== 'admin' || isAdmin).length - 1 && (
              <div className="mx-1 my-2 h-px bg-gradient-to-r from-transparent via-primary-200/20 dark:via-primary-500/20 to-transparent" />
            )}
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
            <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md" />
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

                <div className="flex overflow-y-auto flex-col gap-y-5 px-4 sm:px-6 pb-6 glass backdrop-blur-xl border-r border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel grow overscroll-contain">
                  <div className="flex items-center h-16 shrink-0 mt-4">
                    <div className="relative flex justify-center items-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-xl shadow-[#06ec9e]/30">
                      <span className="text-xl font-display font-bold text-white">CK</span>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                      <div className="absolute -inset-0.5 bg-gradient-to-br from-[#06ec9e] to-[#009454] rounded-xl blur opacity-30 animate-pulse" />
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
            'flex relative flex-col transition-all duration-300 grow',
            'glass backdrop-blur-xl border-r border-primary-200/30 dark:border-primary-500/20',
            'bg-gradient-light-panel dark:bg-gradient-dark-panel',
            'shadow-xl',
            isCollapsed ? 'overflow-visible px-2' : 'overflow-y-auto px-4 sm:px-6 overscroll-contain'
          )}
        >
          {/* Collapse button (anchored next to the first item when expanded) */}
          {!isCollapsed && (
            <div className="absolute right-3 top-4 z-20">
              <button
                onClick={onToggleCollapse}
                className={cn(
                  'p-2 rounded-xl glass backdrop-blur-md',
                  'border border-primary-200/30 dark:border-primary-500/20',
                  'bg-gradient-light-panel dark:bg-gradient-dark-panel',
                  'text-secondary-900 dark:text-white',
                  'hover:text-[#06ec9e] dark:hover:text-emerald-400',
                  'hover:bg-primary-500/10 dark:hover:bg-primary-500/20',
                  'hover:border-primary-300/50 dark:hover:border-primary-500/30',
                  'hover:scale-110 hover:shadow-lg hover:shadow-[#06ec9e]/20',
                  'transition-all duration-300 flex-shrink-0',
                  'focus:outline-none focus:ring-2 focus:ring-[#06ec9e] focus:ring-opacity-50'
                )}
                aria-label="Collapse sidebar"
              >
                <ChevronDoubleLeftIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex-1 pt-2">{sidebarContent(isCollapsed)}</div>
        </div>
      </div>
    </>
  );
};
