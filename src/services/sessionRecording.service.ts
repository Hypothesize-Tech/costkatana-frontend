import { API_BASE_URL } from '../config/api';
import { AIInteraction } from '../types/sessionReplay.types';

interface RecordingConfig {
    userId: string;
    feature: string;
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

class SessionRecordingService {
    private activeSessionId: string | null = null;
    private isRecording: boolean = false;
    private feature: string | null = null;

    /**
     * Start a new recording session
     */
    async startRecording(config: RecordingConfig): Promise<string> {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${API_BASE_URL}/api/session-replay/recording/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: config.userId,
                    feature: config.feature,
                    label: config.label,
                    metadata: config.metadata
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to start recording: ${response.statusText}`);
            }

            const data = await response.json();
            this.activeSessionId = data.sessionId;
            this.isRecording = true;
            this.feature = config.feature;

            console.log(`📹 Session recording started: ${this.activeSessionId} (${config.feature})`);
            
            return data.sessionId;
        } catch (error) {
            console.error('Failed to start recording session:', error);
            throw error;
        }
    }

    /**
     * Record an AI interaction
     */
    async recordInteraction(interaction: AIInteraction): Promise<void> {
        if (!this.isRecording || !this.activeSessionId) {
            console.warn('Cannot record interaction: No active recording session');
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${API_BASE_URL}/api/session-replay/${this.activeSessionId}/snapshot`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    aiInteraction: {
                        model: interaction.model,
                        prompt: interaction.prompt,
                        response: interaction.response,
                        parameters: interaction.parameters,
                        tokens: interaction.tokens,
                        cost: interaction.cost
                    },
                    latency: interaction.latency,
                    provider: interaction.provider,
                    requestMetadata: interaction.requestMetadata,
                    responseMetadata: interaction.responseMetadata
                })
            });

            if (!response.ok) {
                console.error(`Failed to record interaction: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to record AI interaction:', error);
        }
    }

    /**
     * Record a user action
     */
    async recordUserAction(action: UserAction): Promise<void> {
        if (!this.isRecording || !this.activeSessionId) {
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${API_BASE_URL}/api/session-replay/${this.activeSessionId}/snapshot`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userAction: {
                        action: action.action,
                        details: action.details
                    }
                })
            });

            if (!response.ok) {
                console.error(`Failed to record user action: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to record user action:', error);
        }
    }

    /**
     * Record code context
     */
    async recordCodeContext(context: CodeContext): Promise<void> {
        if (!this.isRecording || !this.activeSessionId) {
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${API_BASE_URL}/api/session-replay/${this.activeSessionId}/snapshot`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    codeContext: {
                        filePath: context.filePath,
                        content: context.content,
                        language: context.language
                    }
                })
            });

            if (!response.ok) {
                console.error(`Failed to record code context: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to record code context:', error);
        }
    }

    /**
     * Record a complete interaction (AI + action + context in one call)
     */
    async recordCompleteInteraction(
        interaction: AIInteraction,
        action?: UserAction,
        context?: CodeContext
    ): Promise<void> {
        if (!this.isRecording || !this.activeSessionId) {
            console.warn('Cannot record: No active recording session');
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const payload: any = {
                aiInteraction: {
                    model: interaction.model,
                    prompt: interaction.prompt,
                    response: interaction.response,
                    parameters: interaction.parameters,
                    tokens: interaction.tokens,
                    cost: interaction.cost
                },
                latency: interaction.latency,
                provider: interaction.provider,
                requestMetadata: interaction.requestMetadata,
                responseMetadata: interaction.responseMetadata,
                captureSystemMetrics: true
            };

            if (action) {
                payload.userAction = {
                    action: action.action,
                    details: action.details
                };
            }

            if (context) {
                payload.codeContext = {
                    filePath: context.filePath,
                    content: context.content,
                    language: context.language
                };
            }

            const response = await fetch(`${API_BASE_URL}/api/session-replay/${this.activeSessionId}/snapshot`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error(`Failed to record complete interaction: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to record complete interaction:', error);
        }
    }

    /**
     * End the active recording session
     */
    async endRecording(): Promise<void> {
        if (!this.isRecording || !this.activeSessionId) {
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            // No specific API endpoint for ending, just mark locally
            console.log(`📹 Session recording ended: ${this.activeSessionId}`);
            
            this.activeSessionId = null;
            this.isRecording = false;
            this.feature = null;
        } catch (error) {
            console.error('Failed to end recording session:', error);
        }
    }

    /**
     * Get the current active session ID
     */
    getActiveSessionId(): string | null {
        return this.activeSessionId;
    }

    /**
     * Check if currently recording
     */
    isCurrentlyRecording(): boolean {
        return this.isRecording;
    }

    /**
     * Get the current feature being recorded
     */
    getCurrentFeature(): string | null {
        return this.feature;
    }
}

export const sessionRecordingService = new SessionRecordingService();


