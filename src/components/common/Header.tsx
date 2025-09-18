import { Fragment, useMemo } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  BellIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useTheme, useNotifications } from "../../hooks";
import { cn } from "../../utils/helpers";
import { APP_NAME } from "../../utils/constant";
import logo from "../../assets/logo.jpg";
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
    if (
      notifications.length > 0 &&
      typeof notifications[0] === "object" &&
      "read" in notifications[0]
    ) {
      // @ts-expect-error - read property is not typed
      return notifications.filter((n: unknown) => !n.read).length;
    }
    return notifications.length;
  }, [notifications]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="flex sticky top-0 z-40 gap-x-4 items-center px-4 h-16 glass border-b border-primary-200/30 shadow-lg shrink-0 backdrop-blur-xl sm:gap-x-6 sm:px-6 lg:px-8 light:bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 transition-all duration-300 hover:scale-110 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Logo */}
      <div className="flex flex-1 gap-x-4 items-center lg:gap-x-6">
        <Link to="/dashboard" className="flex gap-x-3 items-center group">
          <div className="flex justify-center items-center w-12 h-12 rounded-xl shadow-lg bg-gradient-primary glow-primary group-hover:scale-105 transition-all duration-300">
            <img src={logo} alt="logo" className="w-8 h-8 rounded-lg" />
          </div>
          <span className="hidden font-display font-bold text-xl gradient-text sm:block group-hover:scale-105 transition-transform duration-300">
            {APP_NAME}
          </span>
        </Link>
      </div>

      <div className="flex gap-x-2 items-center lg:gap-x-4">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-3 rounded-xl glass hover:bg-primary-500/20 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 transition-all duration-300 hover:scale-110 hover:rotate-12"
        >
          {theme === "light" ? (
            <MoonIcon className="w-5 h-5" />
          ) : (
            <SunIcon className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => navigate("/profile?tab=alerts")}
          className="relative p-3 rounded-xl glass hover:bg-primary-500/20 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 transition-all duration-300 hover:scale-110"
        >
          <span className="sr-only">View notifications</span>
          <BellIcon className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="flex absolute -top-1 -right-1 justify-center items-center w-6 h-6 text-xs font-bold text-white rounded-full bg-gradient-danger animate-pulse shadow-lg">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Profile dropdown */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-x-3 p-2 rounded-xl glass hover:bg-primary-500/20 transition-all duration-300 hover:scale-105">
            <span className="sr-only">Open user menu</span>
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
              <UserCircleIcon className="w-8 h-8 text-white" />
            </div>
            <span className="hidden lg:flex lg:items-center">
              <span className="text-sm font-display font-semibold leading-6 text-light-text-primary dark:text-dark-text-primary">
                {user?.name}
              </span>
            </span>
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-150"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-3 w-56 origin-top-right rounded-2xl glass shadow-2xl border border-primary-200/30 focus:outline-none animate-scale-in backdrop-blur-xl">
              <div className="px-4 py-3 border-b border-primary-200/20">
                <p className="text-sm font-medium text-light-text-muted dark:text-dark-text-muted">
                  Signed in as
                </p>
                <p className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate">
                  {user?.email}
                </p>
              </div>

              <div className="py-2">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/profile"
                      className={cn(
                        active ? "bg-primary-500/10 text-primary-600 dark:text-primary-400" : "text-light-text-primary dark:text-dark-text-primary",
                        "block px-4 py-3 text-sm font-medium leading-6 transition-all duration-200 hover:bg-primary-500/10 rounded-lg mx-2",
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
                        active ? "bg-primary-500/10 text-primary-600 dark:text-primary-400" : "text-light-text-primary dark:text-dark-text-primary",
                        "block px-4 py-3 text-sm font-medium leading-6 transition-all duration-200 hover:bg-primary-500/10 rounded-lg mx-2",
                      )}
                    >
                      Subscription
                    </Link>
                  )}
                </Menu.Item>
              </div>

              <div className="border-t border-primary-200/20 pt-2">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={cn(
                        active ? "bg-danger-500/10 text-danger-600 dark:text-danger-400" : "text-light-text-primary dark:text-dark-text-primary",
                        "block px-4 py-3 w-full text-sm font-medium leading-6 text-left transition-all duration-200 hover:bg-danger-500/10 rounded-lg mx-2 mb-2",
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
