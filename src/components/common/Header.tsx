import { Fragment, useMemo } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, Bars3Icon, SunIcon, MoonIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useTheme, useNotifications } from '../../hooks';
import { cn } from '../../utils/helpers';
import { APP_NAME } from '../../utils/constant';

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
    <header className="flex sticky top-0 z-40 gap-x-4 items-center px-4 h-16 bg-white border-b border-gray-200 shadow-sm shrink-0 dark:border-gray-700 dark:bg-gray-800 sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Logo */}
      <div className="flex flex-1 gap-x-4 items-center lg:gap-x-6">
        <Link to="/dashboard" className="flex gap-x-2 items-center">
          <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-primary-600">
            <span className="text-lg font-bold text-white">AI</span>
          </div>
          <span className="hidden font-semibold text-gray-900 dark:text-white sm:block">{APP_NAME}</span>
        </Link>
      </div>

      <div className="flex gap-x-4 items-center lg:gap-x-6">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {theme === 'light' ? (
            <MoonIcon className="w-5 h-5" />
          ) : (
            <SunIcon className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => navigate('/profile?tab=alerts')}
          className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <span className="sr-only">View notifications</span>
          <BellIcon className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="flex absolute -top-1 -right-1 justify-center items-center w-5 h-5 text-xs font-medium text-white rounded-full bg-danger-500">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile dropdown */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-x-3 p-1.5 text-sm">
            <span className="sr-only">Open user menu</span>
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
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
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
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
                        'block px-3 py-2 w-full text-sm leading-6 text-left text-gray-900 dark:text-white'
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