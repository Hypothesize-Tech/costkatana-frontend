import { createEventSource } from '@/config/api';

type EventCallback = (data: any) => void;

class EventService {
    private eventSource: EventSource | null = null;
    private listeners: Map<string, Set<EventCallback>> = new Map();
    private connectionState: 'connecting' | 'connected' | 'disconnected' = 'disconnected';
    private connectionStateChangeCallbacks: Set<(state: 'connecting' | 'connected' | 'disconnected') => void> = new Set();

    connect() {
        if (this.eventSource && this.eventSource.readyState !== this.eventSource.CLOSED) {
            return;
        }

        try {
            this.setConnectionState('connecting');
            this.eventSource = createEventSource('/events');

            this.eventSource.onopen = () => {
                this.setConnectionState('connected');
                console.info('SSE connection established');
            };

            this.eventSource.onerror = (event) => {
                this.setConnectionState('disconnected');
                console.error('SSE connection error', event);
                this.eventSource?.close();
            };

            this.eventSource.addEventListener('connected', (event) => {
                this.handleEvent('connected', event);
            });

            this.eventSource.addEventListener('usage_update', (event) => {
                this.handleEvent('usage_update', event);
            });

            this.eventSource.addEventListener('optimization_result', (event) => {
                this.handleEvent('optimization_result', event);
            });

            this.eventSource.addEventListener('alert', (event) => {
                this.handleEvent('alert', event);
            });

        } catch (error) {
            this.setConnectionState('disconnected');
            console.error('Failed to create EventSource:', error);
        }
    }

    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
            this.setConnectionState('disconnected');
            console.info('SSE connection closed');
        }
    }

    on(event: string, callback: EventCallback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)?.add(callback);
    }

    off(event: string, callback: EventCallback) {
        this.listeners.get(event)?.delete(callback);
    }

    onConnectionStateChange(callback: (state: 'connecting' | 'connected' | 'disconnected') => void) {
        this.connectionStateChangeCallbacks.add(callback);
        callback(this.connectionState);
    }

    offConnectionStateChange(callback: (state: 'connecting' | 'connected' | 'disconnected') => void) {
        this.connectionStateChangeCallbacks.delete(callback);
    }

    private setConnectionState(state: 'connecting' | 'connected' | 'disconnected') {
        if (this.connectionState !== state) {
            this.connectionState = state;
            this.connectionStateChangeCallbacks.forEach(cb => cb(state));
        }
    }

    private handleEvent(eventName: string, event: MessageEvent) {
        try {
            const data = JSON.parse(event.data);
            const eventListeners = this.listeners.get(eventName);
            if (eventListeners) {
                eventListeners.forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error(`Error in SSE event callback for '${eventName}'`, error);
                    }
                });
            }
        } catch (error) {
            console.error(`Failed to parse SSE message for event '${eventName}':`, error);
        }
    }
}

export const eventService = new EventService(); 