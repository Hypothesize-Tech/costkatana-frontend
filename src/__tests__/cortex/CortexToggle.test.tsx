import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CortexToggle } from '../../components/cortex/CortexToggle';

describe('CortexToggle', () => {
    it('renders the Cortex toggle interface', () => {
        const mockOnChange = vi.fn();

        render(
            <CortexToggle
                enabled={false}
                onChange={mockOnChange}
            />
        );

        expect(screen.getByText('Enable Cortex Meta-Language')).toBeInTheDocument();
        expect(screen.getByText('Use traditional optimization methods')).toBeInTheDocument();
        expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('shows enabled state when Cortex is active', () => {
        const mockOnChange = vi.fn();

        render(
            <CortexToggle
                enabled={true}
                onChange={mockOnChange}
            />
        );

        expect(screen.getByText('AI-powered semantic optimization active')).toBeInTheDocument();
        expect(screen.getByText('Enhanced')).toBeInTheDocument();
        expect(screen.getByRole('switch')).toHaveAttribute('checked');
    });

    it('calls onChange when toggle is clicked', () => {
        const mockOnChange = vi.fn();

        render(
            <CortexToggle
                enabled={false}
                onChange={mockOnChange}
            />
        );

        const toggleSwitch = screen.getByRole('switch');
        fireEvent.click(toggleSwitch);

        expect(mockOnChange).toHaveBeenCalledWith(true);
    });

    it('shows tooltip information on hover', () => {
        const mockOnChange = vi.fn();

        render(
            <CortexToggle
                enabled={false}
                onChange={mockOnChange}
            />
        );

        const infoIcon = screen.getByRole('img', { hidden: true });
        expect(infoIcon).toBeInTheDocument();

        // Tooltip should be present but hidden initially
        const tooltip = screen.getByText(/Advanced AI optimization using semantic structures/);
        expect(tooltip).toBeInTheDocument();
    });

    it('displays advanced options toggle when Cortex is enabled', () => {
        const mockOnChange = vi.fn();
        const mockOnAdvancedToggle = vi.fn();

        render(
            <CortexToggle
                enabled={true}
                onChange={mockOnChange}
                showAdvancedOptions={false}
                onAdvancedToggle={mockOnAdvancedToggle}
            />
        );

        const advancedToggle = screen.getByText(/advanced cortex settings/i);
        expect(advancedToggle).toBeInTheDocument();

        fireEvent.click(advancedToggle);

        expect(mockOnAdvancedToggle).toHaveBeenCalledWith(true);
    });

    it('shows advanced options when showAdvancedOptions is true', () => {
        const mockOnChange = vi.fn();
        const mockOnAdvancedToggle = vi.fn();

        render(
            <CortexToggle
                enabled={true}
                onChange={mockOnChange}
                showAdvancedOptions={true}
                onAdvancedToggle={mockOnAdvancedToggle}
            />
        );

        expect(screen.getByText(/configure cortex processing options/i)).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
        const mockOnChange = vi.fn();

        render(
            <CortexToggle
                enabled={false}
                onChange={mockOnChange}
                disabled={true}
            />
        );

        const toggleSwitch = screen.getByRole('switch');
        expect(toggleSwitch).toBeDisabled();
    });

    it('applies correct CSS classes for enabled state', () => {
        const mockOnChange = vi.fn();

        render(
            <CortexToggle
                enabled={true}
                onChange={mockOnChange}
            />
        );

        const toggleSwitch = screen.getByRole('switch');
        expect(toggleSwitch).toHaveClass('bg-gradient-primary');
    });

    it('applies correct CSS classes for disabled state', () => {
        const mockOnChange = vi.fn();

        render(
            <CortexToggle
                enabled={false}
                onChange={mockOnChange}
                disabled={true}
            />
        );

        const toggleSwitch = screen.getByRole('switch');
        expect(toggleSwitch).toHaveClass('opacity-50');
    });

    it('handles configuration props correctly', () => {
        const mockOnChange = vi.fn();
        const mockOnConfigChange = vi.fn();
        const mockConfig = {
            encodingModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
            coreProcessingModel: 'anthropic.claude-opus-4-1-20250805-v1:0',
            decodingModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
            processingOperation: 'optimize' as const,
            optimizationLevel: 'balanced' as const,
            outputStyle: 'technical' as const,
            outputFormat: 'plain' as const,
            enableSemanticCache: true,
            enableStructuredContext: false,
            preserveSemantics: true,
            enableIntelligentRouting: false,
            enableSastProcessing: false,
            enableAmbiguityResolution: false,
            enableCrossLingualMode: false,
        };

        render(
            <CortexToggle
                enabled={true}
                onChange={mockOnChange}
                config={mockConfig}
                onConfigChange={mockOnConfigChange}
            />
        );

        // Component should accept config props without errors
        expect(screen.getByText('AI-powered semantic optimization active')).toBeInTheDocument();
    });

    it('displays correct status text based on enabled state', () => {
        const mockOnChange = vi.fn();

        const { rerender } = render(
            <CortexToggle
                enabled={false}
                onChange={mockOnChange}
            />
        );

        expect(screen.getByText('Use traditional optimization methods')).toBeInTheDocument();

        rerender(
            <CortexToggle
                enabled={true}
                onChange={mockOnChange}
            />
        );

        expect(screen.getByText('AI-powered semantic optimization active')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
        const mockOnChange = vi.fn();

        render(
            <CortexToggle
                enabled={false}
                onChange={mockOnChange}
            />
        );

        const toggleSwitch = screen.getByRole('switch');
        expect(toggleSwitch).toHaveAttribute('aria-checked', 'false');

        const { rerender } = render(
            <CortexToggle
                enabled={true}
                onChange={mockOnChange}
            />
        );

        const toggleSwitchEnabled = screen.getByRole('switch');
        expect(toggleSwitchEnabled).toHaveAttribute('aria-checked', 'true');
    });

    it('animates the toggle switch position correctly', () => {
        const mockOnChange = vi.fn();

        render(
            <CortexToggle
                enabled={false}
                onChange={mockOnChange}
            />
        );

        const toggleSwitch = screen.getByRole('switch');
        const toggleKnob = toggleSwitch.querySelector('span');

        // When disabled, knob should be on the left
        expect(toggleKnob).toHaveClass('translate-x-1');

        const { rerender } = render(
            <CortexToggle
                enabled={true}
                onChange={mockOnChange}
            />
        );

        const toggleSwitchEnabled = screen.getByRole('switch');
        const toggleKnobEnabled = toggleSwitchEnabled.querySelector('span');

        // When enabled, knob should be on the right
        expect(toggleKnobEnabled).toHaveClass('translate-x-7');
    });
});
