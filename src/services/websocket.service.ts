// src/services/websocket.service.ts
import React from 'react';
import { createWebSocket, createEventSource } from '../config/api';

type EventHandler = (data: any) => void;
type ConnectionStateHandler = (connected: boolean) => void;

class WebSocketService {
    private ws: WebSocket | null = null;
    private eventSource: EventSource | null = null;
    private reconnectInterval: number = 5000;
    private maxReconnectAttempts: number = 5;
    private reconnectAttempts: number = 0;
    private eventHandlers: Map<string, Set<EventHandler>> = new Map();
    private connectionStateHandlers: Set<ConnectionStateHandler> = new Set();

    // WebSocket connection for bidirectional communication
    connectWebSocket(path: string = '/ws'): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            this.ws = createWebSocket(path);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.reconnectAttempts = 0;
                this.notifyConnectionState(true);
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.notifyConnectionState(false);
                this.attemptReconnect();
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            this.attemptReconnect();
        }
    }

    // Server-Sent Events for one-way server-to-client communication
    connectEventSource(path: string = '/events'): void {
        if (this.eventSource?.readyState === EventSource.OPEN) {
            return;
        }

        try {
            this.eventSource = createEventSource(path);

            this.eventSource.onopen = () => {
                console.log('EventSource connected');
                this.reconnectAttempts = 0;
                this.notifyConnectionState(true);
            };

            this.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Failed to parse EventSource message:', error);
                }
            };

            // Handle specific event types
            this.eventSource.addEventListener('optimization', (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                this.emit('optimization', data);
            });

            this.eventSource.addEventListener('cost-alert', (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                this.emit('cost-alert', data);
            });

            this.eventSource.addEventListener('usage-update', (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                this.emit('usage-update', data);
            });

            this.eventSource.onerror = () => {
                console.error('EventSource error');
                this.notifyConnectionState(false);
                this.eventSource?.close();
                this.attemptReconnect();
            };
        } catch (error) {
            console.error('Failed to create EventSource:', error);
            this.attemptReconnect();
        }
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

        setTimeout(() => {
            if (this.ws) {
                this.connectWebSocket();
            } else if (this.eventSource) {
                this.connectEventSource();
            }
        }, this.reconnectInterval * this.reconnectAttempts);
    }

    private handleMessage(data: any): void {
        const { type, payload } = data;
        this.emit(type, payload);
    }

    // Send message through WebSocket
    send(type: string, payload: any): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, payload }));
        } else {
            console.warn('WebSocket is not connected');
        }
    }

    // Event handling
    on(event: string, handler: EventHandler): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)!.add(handler);
    }

    off(event: string, handler: EventHandler): void {
        this.eventHandlers.get(event)?.delete(handler);
    }

    private emit(event: string, data: any): void {
        this.eventHandlers.get(event)?.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
    }

    // Connection state handling
    onConnectionStateChange(handler: ConnectionStateHandler): void {
        this.connectionStateHandlers.add(handler);
    }

    offConnectionStateChange(handler: ConnectionStateHandler): void {
        this.connectionStateHandlers.delete(handler);
    }

    private notifyConnectionState(connected: boolean): void {
        this.connectionStateHandlers.forEach(handler => {
            try {
                handler(connected);
            } catch (error) {
                console.error('Error in connection state handler:', error);
            }
        });
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN ||
            this.eventSource?.readyState === EventSource.OPEN;
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.eventHandlers.clear();
        this.connectionStateHandlers.clear();
        this.reconnectAttempts = 0;
    }
}

export const websocketService = new WebSocketService();

// Hook for React components
export const useWebSocket = () => {
    const [connected, setConnected] = React.useState(false);

    React.useEffect(() => {
        const handleConnectionChange = (isConnected: boolean) => {
            setConnected(isConnected);
        };

        websocketService.onConnectionStateChange(handleConnectionChange);
        websocketService.connectEventSource();

        return () => {
            websocketService.offConnectionStateChange(handleConnectionChange);
        };
    }, []);

    return {
        connected,
        on: websocketService.on.bind(websocketService),
        off: websocketService.off.bind(websocketService),
        send: websocketService.send.bind(websocketService),
    };
};