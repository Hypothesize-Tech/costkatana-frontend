import { useState, useEffect, useCallback } from 'react';
import { sessionRecordingService } from '../services/sessionRecording.service';
import { AIInteraction } from '../types/sessionReplay.types';
import { useAuth } from '../contexts/AuthContext';

interface UseSessionRecordingOptions {
    feature: string;
    autoStart?: boolean;
    userId?: string;
    label?: string;
    metadata?: Record<string, any>;
}

interface UserAction {
    action: string;
    details?: any;
}

interface CodeContext {
    filePath: string;
    content: string;
    language?: string;
}

export const useSessionRecording = (options: UseSessionRecordingOptions) => {
    const { user } = useAuth();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Start recording
    const startRecording = useCallback(async () => {
        try {
            setError(null);
            
            // Get userId from auth context or fallback to options
            const userId = options.userId || user?.id || 'unknown';
            
            const newSessionId = await sessionRecordingService.startRecording({
                userId,
                feature: options.feature,
                label: options.label,
                metadata: options.metadata
            });
            
            setSessionId(newSessionId);
            setIsRecording(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
            setError(errorMessage);
            console.error('Failed to start recording:', err);
        }
    }, [options.userId, options.feature, options.label, options.metadata, user?.id]);

    // End recording
    const endRecording = useCallback(async () => {
        try {
            await sessionRecordingService.endRecording();
            setSessionId(null);
            setIsRecording(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to end recording';
            setError(errorMessage);
            console.error('Failed to end recording:', err);
        }
    }, []);

    // Record AI interaction
    const recordInteraction = useCallback(async (interaction: AIInteraction) => {
        if (!isRecording) {
            console.warn('Cannot record interaction: Not currently recording');
            return;
        }

        try {
            await sessionRecordingService.recordInteraction(interaction);
        } catch (err) {
            console.error('Failed to record interaction:', err);
        }
    }, [isRecording]);

    // Record user action
    const recordAction = useCallback(async (action: UserAction) => {
        if (!isRecording) {
            return;
        }

        try {
            await sessionRecordingService.recordUserAction(action);
        } catch (err) {
            console.error('Failed to record action:', err);
        }
    }, [isRecording]);

    // Record code context
    const recordContext = useCallback(async (context: CodeContext) => {
        if (!isRecording) {
            return;
        }

        try {
            await sessionRecordingService.recordCodeContext(context);
        } catch (err) {
            console.error('Failed to record context:', err);
        }
    }, [isRecording]);

    // Record complete interaction (AI + action + context)
    const recordComplete = useCallback(async (
        interaction: AIInteraction,
        action?: UserAction,
        context?: CodeContext
    ) => {
        if (!isRecording) {
            console.warn('Cannot record: Not currently recording');
            return;
        }

        try {
            await sessionRecordingService.recordCompleteInteraction(interaction, action, context);
        } catch (err) {
            console.error('Failed to record complete interaction:', err);
        }
    }, [isRecording]);

    // Auto-start recording if enabled
    useEffect(() => {
        if (options.autoStart && !isRecording) {
            startRecording();
        }

        // Auto-end recording on unmount
        return () => {
            if (isRecording) {
                endRecording();
            }
        };
    }, [options.autoStart]); // Only run on mount

    return {
        sessionId,
        isRecording,
        error,
        startRecording,
        endRecording,
        recordInteraction,
        recordAction,
        recordContext,
        recordComplete
    };
};


