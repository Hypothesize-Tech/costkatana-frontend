import React, { useEffect, useRef, useState } from 'react';
import {
  ensureSession,
  postMessage,
  subscribeWidgetRun,
} from '../../../services/widget.service';
import {
  ArrowPathIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  pending?: boolean;
  pausedForApproval?: boolean;
}

const EmbedChat: React.FC<{
  deploymentId: string;
  onClose?: () => void;
}> = ({ deploymentId, onClose }) => {
  const [theme, setTheme] = useState<{ primary?: string; surface?: string }>({});
  const [welcome, setWelcome] = useState<string>('Hi — how can I help?');
  const [agentName, setAgentName] = useState<string>('Assistant');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const subscribeOff = useRef<(() => void) | null>(null);

  useEffect(() => {
    ensureSession(deploymentId)
      .then((session) => {
        setTheme(session.theme ?? {});
        setWelcome(session.welcomeMessage ?? 'Hi!');
        // Use session-issued agent name if the backend returned one;
        // fall back to a neutral label otherwise.
        if ((session as any).agentName) {
          setAgentName((session as any).agentName);
        }
        setMessages([
          {
            id: 'welcome',
            role: 'agent',
            text: session.welcomeMessage ?? 'Hi!',
          },
        ]);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ?? err.message ?? 'Could not start session',
        );
      });
    return () => subscribeOff.current?.();
  }, [deploymentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || pending) return;
    setInput('');
    setError(null);

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text };
    const placeholder: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'agent',
      text: '',
      pending: true,
    };
    setMessages((m) => [...m, userMsg, placeholder]);
    setPending(true);

    try {
      const { runId } = await postMessage(deploymentId, text);

      subscribeOff.current?.();
      subscribeOff.current = subscribeWidgetRun(runId, {
        onPaused: () => {
          setMessages((m) =>
            m.map((msg) =>
              msg.id === placeholder.id
                ? {
                    ...msg,
                    pending: false,
                    pausedForApproval: true,
                    text:
                      'Connecting you with someone — they’ll respond shortly.',
                  }
                : msg,
            ),
          );
          setPending(false);
        },
        onEnd: (data) => {
          const out = (data?.output ?? {}) as {
            text?: string;
            raw?: { text?: string };
          };
          const replyText =
            out?.text ??
            out?.raw?.text ??
            (typeof data?.output === 'string' ? data.output : 'Done.');
          setMessages((m) =>
            m.map((msg) =>
              msg.id === placeholder.id
                ? { ...msg, pending: false, text: replyText || 'Done.' }
                : msg,
            ),
          );
          setPending(false);
        },
        onError: (data) => {
          const errText =
            data?.error?.message ?? 'Something went wrong. Please try again.';
          setMessages((m) =>
            m.map((msg) =>
              msg.id === placeholder.id
                ? { ...msg, pending: false, text: errText }
                : msg,
            ),
          );
          setPending(false);
          setError(errText);
        },
      });
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ??
        (err as Error)?.message ??
        'Could not send.';
      setError(message);
      setMessages((m) => m.filter((msg) => msg.id !== placeholder.id));
      setPending(false);
    }
  };

  const primary = theme.primary ?? '#06ec9e'; // CostKatana primary
  const surface = theme.surface ?? '#ffffff';

  if (error && messages.length === 0) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center text-center p-8"
        style={{ background: surface, color: '#0f172a' }}
      >
        <div className="text-xs text-danger-600 dark:text-danger-400">{error}</div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col font-sans"
      style={{ background: surface, color: '#0f172a' }}
    >
      <header
        className="flex items-center gap-3 px-4 py-3 border-b border-secondary-200/40"
        style={{
          background: `linear-gradient(180deg, ${primary}1F, transparent)`,
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: primary, boxShadow: `0 0 6px ${primary}` }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{agentName}</div>
          <div className="text-[10px] opacity-60 truncate">{welcome}</div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-black/10 flex items-center justify-center"
            aria-label="Close"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <Bubble key={msg.id} msg={msg} primary={primary} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="border-t border-secondary-200/40 p-2 flex items-center gap-2 bg-secondary-50/60"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          disabled={pending}
          className="flex-1 bg-transparent outline-none text-sm px-2 py-1.5 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-50"
          style={{ background: primary, color: '#fff' }}
          aria-label="Send"
        >
          {pending ? (
            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <PaperAirplaneIcon className="w-3.5 h-3.5" />
          )}
        </button>
      </form>
      {error && (
        <div className="px-4 py-1 text-[10px] text-danger-600">{error}</div>
      )}
    </div>
  );
};

const Bubble: React.FC<{ msg: ChatMessage; primary: string }> = ({ msg, primary }) => {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] rounded-2xl px-3 py-2 text-sm"
          style={{ background: primary, color: '#fff' }}
        >
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm bg-secondary-100/70 text-secondary-900">
        {msg.pending ? (
          <span className="inline-flex items-center gap-2 opacity-70">
            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> Thinking…
          </span>
        ) : (
          <span className="whitespace-pre-wrap">{msg.text}</span>
        )}
      </div>
    </div>
  );
};

export default EmbedChat;
