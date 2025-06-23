/// <reference types="vite/client" />
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Components
import { Layout } from './components/common/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Usage from './pages/Usage';
import { Analytics } from './pages/Analytics';
import { Optimization } from './pages/Optimization';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000, // 1 minute
            cacheTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <AuthProvider>
                    <ThemeProvider>
                        <NotificationProvider>
                            <ErrorBoundary>
                                <Routes>
                                    {/* Public routes */}
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />

                                    {/* Protected routes */}
                                    <Route
                                        path="/"
                                        element={
                                            <ProtectedRoute>
                                                <Layout />
                                            </ProtectedRoute>
                                        }
                                    >
                                        <Route index element={<Navigate to="/dashboard" replace />} />
                                        <Route path="dashboard" element={<Dashboard />} />
                                        <Route path="usage" element={<Usage />} />
                                        <Route path="analytics" element={<Analytics />} />
                                        <Route path="optimization" element={<Optimization />} />
                                        <Route path="settings" element={<Settings />} />
                                    </Route>

                                    {/* 404 page */}
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </ErrorBoundary>
                        </NotificationProvider>
                    </ThemeProvider>
                </AuthProvider>
            </Router>
            {import.meta.env.MODE === 'development' && <ReactQueryDevtools />}
        </QueryClientProvider>
    );
}

export default App;