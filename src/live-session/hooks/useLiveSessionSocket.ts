import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthStore } from '@/core/store/useAuthStore';
import type {
  ConnectionStatus,
  ServerMessage,
  ClientMessage,
  TranscriptUpdatePayload,
  EmotionDetectedPayload,
  CharacterStatePayload,
  SessionEndedPayload,
  WsErrorPayload,
} from '@/types/websocket.types';

// ── Types ─────────────────────────────────────────────────────────────────
export interface LiveSessionSocketOptions {
  sessionId: string;
  onTranscriptUpdate?: (payload: TranscriptUpdatePayload) => void;
  onEmotionDetected?: (payload: EmotionDetectedPayload) => void;
  onCharacterState?: (payload: CharacterStatePayload) => void;
  onSessionEnded?: (payload: SessionEndedPayload) => void;
  onError?: (payload: WsErrorPayload) => void;
}

export interface LiveSessionSocketReturn {
  status: ConnectionStatus;
  disconnect: () => void;
}

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL ?? 'ws://localhost:8001';
const RECONNECT_DELAY_MS = 3_000;
const MAX_RECONNECT_ATTEMPTS = 5;

// ── Hook ──────────────────────────────────────────────────────────────────
/**
 * Native WebSocket hook for live therapy session monitoring (Team 5 WS).
 * Owner: Yishai
 *
 * Contract 1 (LOCKED) Real-Time Hybrid Architecture:
 * - Strictly inbound listener from Team 5 (`${VITE_WS_BASE_URL}/sessions/:sessionId`).
 * - Sends ONLY the `session.join` handshake on `onopen`.
 * - Do NOT send steering instructions or session end over WebSocket;
 *   those go via Team 2 HTTP REST (`POST /sessions/:id/steering` and `/end`).
 */
export function useLiveSessionSocket({
  sessionId,
  onTranscriptUpdate,
  onEmotionDetected,
  onCharacterState,
  onSessionEnded,
  onError,
}: LiveSessionSocketOptions): LiveSessionSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  const { token, therapist } = useAuthStore.getState();

  const connect = useCallback(() => {
    if (!token || !therapist || !sessionId) return;

    setStatus(reconnectAttempts.current > 0 ? 'reconnecting' : 'connecting');
    const ws = new WebSocket(`${WS_BASE_URL}/sessions/${sessionId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMounted.current) return;
      reconnectAttempts.current = 0;
      setStatus('connected');

      // Outbound handshake ONLY: send session.join on open
      const joinMessage: ClientMessage = {
        type: 'session.join',
        sessionId,
        therapistId: therapist.id,
        token,
      };
      ws.send(JSON.stringify(joinMessage));
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      if (!isMounted.current) return;
      try {
        const msg = JSON.parse(event.data) as ServerMessage;
        switch (msg.type) {
          case 'transcript.update':
            onTranscriptUpdate?.(msg.payload);
            break;
          case 'emotion.detected':
            onEmotionDetected?.(msg.payload);
            break;
          case 'character.state':
            onCharacterState?.(msg.payload);
            break;
          case 'session.ended':
            onSessionEnded?.(msg.payload);
            break;
          case 'error':
            onError?.(msg.payload);
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

      // Auto-reconnect with exponential backoff
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        setStatus('reconnecting');
        const delay = RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts.current);
        reconnectAttempts.current++;
        reconnectTimer.current = setTimeout(connect, delay);
      } else {
        setStatus('disconnected');
      }
    };
  }, [
    sessionId,
    token,
    therapist,
    onTranscriptUpdate,
    onEmotionDetected,
    onCharacterState,
    onSessionEnded,
    onError,
  ]);

  useEffect(() => {
    isMounted.current = true;
    connect();

    return () => {
      isMounted.current = false;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    reconnectAttempts.current = MAX_RECONNECT_ATTEMPTS; // prevent auto-reconnect
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    wsRef.current?.close();
    setStatus('disconnected');
  }, []);

  return { status, disconnect };
}
