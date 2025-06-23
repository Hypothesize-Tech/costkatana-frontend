import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    XMarkIcon,
    HomeIcon,
    ChartBarIcon,
    CircleStackIcon,
    LightBulbIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils/helpers';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Usage', href: '/usage', icon: CircleStackIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Optimizations', href: '/optimizations', icon: LightBulbIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const location = useLocation();

    const sidebarContent = (
        <>
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href;

                                return (
                                    <li key={item.name}>
                                        <NavLink
                                            to={item.href}
                                            onClick={() => onClose()}
                                            className={cn(
                                                isActive
                                                    ? 'bg-gray-100 text-primary-600 dark:bg-gray-700 dark:text-primary-400'
                                                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700',
                                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                            )}
                                        >
                                            <item.icon
                                                className={cn(
                                                    isActive
                                                        ? 'text-primary-600 dark:text-primary-400'
                                                        : 'text-gray-400 group-hover:text-primary-600 dark:group-hover:text-white',
                                                    'h-6 w-6 shrink-0'
                                                )}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </NavLink>
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

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                        <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
                                            <span className="sr-only">Close sidebar</span>
                                            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </button>
                                    </div>
                                </Transition.Child>

                                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 pb-2">
                                    <div className="flex h-16 shrink-0 items-center">
                                        <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">AI</span>
                                        </div>
                                    </div>
                                    {sidebarContent}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:top-16 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 px-6">
                    <div className="pt-4">
                        {sidebarContent}
                    </div>
                </div>
            </div>
        </>
    );
};