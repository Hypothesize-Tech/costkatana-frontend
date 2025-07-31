import { Fragment, useState, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { NavLink, useLocation } from 'react-router-dom';
import { usePopper } from 'react-popper';
import {
    XMarkIcon,
    HomeIcon,
    ChartBarIcon,
    CircleStackIcon,
    LightBulbIcon,
    UserIcon,
    FolderIcon,
    DocumentTextIcon,
    PlayIcon,
    BellIcon,
    CogIcon,
    CurrencyDollarIcon,
    SparklesIcon,
    BeakerIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    ClockIcon,
    ServerIcon,
    QueueListIcon,
    KeyIcon,
    AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/helpers';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, description: 'Chat with AI & view insights' },
    { name: 'Usage', href: '/usage', icon: CircleStackIcon, description: 'Monitor your API usage' },
    { name: 'Requests', href: '/requests', icon: ClockIcon, description: 'Real-time LLM API requests' },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, description: 'View detailed analytics' },
    { name: 'Gateway', href: '/gateway', icon: ServerIcon, description: 'AI Gateway analytics and monitoring' },
    { name: 'Workflows', href: '/workflows', icon: QueueListIcon, description: 'Track multi-step AI operations' },
    { name: 'Key Vault', href: '/key-vault', icon: KeyIcon, description: 'Secure API key management' },
    { name: 'Training', href: '/training', icon: AcademicCapIcon, description: 'Cost-effective model training' },
    { name: 'Advanced Monitoring', href: '/advanced-monitoring', icon: SparklesIcon, description: 'Advanced monitoring tools' },
    { name: 'Experimentation', href: '/experimentation', icon: BeakerIcon, description: 'Run experiments' },
    { name: 'Pricing', href: '/pricing', icon: CurrencyDollarIcon, description: 'View pricing plans' },
    { name: 'Optimizations', href: '/optimizations', icon: LightBulbIcon, description: 'Optimize performance' },
    { name: 'Projects', href: '/projects', icon: FolderIcon, description: 'Manage your projects' },
    { name: 'Templates', href: '/templates', icon: DocumentTextIcon, description: 'Browse templates' },
    { name: 'Use Templates', href: '/templates/use', icon: PlayIcon, description: 'Apply templates' },
    { name: 'Integration', href: '/integration', icon: CogIcon, description: 'Integration settings' },
    { name: 'Alerts', href: '/alerts', icon: BellIcon, description: 'Manage alerts' },
    { name: 'Profile', href: '/profile', icon: UserIcon, description: 'User profile settings' },
];

// Tooltip Component using React Popper
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
            {
                name: 'offset',
                options: {
                    offset: [0, 8],
                },
            },
            {
                name: 'preventOverflow',
                options: {
                    padding: 8,
                },
            },
            {
                name: 'flip',
                options: {
                    fallbackPlacements: ['left', 'top', 'bottom'],
                },
            },
        ],
    });

    const handleMouseEnter = () => {
        if (!show) return;
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setShowTooltip(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        clearTimeout(timeoutRef.current);
        setShowTooltip(false);
    };

    // Cleanup timeout on unmount
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
                    className="z-[99999] px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-lg pointer-events-none min-w-[200px] max-w-[300px]"
                >
                    {content}
                    <div
                        data-popper-arrow
                        className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
                        style={{
                            ...styles.arrow,
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

export const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) => {
    const location = useLocation();

    const sidebarContent = (collapsed: boolean = false) => (
        <>
            <nav className="flex flex-col flex-1 relative">
                {/* Toggle button - positioned absolutely when collapsed */}
                {collapsed && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10 transition-all duration-200">
                        <Tooltip
                            content="Expand sidebar"
                            show={true}
                            placement="right"
                        >
                            <button
                                onClick={onToggleCollapse}
                                className={cn(
                                    "p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                                    "dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700",
                                    "transition-all duration-200 flex-shrink-0",
                                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50",
                                    "shadow-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                                )}
                                aria-label="Expand sidebar"
                            >
                                <ChevronDoubleRightIcon className="w-4 h-4" />
                            </button>
                        </Tooltip>
                    </div>
                )}

                {/* Navigation items */}
                <ul role="list" className={cn(
                    "flex flex-col flex-1 gap-y-7",
                    collapsed ? "pt-14" : "pt-4"
                )}>
                    <li>
                        <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href;
                                const tooltipContent = `${item.name}${item.description ? ` - ${item.description}` : ''}`;
                                const isDashboard = item.name === 'Dashboard';

                                return (
                                    <li key={item.name}>
                                        <Tooltip
                                            content={tooltipContent}
                                            show={collapsed}
                                            placement="right"
                                        >
                                            <div className="relative">
                                                <NavLink
                                                    to={item.href}
                                                    onClick={() => onClose()}
                                                    className={cn(
                                                        isActive
                                                            ? 'bg-gray-100 text-primary-600 dark:bg-gray-700 dark:text-primary-400'
                                                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700',
                                                        'flex gap-x-3 p-2 text-sm font-semibold leading-6 rounded-md group transition-all duration-200',
                                                        collapsed ? 'mx-2.5 justify-center' : 'gap-x-3'
                                                    )}
                                                >
                                                    <item.icon
                                                        className={cn(
                                                            isActive
                                                                ? 'text-primary-600 dark:text-primary-400'
                                                                : 'text-gray-400 group-hover:text-primary-600 dark:group-hover:text-white',
                                                            'w-6 h-6 shrink-0'
                                                        )}
                                                        aria-hidden="true"
                                                    />
                                                    {!collapsed && (
                                                        <span className="truncate">{item.name}</span>
                                                    )}
                                                </NavLink>

                                                {/* Collapse button positioned absolutely on the right side of Dashboard */}
                                                {isDashboard && !collapsed && (
                                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                        <Tooltip
                                                            content="Collapse sidebar"
                                                            show={true}
                                                            placement="left"
                                                        >
                                                            <button
                                                                onClick={onToggleCollapse}
                                                                className={cn(
                                                                    "p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                                                                    "dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700",
                                                                    "transition-all duration-200 flex-shrink-0",
                                                                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
                                                                )}
                                                                aria-label="Collapse sidebar"
                                                            >
                                                                <ChevronDoubleLeftIcon className="w-4 h-4" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                )}
                                            </div>
                                        </Tooltip>
                                    </li>
                                );
                            })}
                        </ul>
                    </li>
                </ul>
            </nav>
        </>
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
                        <div className="fixed inset-0 bg-gray-900/80" />
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

                                <div className="flex overflow-y-auto flex-col gap-y-5 px-6 pb-2 bg-white grow dark:bg-gray-800">
                                    <div className="flex items-center h-16 shrink-0">
                                        <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-primary-600">
                                            <span className="text-lg font-bold text-white">AI</span>
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
            <div className={cn(
                "hidden lg:fixed lg:inset-y-0 lg:top-16 lg:z-50 lg:flex lg:flex-col transition-all duration-300",
                isCollapsed ? "lg:w-16" : "lg:w-72"
            )}>
                <div className={cn(
                    "flex flex-col gap-y-5 bg-white border-r border-gray-200 grow dark:border-gray-700 dark:bg-gray-800 transition-all duration-300 relative",
                    isCollapsed ? "px-2 overflow-visible" : "px-6 overflow-y-auto"
                )}>
                    <div className="pt-4 flex-1">
                        {sidebarContent(isCollapsed)}
                    </div>
                </div>
            </div>
        </>
    );
};