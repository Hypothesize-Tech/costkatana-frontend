import { useMemo } from "react";
import {
  BellIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { useTheme, useNotifications } from "../../hooks";
import { APP_NAME } from "../../utils/constant";
import logo from "../../assets/logo.jpg";
import { ProfileDropdown } from "./ProfileDropdown";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
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
        <ProfileDropdown />
      </div>
    </header>
  );
};
