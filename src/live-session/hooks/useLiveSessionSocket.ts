import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthStore } from '@/core/store/useAuthStore';
import type {
  ServerMessage,
  ClientMessage,
  TranscriptUpdateMessage,
  EmotionDetectedMessage,
  CharacterStateMessage,
} from '@/types/websocket.types';

// ── Types ─────────────────────────────────────────────────────────────────
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export interface LiveSessionSocketOptions {
  sessionId: string;
  onTranscriptUpdate?: (msg: TranscriptUpdateMessage) => void;
  onEmotionDetected?: (msg: EmotionDetectedMessage) => void;
  onCharacterState?: (msg: CharacterStateMessage) => void;
  onSessionEnded?: () => void;
  onError?: (code: string, message: string) => void;
}

export interface LiveSessionSocketReturn {
  status: ConnectionStatus;
  send: (message: ClientMessage) => void;
  disconnect: () => void;
}

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL ?? 'ws://localhost:8001';
const RECONNECT_DELAY_MS = 3_000;
const MAX_RECONNECT_ATTEMPTS = 5;

// ── Hook ──────────────────────────────────────────────────────────────────
/**
 * Native WebSocket hook for live therapy session control.
 * Owner: Yishai (Team 3)
 * WS Server: Team 5
 *
 * Features:
 * - Auto-reconnect with exponential backoff (up to MAX_RECONNECT_ATTEMPTS)
 * - JWT auth handshake on connect
 * - Typed message dispatching via callback options
 * - Clean teardown on unmount
 */
export function useLiveSessionSocket({
  sessionId,
  onTranscriptUpdate,
  onEmotionDetected,
  onCharacterState,
  onSessionEnded,
  onError,
}: LiveSessionSocketOptions): LiveSessionSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const isMounted = useRef(true);

  const { token, therapist } = useAuthStore.getState();

  const connect = useCallback(() => {
    if (!token || !therapist) return;

    setStatus('connecting');
    const ws = new WebSocket(`${WS_BASE_URL}/sessions/${sessionId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMounted.current) return;
      reconnectAttempts.current = 0;
      setStatus('connected');

      // Auth handshake: send join message immediately on connect
      ws.send(
        JSON.stringify({
          type: 'session.join',
          sessionId,
          therapistId: therapist.id,
          token,
        } satisfies ClientMessage),
      );
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      if (!isMounted.current) return;
      try {
        const msg = JSON.parse(event.data) as ServerMessage;
        switch (msg.type) {
          case 'transcript.update':
            onTranscriptUpdate?.(msg);
            break;
          case 'emotion.detected':
            onEmotionDetected?.(msg);
            break;
          case 'character.state':
            onCharacterState?.(msg);
            break;
          case 'session.ended':
            onSessionEnded?.();
            break;
          case 'error':
            onError?.(msg.code, msg.message);
            break;
        }
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
      }
    };

    ws.onerror = () => {
      if (!isMounted.current) return;
      setStatus('error');
    };

    ws.onclose = () => {
      if (!isMounted.current) return;
      setStatus('disconnected');

      // Auto-reconnect
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts.current);
        reconnectAttempts.current++;
        setTimeout(connect, delay);
      }
    };
  }, [sessionId, token, therapist, onTranscriptUpdate, onEmotionDetected, onCharacterState, onSessionEnded, onError]);

  useEffect(() => {
    isMounted.current = true;
    connect();

    return () => {
      isMounted.current = false;
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WS] Cannot send – socket not open. Status:', wsRef.current?.readyState);
    }
  }, []);

  const disconnect = useCallback(() => {
    reconnectAttempts.current = MAX_RECONNECT_ATTEMPTS; // prevent auto-reconnect
    wsRef.current?.close();
  }, []);

  return { status, send, disconnect };
}
