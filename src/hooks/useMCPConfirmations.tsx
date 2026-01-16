import { useEffect, useState, useCallback, useRef } from 'react';
import { MCPConfirmationDialog } from '../components/mcp/MCPConfirmationDialog';

interface MCPConfirmationRequest {
    confirmationId: string;
    resource: string;
    action: string;
    impact: string;
    expiresIn: number;
    integration: string;
    toolName: string;
}

export const useMCPConfirmations = (apiKey?: string) => {
    const [currentRequest, setCurrentRequest] = useState<MCPConfirmationRequest | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);

    const connectSSE = useCallback(() => {
        if (!apiKey) return;

        // Close existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        // Create new SSE connection
        const eventSource = new EventSource(`/api/mcp/sse`, {
            withCredentials: true,
        });

        // Handle connection events
        eventSource.addEventListener('connected', (event) => {
            console.log('MCP SSE connected:', event.data);
        });

        // Handle confirmation requests
        eventSource.addEventListener('confirmation/request', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('MCP confirmation request received:', data);

                setCurrentRequest({
                    confirmationId: data.confirmationId,
                    resource: data.resource,
                    action: data.action,
                    impact: data.impact,
                    expiresIn: data.expiresIn,
                    integration: data.integration || 'unknown',
                    toolName: data.toolName || data.action,
                });
                setIsDialogOpen(true);
            } catch (error) {
                console.error('Failed to parse confirmation request:', error);
            }
        });

        // Handle ping events
        eventSource.addEventListener('ping', () => {
            // Keepalive - no action needed
        });

        // Handle errors
        eventSource.onerror = (error) => {
            console.error('MCP SSE error:', error);
            eventSource.close();

            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                connectSSE();
            }, 5000);
        };

        eventSourceRef.current = eventSource;
    }, [apiKey]);

    useEffect(() => {
        connectSSE();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [connectSSE]);

    const handleConfirm = useCallback(() => {
        setIsDialogOpen(false);
        setCurrentRequest(null);
    }, []);

    const handleDeny = useCallback(() => {
        setIsDialogOpen(false);
        setCurrentRequest(null);
    }, []);

    const ConfirmationDialog = useCallback(() => {
        return (
            <MCPConfirmationDialog
                isOpen={isDialogOpen}
                request={currentRequest || undefined}
                onConfirm={handleConfirm}
                onDeny={handleDeny}
            />
        );
    }, [isDialogOpen, currentRequest, handleConfirm, handleDeny]);

    return {
        ConfirmationDialog,
        hasActiveRequest: isDialogOpen,
        currentRequest,
    };
};
