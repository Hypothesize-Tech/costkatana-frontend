import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuickOptimize } from '../../components/optimization/QuickOptimize';

// Mock the optimization service
vi.mock('../../services/optimization.service', () => ({
    optimizationService: {
        createOptimization: vi.fn(),
    },
}));

// Mock the notification context
vi.mock('../../contexts/NotificationContext', () => ({
    useNotifications: () => ({
        showNotification: vi.fn(),
    }),
}));

// Mock Cortex components
vi.mock('../../components/cortex', () => ({
    CortexToggle: ({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) => (
        <div data-testid="cortex-toggle">
            <span>Cortex Enabled: {enabled ? 'Yes' : 'No'}</span>
            <button onClick={() => onChange(!enabled)}>Toggle Cortex</button>
        </div>
    ),
    CortexResultsDisplay: ({ result }: { result: any }) => (
        <div data-testid="cortex-results">
            {result && <span>Cortex Result: {result.optimizedPrompt}</span>}
        </div>
    ),
    CortexConfigPanel: ({ config, onChange }: { config: any; onChange: (config: any) => void }) => (
        <div data-testid="cortex-config">
            <span>Cortex Config Panel</span>
        </div>
    ),
}));

const mockOptimizationService = vi.mocked(
    (await import('../../services/optimization.service')).optimizationService
);

const renderQuickOptimize = (props = {}) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <QuickOptimize {...props} />
        </QueryClientProvider>
    );
};

describe('QuickOptimize', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the quick optimize interface', () => {
        renderQuickOptimize();

        expect(screen.getByPlaceholderText(/paste your ai query here for instant usage optimization/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /optimize now/i })).toBeInTheDocument();
        expect(screen.getByTestId('cortex-toggle')).toBeInTheDocument();
    });

    it('toggles Cortex mode on and off', () => {
        renderQuickOptimize();

        const toggleButton = screen.getByRole('button', { name: /toggle cortex/i });

        // Initially disabled
        expect(screen.getByText('Cortex Enabled: No')).toBeInTheDocument();

        // Enable Cortex
        fireEvent.click(toggleButton);
        expect(screen.getByText('Cortex Enabled: Yes')).toBeInTheDocument();

        // Disable Cortex
        fireEvent.click(toggleButton);
        expect(screen.getByText('Cortex Enabled: No')).toBeInTheDocument();
    });

    it('optimizes prompt without Cortex', async () => {
        const mockResult = {
            _id: 'opt-1',
            userId: 'user-1',
            originalPrompt: 'Test prompt without Cortex',
            optimizedPrompt: 'Optimized prompt',
            optimizationTechniques: ['compression'],
            originalTokens: 100,
            optimizedTokens: 80,
            tokensSaved: 20,
            originalCost: 0.10,
            optimizedCost: 0.08,
            costSaved: 0.02,
            improvementPercentage: 20,
            service: 'openai',
            model: 'gpt-4',
            category: 'prompt_reduction' as const,
            suggestions: [],
            metadata: {},
            applied: false,
            appliedCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mockOptimizationService.createOptimization.mockResolvedValue(mockResult);

        renderQuickOptimize();

        const promptInput = screen.getByPlaceholderText(/paste your ai query here for instant usage optimization/i);
        const optimizeButton = screen.getByRole('button', { name: /optimize now/i });

        fireEvent.change(promptInput, { target: { value: 'Test prompt without Cortex' } });
        fireEvent.click(optimizeButton);

        await waitFor(() => {
            expect(mockOptimizationService.createOptimization).toHaveBeenCalledWith(
                expect.objectContaining({
                    prompt: 'Test prompt without Cortex',
                    enableCortex: false,
                })
            );
        });
    });

    it('optimizes prompt with Cortex enabled', async () => {
        const mockResult = {
            _id: 'opt-2',
            userId: 'user-1',
            originalPrompt: 'Test prompt with Cortex',
            optimizedPrompt: 'Cortex optimized prompt',
            optimizationTechniques: ['compression'],
            originalTokens: 120,
            optimizedTokens: 72,
            tokensSaved: 48,
            originalCost: 0.12,
            optimizedCost: 0.072,
            costSaved: 0.048,
            improvementPercentage: 40,
            service: 'openai',
            model: 'gpt-4',
            category: 'prompt_reduction' as const,
            suggestions: [],
            metadata: {},
            applied: false,
            appliedCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mockOptimizationService.createOptimization.mockResolvedValue(mockResult);

        renderQuickOptimize();

        const promptInput = screen.getByPlaceholderText(/paste your ai query here for instant usage optimization/i);
        const toggleButton = screen.getByRole('button', { name: /toggle cortex/i });
        const optimizeButton = screen.getByRole('button', { name: /optimize now/i });

        // Enable Cortex
        fireEvent.click(toggleButton);

        fireEvent.change(promptInput, { target: { value: 'Test prompt with Cortex' } });
        fireEvent.click(optimizeButton);

        await waitFor(() => {
            expect(mockOptimizationService.createOptimization).toHaveBeenCalledWith(
                expect.objectContaining({
                    prompt: 'Test prompt with Cortex',
                    enableCortex: true,
                })
            );
        });
    });

    it('shows loading state during optimization', async () => {
        mockOptimizationService.createOptimization.mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve({
                _id: 'opt-3',
                userId: 'user-1',
                originalPrompt: 'Test prompt',
                optimizedPrompt: 'Optimized prompt',
                optimizationTechniques: ['compression'],
                originalTokens: 80,
                optimizedTokens: 60,
                tokensSaved: 20,
                originalCost: 0.08,
                optimizedCost: 0.06,
                costSaved: 0.02,
                improvementPercentage: 25,
                service: 'openai',
                model: 'gpt-4',
                category: 'prompt_reduction' as const,
                suggestions: [],
                metadata: {},
                applied: false,
                appliedCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }), 100))
        );

        renderQuickOptimize();

        const promptInput = screen.getByPlaceholderText(/paste your ai query here for instant usage optimization/i);
        const optimizeButton = screen.getByRole('button', { name: /optimize now/i });

        fireEvent.change(promptInput, { target: { value: 'Test prompt' } });
        fireEvent.click(optimizeButton);

        // Should show loading state
        expect(screen.getByText(/optimizing\.\.\./i)).toBeInTheDocument();
        expect(optimizeButton).toBeDisabled();

        // Wait for completion
        await waitFor(() => {
            expect(screen.queryByText(/optimizing/i)).not.toBeInTheDocument();
            expect(optimizeButton).toBeEnabled();
        });
    });

    it('handles optimization errors', async () => {
        mockOptimizationService.createOptimization.mockRejectedValue(
            new Error('Optimization service unavailable')
        );

        renderQuickOptimize();

        const promptInput = screen.getByPlaceholderText(/paste your ai query here for instant usage optimization/i);
        const optimizeButton = screen.getByRole('button', { name: /optimize now/i });

        fireEvent.change(promptInput, { target: { value: 'Test prompt' } });
        fireEvent.click(optimizeButton);

        await waitFor(() => {
            expect(screen.getByText(/optimization error/i)).toBeInTheDocument();
        });
    });

    it('displays optimization results', async () => {
        const mockResult = {
            _id: 'opt-4',
            userId: 'user-1',
            originalPrompt: 'Original prompt text',
            optimizedPrompt: 'Optimized prompt text',
            optimizationTechniques: ['compression'],
            originalTokens: 100,
            optimizedTokens: 65,
            tokensSaved: 35,
            originalCost: 0.10,
            optimizedCost: 0.07,
            costSaved: 0.03,
            improvementPercentage: 35,
            service: 'openai',
            model: 'gpt-4',
            category: 'prompt_reduction' as const,
            suggestions: [],
            metadata: {},
            applied: false,
            appliedCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mockOptimizationService.createOptimization.mockResolvedValue(mockResult);

        renderQuickOptimize();

        const promptInput = screen.getByPlaceholderText(/paste your ai query here for instant usage optimization/i);
        const optimizeButton = screen.getByRole('button', { name: /optimize now/i });

        fireEvent.change(promptInput, { target: { value: 'Original prompt text' } });
        fireEvent.click(optimizeButton);

        await waitFor(() => {
            expect(screen.getByText('Optimized prompt text')).toBeInTheDocument();
            expect(screen.getByText('35% token reduction')).toBeInTheDocument();
            expect(screen.getByText('$0.10 saved')).toBeInTheDocument();
        });
    });

    it('shows different results for Cortex vs normal optimization', async () => {
        const normalResult = {
            _id: 'opt-normal',
            userId: 'user-1',
            originalPrompt: 'Test prompt',
            optimizedPrompt: 'Normal optimized prompt',
            optimizationTechniques: ['compression'],
            originalTokens: 80,
            optimizedTokens: 60,
            tokensSaved: 20,
            originalCost: 0.08,
            optimizedCost: 0.06,
            costSaved: 0.02,
            improvementPercentage: 25,
            service: 'openai',
            model: 'gpt-4',
            category: 'prompt_reduction' as const,
            suggestions: [],
            metadata: {},
            applied: false,
            appliedCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const cortexResult = {
            _id: 'opt-cortex',
            userId: 'user-1',
            originalPrompt: 'Test prompt',
            optimizedPrompt: 'Cortex optimized prompt',
            optimizationTechniques: ['compression'],
            originalTokens: 100,
            optimizedTokens: 55,
            tokensSaved: 45,
            originalCost: 0.10,
            optimizedCost: 0.055,
            costSaved: 0.045,
            improvementPercentage: 45,
            service: 'openai',
            model: 'gpt-4',
            category: 'prompt_reduction' as const,
            suggestions: [],
            metadata: {
                cortex: {
                    processingTime: 100,
                    encodingConfidence: 0.85,
                    decodingConfidence: 0.85,
                    semanticIntegrity: 0.9,
                    tokensSaved: 45,
                    reductionPercentage: 45,
                    optimizationsApplied: 1,
                    cortexModel: {
                        encoder: 'claude-3-haiku',
                        core: 'claude-3-sonnet',
                        decoder: 'claude-3-haiku'
                    },
                    lightweightCortex: false
                }
            },
            applied: false,
            appliedCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Test normal optimization first
        mockOptimizationService.createOptimization.mockResolvedValueOnce(normalResult);
        renderQuickOptimize();

        const promptInput = screen.getByPlaceholderText(/paste your ai query here for instant usage optimization/i);
        const optimizeButton = screen.getByRole('button', { name: /optimize now/i });

        fireEvent.change(promptInput, { target: { value: 'Test prompt' } });
        fireEvent.click(optimizeButton);

        await waitFor(() => {
            expect(screen.getByText('Normal optimized prompt')).toBeInTheDocument();
            expect(screen.getByText('20% token reduction')).toBeInTheDocument();
        });

        // Reset and test cortex optimization
        const { rerender } = renderQuickOptimize();
        mockOptimizationService.createOptimization.mockResolvedValueOnce(cortexResult);

        const toggleButton = screen.getByRole('button', { name: /toggle cortex/i });
        fireEvent.click(toggleButton);
        fireEvent.change(promptInput, { target: { value: 'Test prompt' } });
        fireEvent.click(optimizeButton);

        await waitFor(() => {
            expect(screen.getByText('Cortex optimized prompt')).toBeInTheDocument();
            expect(screen.getByText('45% token reduction')).toBeInTheDocument();
        });
    });

    it('calls onOptimizationCreated callback when optimization is created', async () => {
        const mockOnOptimizationCreated = vi.fn();
        const mockResult = {
            _id: 'opt-cortex',
            userId: 'user-1',
            originalPrompt: 'Test prompt',
            optimizedPrompt: 'Cortex optimized prompt',
            optimizationTechniques: ['compression'],
            originalTokens: 100,
            optimizedTokens: 55,
            tokensSaved: 45,
            originalCost: 0.10,
            optimizedCost: 0.055,
            costSaved: 0.045,
            improvementPercentage: 45,
            service: 'openai',
            model: 'gpt-4',
            category: 'prompt_reduction' as const,
            suggestions: [],
            metadata: {},
            applied: false,
            appliedCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mockOptimizationService.createOptimization.mockResolvedValue(mockResult);

        renderQuickOptimize({ onOptimizationCreated: mockOnOptimizationCreated });

        const promptInput = screen.getByPlaceholderText(/paste your ai query here for instant usage optimization/i);
        const optimizeButton = screen.getByRole('button', { name: /optimize now/i });

        fireEvent.change(promptInput, { target: { value: 'Test prompt' } });
        fireEvent.click(optimizeButton);

        await waitFor(() => {
            expect(mockOnOptimizationCreated).toHaveBeenCalledWith(mockResult);
        });
    });

    it('handles empty prompt gracefully', async () => {
        renderQuickOptimize();

        const optimizeButton = screen.getByRole('button', { name: /optimize now/i });

        // Try to optimize with empty prompt
        fireEvent.click(optimizeButton);

        // Should not call the service
        expect(mockOptimizationService.createOptimization).not.toHaveBeenCalled();
    });

    it('displays advanced Cortex options when enabled', () => {
        renderQuickOptimize();

        const toggleButton = screen.getByRole('button', { name: /toggle cortex/i });

        // Enable Cortex
        fireEvent.click(toggleButton);

        // Should show advanced options (Cortex Config Panel)
        expect(screen.getByText('Advanced Cortex Settings')).toBeInTheDocument();
    });
});
