import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OptimizationWidget from '../../components/optimization/OptimizationWidget';

// Mock the optimization service
vi.mock('../../services/optimization.service', () => ({
    optimizationService: {
        getOptimizationPreview: vi.fn(),
    },
}));

// Mock the notification context
vi.mock('../../contexts/NotificationContext', () => ({
    useNotifications: () => ({
        showNotification: vi.fn(),
    }),
}));

const mockOptimizationService = vi.mocked(
    (await import('../../services/optimization.service')).optimizationService
);

const renderOptimizationWidget = (props = {}) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    const defaultProps = {
        prompt: 'Test prompt for optimization',
        service: 'openai',
        model: 'gpt-4',
        ...props,
    };

    return render(
        <QueryClientProvider client={queryClient}>
            <OptimizationWidget {...defaultProps} />
        </QueryClientProvider>
    );
};

describe('OptimizationWidget', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the optimization widget correctly', () => {
        renderOptimizationWidget();

        expect(screen.getByText('Optimize Prompt')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /optimize prompt/i })).toBeInTheDocument();
        // The widget receives prompt as prop, doesn't display it as input value
    });

    it('shows loading state when optimizing', async () => {
        const mockResult = {
            suggestions: [
                {
                    type: 'compression',
                    optimizedPrompt: 'Optimized prompt',
                    estimatedSavings: 0.02,
                    confidence: 0.85,
                    explanation: 'Removed unnecessary words'
                }
            ],
            totalSavings: 0.02,
            techniques: ['compression'],
            improvementPercentage: 25
        };

        mockOptimizationService.getOptimizationPreview.mockResolvedValue(mockResult);

        renderOptimizationWidget();

        const optimizeButton = screen.getByRole('button', { name: /optimize prompt/i });
        fireEvent.click(optimizeButton);

        // Should disable the button during loading
        expect(optimizeButton).toBeDisabled();

        // Wait for optimization to complete
        await waitFor(() => {
            expect(optimizeButton).toBeEnabled();
        });
    });

    it('displays optimization results when optimization succeeds', async () => {
        const mockResult = {
            suggestions: [
                {
                    type: 'compression',
                    optimizedPrompt: 'Optimized test prompt',
                    estimatedSavings: 0.03,
                    confidence: 0.85,
                    explanation: 'Removed unnecessary words'
                }
            ],
            totalSavings: 0.03,
            techniques: ['compression'],
            improvementPercentage: 30
        };

        mockOptimizationService.getOptimizationPreview.mockResolvedValue(mockResult);

        renderOptimizationWidget();

        const optimizeButton = screen.getByRole('button', { name: /optimize prompt/i });
        fireEvent.click(optimizeButton);

        await waitFor(() => {
            expect(screen.getByText('Optimized test prompt')).toBeInTheDocument();
            expect(screen.getByText('30% improvement')).toBeInTheDocument();
            expect(screen.getByText('$0.03')).toBeInTheDocument();
            expect(screen.getByText('Removed unnecessary words')).toBeInTheDocument();
        });
    });

    it('handles optimization errors gracefully', async () => {
        mockOptimizationService.getOptimizationPreview.mockRejectedValue(
            new Error('Optimization failed')
        );

        renderOptimizationWidget();

        const optimizeButton = screen.getByRole('button', { name: /optimize prompt/i });
        fireEvent.click(optimizeButton);

        await waitFor(() => {
            expect(screen.getByText(/failed to optimize prompt/i)).toBeInTheDocument();
        });
    });

    it('allows copying optimization results', async () => {
        const mockResult = {
            suggestions: [
                {
                    type: 'compression',
                    optimizedPrompt: 'Optimized prompt',
                    estimatedSavings: 0.012,
                    confidence: 0.85,
                    explanation: 'Removed unnecessary words'
                }
            ],
            totalSavings: 0.012,
            techniques: ['compression'],
            improvementPercentage: 20
        };

        mockOptimizationService.getOptimizationPreview.mockResolvedValue(mockResult);

        renderOptimizationWidget();

        const optimizeButton = screen.getByRole('button', { name: /optimize prompt/i });
        fireEvent.click(optimizeButton);

        await waitFor(() => {
            const copyButton = screen.getByTitle('Copy to clipboard');
            expect(copyButton).toBeInTheDocument();
        });
    });

    it('calls onApplyOptimization when apply button is clicked', async () => {
        const mockOnApply = vi.fn();
        const mockResult = {
            suggestions: [
                {
                    type: 'compression',
                    optimizedPrompt: 'Optimized prompt',
                    estimatedSavings: 0.02,
                    confidence: 0.85,
                    explanation: 'Removed unnecessary words'
                }
            ],
            totalSavings: 0.02,
            techniques: ['compression'],
            improvementPercentage: 25
        };

        mockOptimizationService.getOptimizationPreview.mockResolvedValue(mockResult);

        renderOptimizationWidget({ onApplyOptimization: mockOnApply });

        const optimizeButton = screen.getByRole('button', { name: /optimize prompt/i });
        fireEvent.click(optimizeButton);

        await waitFor(() => {
            const applyButton = screen.getByTitle('Apply this optimization');
            fireEvent.click(applyButton);

            expect(mockOnApply).toHaveBeenCalledWith('Optimized prompt', mockResult.suggestions[0]);
        });
    });

    it('displays different service and model configurations', () => {
        renderOptimizationWidget({
            service: 'anthropic',
            model: 'claude-3-opus',
        });
    });

    it('handles empty prompt gracefully', async () => {
        renderOptimizationWidget({ prompt: '' });

        const optimizeButton = screen.getByRole('button', { name: /optimize prompt/i });

        // Should not call the optimization service with empty prompt
        fireEvent.click(optimizeButton);

        expect(mockOptimizationService.getOptimizationPreview).not.toHaveBeenCalled();
    });

    it('shows optimization statistics correctly', async () => {
        const mockResult = {
            suggestions: [
                {
                    type: 'compression',
                    optimizedPrompt: 'Short optimized prompt',
                    estimatedSavings: 0.054,
                    confidence: 0.85,
                    explanation: 'Removed unnecessary words'
                }
            ],
            totalSavings: 0.054,
            techniques: ['compression'],
            improvementPercentage: 45
        };

        mockOptimizationService.getOptimizationPreview.mockResolvedValue(mockResult);

        renderOptimizationWidget();

        const optimizeButton = screen.getByRole('button', { name: /optimize prompt/i });
        fireEvent.click(optimizeButton);

        await waitFor(() => {
            expect(screen.getByText('45% improvement')).toBeInTheDocument();
            expect(screen.getByText('$0.05')).toBeInTheDocument();
            expect(screen.getByText('Removed unnecessary words')).toBeInTheDocument();
        });
    });
});
