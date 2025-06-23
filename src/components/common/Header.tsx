import { Fragment, useMemo } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, Bars3Icon, SunIcon, MoonIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useTheme, useNotifications } from '@/hooks';
import { cn } from '@/utils/helpers';
import { APP_NAME } from '@/utils/constant';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useNotifications();
  const navigate = useNavigate();

  // Calculate unread notifications (assuming 'read' property exists or fallback to all as unread)
  const unreadCount = useMemo(() => {
    if (!notifications) return 0;
    // If notifications have a 'read' property, count unread, else count all
    if (notifications.length > 0 && typeof notifications[0] === 'object' && 'read' in notifications[0]) {
      // @ts-expect-error - read property is not typed
      return notifications.filter((n: unknown) => !n.read).length;
    }
    return notifications.length;
  }, [notifications]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Logo */}
      <div className="flex flex-1 items-center gap-x-4 lg:gap-x-6">
        <Link to="/dashboard" className="flex items-center gap-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white hidden sm:block">{APP_NAME}</span>
        </Link>
      </div>

      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {theme === 'light' ? (
            <MoonIcon className="h-5 w-5" />
          ) : (
            <SunIcon className="h-5 w-5" />
          )}
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => navigate('/profile?tab=alerts')}
          className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger-500 text-xs font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile dropdown */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-x-3 p-1.5 text-sm">
            <span className="sr-only">Open user menu</span>
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <span className="hidden lg:flex lg:items-center">
              <span className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                {user?.name}
              </span>
            </span>
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none dark:bg-gray-700">
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.email}
                </p>
              </div>

              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/profile"
                    className={cn(
                      active ? 'bg-gray-50 dark:bg-gray-600' : '',
                      'block px-3 py-2 text-sm leading-6 text-gray-900 dark:text-white'
                    )}
                  >
                    Profile Settings
                  </Link>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/profile?tab=subscription"
                    className={cn(
                      active ? 'bg-gray-50 dark:bg-gray-600' : '',
                      'block px-3 py-2 text-sm leading-6 text-gray-900 dark:text-white'
                    )}
                  >
                    Subscription
                  </Link>
                )}
              </Menu.Item>

              <div className="border-t border-gray-200 dark:border-gray-600">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={cn(
                        active ? 'bg-gray-50 dark:bg-gray-600' : '',
                        'block w-full px-3 py-2 text-left text-sm leading-6 text-gray-900 dark:text-white'
                      )}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
};