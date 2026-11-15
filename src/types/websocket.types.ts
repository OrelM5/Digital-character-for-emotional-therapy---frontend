// ─────────────────────────────────────────────────────────────────────────────
// OWNER: Team Lead  |  DO NOT EDIT without Team Lead approval
// WebSocket Contract: matches Team 5 (Live Session WS server) message schema
// ─────────────────────────────────────────────────────────────────────────────

// ── Inbound messages (Server → Client) ───────────────────────────────────
export type ServerMessageType =
  | 'session.started'
  | 'session.ended'
  | 'transcript.update'
  | 'emotion.detected'
  | 'character.state'
  | 'error';

export interface BaseServerMessage {
  type: ServerMessageType;
  sessionId: string;
  timestamp: number;           // Unix ms
}

export interface TranscriptUpdateMessage extends BaseServerMessage {
  type: 'transcript.update';
  speaker: 'child' | 'character';
  text: string;
  isFinal: boolean;
}

export interface EmotionDetectedMessage extends BaseServerMessage {
  type: 'emotion.detected';
  emotion: string;
  confidence: number;
  faceData?: Record<string, number>;
}

export interface CharacterStateMessage extends BaseServerMessage {
  type: 'character.state';
  currentEmotion: string;
  isAnimating: boolean;
}

export interface SessionEndedMessage extends BaseServerMessage {
  type: 'session.ended';
  reason: 'natural' | 'therapist-ended' | 'error';
}

export interface WsErrorMessage extends BaseServerMessage {
  type: 'error';
  code: string;
  message: string;
}

export type ServerMessage =
  | TranscriptUpdateMessage
  | EmotionDetectedMessage
  | CharacterStateMessage
  | SessionEndedMessage
  | WsErrorMessage;

// ── Outbound messages (Client → Server) ──────────────────────────────────
export type ClientMessageType =
  | 'session.join'
  | 'session.end'
  | 'steering.text'
  | 'steering.emotion'
  | 'character.command';

export interface BaseClientMessage {
  type: ClientMessageType;
  sessionId: string;
}

export interface JoinSessionMessage extends BaseClientMessage {
  type: 'session.join';
  therapistId: string;
  token: string;
}

export interface SteeringTextMessage extends BaseClientMessage {
  type: 'steering.text';
  text: string;                // Therapist's text injection for the character
}

export interface SteeringEmotionMessage extends BaseClientMessage {
  type: 'steering.emotion';
  emotion: string;
  intensity: number;
}

export interface EndSessionMessage extends BaseClientMessage {
  type: 'session.end';
  therapistRemarks?: string;
}

export type ClientMessage =
  | JoinSessionMessage
  | SteeringTextMessage
  | SteeringEmotionMessage
  | EndSessionMessage;
