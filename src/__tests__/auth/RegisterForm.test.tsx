import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegisterForm } from '../../components/auth/RegisterForm';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock the AuthContext
let mockRegister: any;

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        register: mockRegister,
        isLoading: false,
    }),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const renderRegisterForm = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return render(
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <RegisterForm />
            </QueryClientProvider>
        </BrowserRouter>
    );
};

describe('RegisterForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRegister = vi.fn();
    });

    it('renders the registration form correctly', () => {
        renderRegisterForm();

        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/i agree to the terms/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
        expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
    });

    it('accepts valid form input', async () => {
        renderRegisterForm();

        const nameInput = screen.getByLabelText(/full name/i);
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const termsCheckbox = screen.getByLabelText(/i agree to the terms/i);
        const submitButton = screen.getByRole('button', { name: /create account/i });

        // Fill with valid data
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
        fireEvent.click(termsCheckbox);

        // Submit the form
        fireEvent.click(submitButton);

        // Verify the form was submitted (mock should have been called)
        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!',
            });
        });
    });

    it('prevents submission without terms acceptance', async () => {
        renderRegisterForm();

        const nameInput = screen.getByLabelText(/full name/i);
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /create account/i });

        // Fill form with valid data but don't check terms
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });

        // Submit the form without checking terms
        fireEvent.click(submitButton);

        // HTML5 validation should prevent submission
        expect(mockRegister).not.toHaveBeenCalled();
    });

    it('navigates to login page when sign in link is clicked', () => {
        renderRegisterForm();

        const signInLink = screen.getByText(/sign in/i);
        expect(signInLink).toBeInTheDocument();
        expect(signInLink.closest('a')).toHaveAttribute('href', '/login');
    });

    it('displays password requirements text', () => {
        renderRegisterForm();

        expect(screen.getByText(/must be at least 8 characters with uppercase, lowercase, and numbers/i)).toBeInTheDocument();
    });

    it('has terms and conditions links', () => {
        renderRegisterForm();

        const termsLink = screen.getByText(/terms and conditions/i);
        const privacyLink = screen.getByText(/privacy policy/i);

        expect(termsLink).toBeInTheDocument();
        expect(termsLink.closest('a')).toHaveAttribute('href', '/terms');
        expect(privacyLink).toBeInTheDocument();
        expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy');
    });

    it('requires terms checkbox to be checked', async () => {
        renderRegisterForm();

        const emailInput = screen.getByLabelText(/email address/i);
        const nameInput = screen.getByLabelText(/full name/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /create account/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
        // Don't check terms checkbox
        fireEvent.click(submitButton);

        // HTML5 validation should prevent submission without required checkbox
        await waitFor(() => {
            expect(mockRegister).not.toHaveBeenCalled();
        });
    });

    it('toggles password visibility', () => {
        renderRegisterForm();

        const passwordInput = screen.getByLabelText(/^password$/i);
        const toggleButton = passwordInput.parentElement?.querySelector('button');

        expect(passwordInput).toHaveAttribute('type', 'password');

        if (toggleButton) {
            fireEvent.click(toggleButton);
            expect(passwordInput).toHaveAttribute('type', 'text');

            fireEvent.click(toggleButton);
            expect(passwordInput).toHaveAttribute('type', 'password');
        }
    });

    it('toggles confirm password visibility', () => {
        renderRegisterForm();

        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const toggleButton = confirmPasswordInput.parentElement?.querySelector('button');

        expect(confirmPasswordInput).toHaveAttribute('type', 'password');

        if (toggleButton) {
            fireEvent.click(toggleButton);
            expect(confirmPasswordInput).toHaveAttribute('type', 'text');

            fireEvent.click(toggleButton);
            expect(confirmPasswordInput).toHaveAttribute('type', 'password');
        }
    });

    it('submits form successfully', async () => {
        mockRegister = vi.fn().mockResolvedValue({
            data: {
                id: '1',
                email: 'test@example.com',
                name: 'John Doe',
                role: 'user',
            },
        });

        renderRegisterForm();

        const emailInput = screen.getByLabelText(/email address/i);
        const nameInput = screen.getByLabelText(/full name/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const termsCheckbox = screen.getByLabelText(/i agree to the terms/i);
        const submitButton = screen.getByRole('button', { name: /create account/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
        fireEvent.click(termsCheckbox);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'test@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!',
            });
        });
    });

    it('shows loading state during submission', async () => {
        mockRegister = vi.fn().mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve({
                data: {
                    id: '1',
                    email: 'test@example.com',
                    name: 'John Doe',
                    role: 'user',
                },
            }), 100))
        );

        renderRegisterForm();

        const emailInput = screen.getByLabelText(/email address/i);
        const nameInput = screen.getByLabelText(/full name/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const termsCheckbox = screen.getByLabelText(/i agree to the terms/i);
        const submitButton = screen.getByRole('button', { name: /create account/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
        fireEvent.click(termsCheckbox);
        fireEvent.click(submitButton);

        // Check that button is disabled during loading
        await waitFor(() => {
            expect(submitButton).toBeDisabled();
        });

        // Check that button text changes to loading state
        expect(screen.getByText(/creating account/i)).toBeInTheDocument();

        // Wait for the operation to complete
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /create account/i })).toBeEnabled();
        });
    });

    it('shows error message for existing email (409)', async () => {
        const errorResponse = {
            response: {
                status: 409,
                data: { message: 'Email already exists' }
            }
        };
        mockRegister = vi.fn().mockRejectedValue(errorResponse);

        renderRegisterForm();

        const emailInput = screen.getByLabelText(/email address/i);
        const nameInput = screen.getByLabelText(/full name/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const termsCheckbox = screen.getByLabelText(/i agree to the terms/i);
        const submitButton = screen.getByRole('button', { name: /create account/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
        fireEvent.click(termsCheckbox);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/this email is already registered/i)).toBeInTheDocument();
        });
    });

    it('shows generic error message for other registration failures', async () => {
        const errorResponse = {
            response: {
                status: 500,
                data: { message: 'Internal server error' }
            }
        };
        mockRegister = vi.fn().mockRejectedValue(errorResponse);

        renderRegisterForm();

        const emailInput = screen.getByLabelText(/email address/i);
        const nameInput = screen.getByLabelText(/full name/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const termsCheckbox = screen.getByLabelText(/i agree to the terms/i);
        const submitButton = screen.getByRole('button', { name: /create account/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
        fireEvent.click(termsCheckbox);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/an error occurred\. please try again\./i)).toBeInTheDocument();
        });
    });
});
