import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const SESSION_KEY = 'axon-widget-session';

const widgetApi = axios.create({
  baseURL: `${API_BASE_URL}/api/public/widget`,
  withCredentials: false, // public widget — no cookies
  timeout: 60000,
});

interface SessionPayload {
  sessionId: string;
  sessionToken: string;
  theme: { primary?: string; surface?: string; position?: string };
  welcomeMessage: string;
}

interface MessageResult {
  runId: string;
  streamUrl: string;
}

function readStoredSession(deploymentId: string): SessionPayload | null {
  try {
    const raw = sessionStorage.getItem(`${SESSION_KEY}:${deploymentId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStoredSession(deploymentId: string, payload: SessionPayload) {
  try {
    sessionStorage.setItem(
      `${SESSION_KEY}:${deploymentId}`,
      JSON.stringify(payload),
    );
  } catch {
    /* ignore quota errors */
  }
}

export async function ensureSession(
  deploymentId: string,
): Promise<SessionPayload> {
  const cached = readStoredSession(deploymentId);
  if (cached) return cached;
  const { data } = await widgetApi.post<SessionPayload>(
    `/${deploymentId}/session`,
    { origin: window.location.origin },
    { headers: { Origin: window.location.origin } },
  );
  writeStoredSession(deploymentId, data);
  return data;
}

export async function postMessage(
  deploymentId: string,
  message: string,
): Promise<MessageResult> {
  const session = await ensureSession(deploymentId);
  const { data } = await widgetApi.post<MessageResult>(
    `/message`,
    { message },
    {
      headers: {
        Authorization: `Bearer ${session.sessionToken}`,
        Origin: window.location.origin,
      },
    },
  );
  return data;
}

export function subscribeWidgetRun(
  runId: string,
  handlers: {
    onStepStart?: (data: any) => void;
    onStepEnd?: (data: any) => void;
    onPaused?: (data: any) => void;
    onEnd?: (data: any) => void;
    onError?: (data: any) => void;
  },
): () => void {
  const url = `${API_BASE_URL}/api/public/widget/runs/${runId}/stream`;
  const source = new EventSource(url);
  const wire = (event: string, fn?: (d: any) => void) => {
    if (!fn) return;
    source.addEventListener(event, (e: MessageEvent) => {
      try {
        fn(JSON.parse(e.data));
      } catch {
        /* ignore malformed frames */
      }
    });
  };
  wire('step.start', handlers.onStepStart);
  wire('step.end', handlers.onStepEnd);
  wire('paused', handlers.onPaused);
  wire('run.end', handlers.onEnd);
  wire('run.error', handlers.onError);
  return () => source.close();
}
