import { useState, useEffect, useCallback, useRef } from 'react';
import { GovernedTask } from '../types/governedAgent';
import { apiClient } from '@/config/api';

interface ChatContextState {
  chatId: string | null;
  governedTasks: GovernedTask[];
  activeTaskId: string | null;
  sseConnections: Map<string, EventSource>;
}

interface UseChatContextReturn {
  chatId: string | null;
  governedTasks: GovernedTask[];
  activeTask: GovernedTask | null;
  isConnected: boolean;
  connectToChat: (chatId: string) => void;
  disconnectFromChat: () => void;
  connectToTask: (taskId: string) => void;
  disconnectFromTask: (taskId: string) => void;
  updateTask: (taskId: string, update: Partial<GovernedTask>) => void;
  setActiveTask: (taskId: string | null) => void;
}

export const useChatContext = (): UseChatContextReturn => {
  const [state, setState] = useState<ChatContextState>({
    chatId: null,
    governedTasks: [],
    activeTaskId: null,
    sseConnections: new Map()
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Connect to chat-wide SSE stream
  const connectToChat = useCallback((chatId: string) => {
    // Disconnect from previous chat if any
    if (state.chatId && state.chatId !== chatId) {
      disconnectFromChat();
    }

    setState(prev => ({ ...prev, chatId }));

    const authToken = localStorage.getItem('access_token');
    const eventSource = new EventSource(
      `${apiClient.defaults.baseURL}/chat/${chatId}/stream?token=${authToken}`
    );

    eventSource.onopen = () => {
      console.log('Connected to chat SSE stream:', chatId);
    };

    eventSource.addEventListener('governed_task_update', (event) => {
      const data = JSON.parse(event.data);
      updateTask(data.taskId, data);
    });

    eventSource.addEventListener('heartbeat', () => {
      // Keep connection alive
    });

    eventSource.onerror = (error) => {
      console.error('Chat SSE error:', error);
      eventSource.close();
      setState(prev => {
        const newConnections = new Map(prev.sseConnections);
        newConnections.delete(`chat-${chatId}`);
        return { ...prev, sseConnections: newConnections };
      });
    };

    setState(prev => {
      const newConnections = new Map(prev.sseConnections);
      newConnections.set(`chat-${chatId}`, eventSource);
      return { ...prev, sseConnections: newConnections };
    });

    // Load existing plans for this chat
    loadChatPlans(chatId);
  }, [state.chatId]);

  // Disconnect from chat SSE stream
  const disconnectFromChat = useCallback(() => {
    const chatKey = `chat-${state.chatId}`;
    const eventSource = state.sseConnections.get(chatKey);
    
    if (eventSource) {
      eventSource.close();
      setState(prev => {
        const newConnections = new Map(prev.sseConnections);
        newConnections.delete(chatKey);
        return { 
          ...prev, 
          sseConnections: newConnections,
          chatId: null,
          governedTasks: []
        };
      });
    }
  }, [state.chatId, state.sseConnections]);

  // Connect to task-specific SSE stream
  const connectToTask = useCallback((taskId: string) => {
    const authToken = localStorage.getItem('access_token');
    const eventSource = new EventSource(
      `${apiClient.defaults.baseURL}/chat/governed/${taskId}/stream?token=${authToken}`
    );

    eventSource.onopen = () => {
      console.log('Connected to task SSE stream:', taskId);
    };

    eventSource.addEventListener('update', (event) => {
      const data = JSON.parse(event.data);
      updateTask(taskId, data);
    });

    eventSource.onerror = (error) => {
      console.error('Task SSE error:', error);
      eventSource.close();
      setState(prev => {
        const newConnections = new Map(prev.sseConnections);
        newConnections.delete(`task-${taskId}`);
        return { ...prev, sseConnections: newConnections };
      });
    };

    setState(prev => {
      const newConnections = new Map(prev.sseConnections);
      newConnections.set(`task-${taskId}`, eventSource);
      return { ...prev, sseConnections: newConnections };
    });
  }, []);

  // Disconnect from task SSE stream
  const disconnectFromTask = useCallback((taskId: string) => {
    const taskKey = `task-${taskId}`;
    const eventSource = state.sseConnections.get(taskKey);
    
    if (eventSource) {
      eventSource.close();
      setState(prev => {
        const newConnections = new Map(prev.sseConnections);
        newConnections.delete(taskKey);
        return { ...prev, sseConnections: newConnections };
      });
    }
  }, [state.sseConnections]);

  // Load all plans for a chat
  const loadChatPlans = useCallback(async (chatId: string) => {
    try {
      const response = await apiClient.get(`/chat/${chatId}/plans`);
      setState(prev => ({ ...prev, governedTasks: response.data.data }));
    } catch (error) {
      console.error('Failed to load chat plans:', error);
    }
  }, []);

  // Update a task in state
  const updateTask = useCallback((taskId: string, update: Partial<GovernedTask>) => {
    setState(prev => ({
      ...prev,
      governedTasks: prev.governedTasks.map(task =>
        task.id === taskId ? { ...task, ...update } : task
      )
    }));
  }, []);

  // Set active task
  const setActiveTask = useCallback((taskId: string | null) => {
    setState(prev => ({ ...prev, activeTaskId: taskId }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Close all SSE connections
      stateRef.current.sseConnections.forEach(eventSource => {
        eventSource.close();
      });
    };
  }, []);

  const activeTask = state.governedTasks.find(task => task.id === state.activeTaskId) || null;
  const isConnected = state.sseConnections.size > 0;

  return {
    chatId: state.chatId,
    governedTasks: state.governedTasks,
    activeTask,
    isConnected,
    connectToChat,
    disconnectFromChat,
    connectToTask,
    disconnectFromTask,
    updateTask,
    setActiveTask
  };
};