import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ensureSession,
  postMessage,
  subscribeWidgetRun,
} from '../../../services/widget.service';
import {
  ArrowPathIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ChevronDownIcon,
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

type WindowState = 'normal' | 'expanded' | 'minimized';

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
  const [windowState, setWindowState] = useState<WindowState>('normal');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const subscribeOff = useRef<(() => void) | null>(null);

  useEffect(() => {
    ensureSession(deploymentId)
      .then((session) => {
        setTheme(session.theme ?? {});
        setWelcome(session.welcomeMessage ?? 'Hi!');
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
    if (windowState !== 'minimized') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, windowState]);

  // Notify the widget-loader (parent window) so it can resize the iframe to
  // match. Loader trusts only messages tagged with our deploymentId.
  const notifyParent = (
    type: 'costkatana-widget:expand' | 'costkatana-widget:minimize' | 'costkatana-widget:restore' | 'costkatana-widget:close',
  ) => {
    if (window.parent === window) return;
    window.parent.postMessage({ type, deploymentId }, '*');
  };

  const setWindow = (next: WindowState) => {
    setWindowState(next);
    if (next === 'expanded') notifyParent('costkatana-widget:expand');
    else if (next === 'minimized') notifyParent('costkatana-widget:minimize');
    else notifyParent('costkatana-widget:restore');
  };

  const handleClose = () => {
    notifyParent('costkatana-widget:close');
    onClose?.();
  };

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

  const primary = theme.primary ?? '#06ec9e';
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

  const isMinimized = windowState === 'minimized';
  const isExpanded = windowState === 'expanded';

  return (
    <div
      className="w-full h-full flex flex-col font-sans"
      style={{ background: surface, color: '#0f172a' }}
    >
      <header
        className={`flex items-center gap-2 px-4 py-3 border-b border-secondary-200/40 ${
          isMinimized ? 'cursor-pointer hover:bg-black/[0.03]' : ''
        }`}
        style={{
          background: `linear-gradient(180deg, ${primary}1F, transparent)`,
        }}
        onClick={isMinimized ? () => setWindow('normal') : undefined}
        role={isMinimized ? 'button' : undefined}
        aria-label={isMinimized ? 'Restore chat' : undefined}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: primary, boxShadow: `0 0 6px ${primary}` }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{agentName}</div>
          <div className="text-[10px] opacity-60 truncate">
            {isMinimized ? 'Click to expand' : welcome}
          </div>
        </div>

        {!isMinimized && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setWindow('minimized');
            }}
            className="w-7 h-7 rounded hover:bg-black/10 flex items-center justify-center flex-shrink-0"
            aria-label="Minimize"
            title="Minimize"
          >
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        )}
        {!isMinimized && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setWindow(isExpanded ? 'normal' : 'expanded');
            }}
            className="w-7 h-7 rounded hover:bg-black/10 flex items-center justify-center flex-shrink-0"
            aria-label={isExpanded ? 'Restore' : 'Expand to full screen'}
            title={isExpanded ? 'Restore' : 'Expand'}
          >
            {isExpanded ? (
              <ArrowsPointingInIcon className="w-4 h-4" />
            ) : (
              <ArrowsPointingOutIcon className="w-4 h-4" />
            )}
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="w-7 h-7 rounded hover:bg-black/10 flex items-center justify-center flex-shrink-0"
          aria-label="Close"
          title="Close"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </header>

      {!isMinimized && (
        <>
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
        </>
      )}
    </div>
  );
};

// Animated 3-dot "typing" indicator. Each dot has a staggered delay so they
// pulse in sequence. Pure inline styles + a one-shot keyframe injection so it
// works regardless of the host's Tailwind config (the embed iframe inherits a
// minimal CSS surface).
const TYPING_DOT_KEYFRAME_ID = '__ck-embed-typing-dots-keyframe';
function ensureTypingKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(TYPING_DOT_KEYFRAME_ID)) return;
  const style = document.createElement('style');
  style.id = TYPING_DOT_KEYFRAME_ID;
  style.textContent = `
@keyframes ck-typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}`;
  document.head.appendChild(style);
}

const TypingDots: React.FC<{ color: string }> = ({ color }) => {
  useMemo(() => ensureTypingKeyframes(), []);
  const dotStyle = (delayMs: number): React.CSSProperties => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: color,
    display: 'inline-block',
    animation: 'ck-typing-bounce 1.2s infinite ease-in-out',
    animationDelay: `${delayMs}ms`,
  });
  return (
    <span
      className="inline-flex items-center gap-1"
      aria-label="Assistant is typing"
      role="status"
    >
      <span style={dotStyle(0)} />
      <span style={dotStyle(160)} />
      <span style={dotStyle(320)} />
    </span>
  );
};

const Bubble: React.FC<{ msg: ChatMessage; primary: string }> = ({ msg, primary }) => {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words"
          style={{ background: primary, color: '#fff' }}
        >
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm bg-secondary-100/70 text-secondary-900 break-words">
        {msg.pending ? (
          <TypingDots color={primary} />
        ) : (
          <div className="ck-md text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-2 last:mb-0 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 mb-2 last:mb-0 space-y-1">{children}</ol>
                ),
                li: ({ children }) => <li>{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => (
                  <code className="px-1 py-0.5 rounded bg-black/10 text-[12px] font-mono">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="my-2 p-2 rounded bg-black/10 text-[12px] font-mono overflow-x-auto">
                    {children}
                  </pre>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                    style={{ color: primary }}
                  >
                    {children}
                  </a>
                ),
                h1: ({ children }) => (
                  <h1 className="text-base font-semibold mt-2 mb-1 first:mt-0">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h3>
                ),
              }}
            >
              {msg.text}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmbedChat;
