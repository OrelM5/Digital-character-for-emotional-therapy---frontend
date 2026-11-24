// ─────────────────────────────────────────────────────────────────────────────
// OWNER: Team Lead  |  DO NOT EDIT without Team Lead approval
// Contract 1 (LOCKED): Team 5 Real-Time Orchestrator WebSocket Schema
// Outbound WS is strictly handshake (`session.join`); steering & session end
// are sent via Team 2 HTTP REST (`POST /sessions/:id/steering` & `/end`).
// ─────────────────────────────────────────────────────────────────────────────

import type { TranscriptSpeaker } from './session.types';

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

// ── Outbound WebSocket handshake (Client → Team 5 WS only) ───────────────
export type ClientMessage = {
  type: 'session.join';
  sessionId: string;
  therapistId: string;
  token: string;
};

// ── Inbound WebSocket stream (Team 5 WS → Client) ────────────────────────
export interface TranscriptUpdatePayload {
  sequenceNumber?: number;
  speaker: TranscriptSpeaker;
  content: string;
  timestamp: string;
  isFinal: boolean;
  ttsDirectives?: string | null;
  animationTriggerId?: string | null;
}

export interface EmotionDetectedPayload {
  emotion: string;
  confidence?: number;
  timestamp: string;
}

export interface CharacterStatePayload {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  animationTriggerId?: string | null;
}

export interface SessionEndedPayload {
  sessionId: string;
  endedAt: string;
}

export interface WsErrorPayload {
  code?: string;
  message: string;
}

export type ServerMessage =
  | { type: 'transcript.update'; payload: TranscriptUpdatePayload }
  | { type: 'emotion.detected'; payload: EmotionDetectedPayload }
  | { type: 'character.state'; payload: CharacterStatePayload }
  | { type: 'session.ended'; payload: SessionEndedPayload }
  | { type: 'error'; payload: WsErrorPayload };
