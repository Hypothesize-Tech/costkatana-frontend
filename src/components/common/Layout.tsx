import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useState } from 'react';

export const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header takes full width */}
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            {/* Main content area with sidebar */}
            <div className="flex h-[calc(100vh-4rem)]">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* Main content area - add left margin on desktop to account for fixed sidebar */}
                <main className="flex-1 overflow-y-auto lg:ml-72">
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