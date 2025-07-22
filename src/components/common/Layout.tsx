import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useState, useEffect } from 'react';

export const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Load collapsed state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState !== null) {
            setSidebarCollapsed(JSON.parse(savedState));
        }
    }, []);

    // Save collapsed state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
    }, [sidebarCollapsed]);

    const toggleSidebarCollapse = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header takes full width */}
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            {/* Main content area with sidebar */}
            <div className="flex h-[calc(100vh-4rem)]">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={toggleSidebarCollapse}
                />

                {/* Main content area - dynamic left margin based on sidebar state */}
                <main
                    className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'
                        }`}
                >
                    <div className="py-6">
                        <div className="w-full px-4 sm:px-6 md:px-8">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};