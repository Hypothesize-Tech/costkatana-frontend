import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LoginForm } from '../../components/auth/LoginForm';
import { NotificationProvider } from '../../contexts/NotificationContext';

// Mock the auth service
vi.mock('../../services/auth.service', () => ({
    authService: {
        login: vi.fn(),
        getToken: vi.fn(() => null),
        getUser: vi.fn(() => null),
    },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
    };
});

// Mock the AuthContext
let mockLogin: any;
let mockIsLoading = false;

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
        isLoading: mockIsLoading,
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const renderLoginForm = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return render(
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <NotificationProvider>
                    <LoginForm />
                </NotificationProvider>
            </QueryClientProvider>
        </BrowserRouter>
    );
};

describe('LoginForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form correctly', () => {
        renderLoginForm();

        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByText(/remember me/i)).toBeInTheDocument();
        expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        renderLoginForm();

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
            expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
        });
    });

    it('submits form successfully', async () => {
        mockLogin = vi.fn().mockImplementation(async () => {
            // Simulate successful login and navigation
            mockNavigate('/dashboard');
            return {
                data: {
                    user: {
                        id: '1',
                        email: 'test@example.com',
                        name: 'Test User',
                        role: 'user',
                    },
                    accessToken: 'mock-access-token',
                    refreshToken: 'mock-refresh-token',
                },
            };
        });

        renderLoginForm();

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'Password123!',
            });
        });

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('shows error message on login failure', async () => {
        mockLogin = vi.fn().mockRejectedValue({
            response: { status: 401, data: { message: 'Invalid credentials' } },
        });

        renderLoginForm();

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'WrongPassword123!' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
        });
    });

    it('toggles password visibility', () => {
        renderLoginForm();

        const passwordInput = screen.getByLabelText(/password/i);
        const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

        // Initially password should be hidden
        expect(passwordInput).toHaveAttribute('type', 'password');

        // Click to show password
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        // Click to hide password again
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('shows loading state during submission', async () => {
        let resolveLogin: any;
        const loginPromise = new Promise(resolve => {
            resolveLogin = resolve;
        });

        mockLogin = vi.fn().mockReturnValue(loginPromise);

        renderLoginForm();

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        fireEvent.click(submitButton);

        // Check loading state - button should be disabled and show loading text
        await waitFor(() => {
            const loadingButton = screen.getByRole('button', { name: /signing in/i });
            expect(loadingButton).toBeInTheDocument();
            expect(loadingButton).toBeDisabled();
        });

        // Resolve the login promise
        resolveLogin({
            data: {
                user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' },
                accessToken: 'mock-token',
                refreshToken: 'mock-refresh-token',
            },
        });

        // Wait for completion
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        });
    });
});
