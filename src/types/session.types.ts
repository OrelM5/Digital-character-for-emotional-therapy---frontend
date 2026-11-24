// ─────────────────────────────────────────────────────────────────────────────
// OWNER: Team Lead  |  DO NOT EDIT without Team Lead approval
// Contract 1 (LOCKED): Team 2 REST API — Sessions, Transcripts & Live Steering
// ─────────────────────────────────────────────────────────────────────────────

export type SessionStatus = 'CREATED' | 'ACTIVE' | 'COMPLETED';

export type TranscriptSpeaker = 'CHILD' | 'CHARACTER' | 'THERAPIST_STEERING';

export interface TranscriptMessage {
  sequenceNumber: number;
  timestamp: string;
  speaker: TranscriptSpeaker;
  content: string;
  ttsDirectives: string | null;
  animationTriggerId: string | null;
}

export interface Session {
  id: string;
  patientId: string;
  therapistId?: string;
  characterId: string;
  status: SessionStatus;
  sessionGoals: string;
  focusTopics: string;
  sensitiveBoundaries: string;
  startedAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number | null;
  therapistSessionNotes?: string | null;
  aiSummary?: string | null;
}

export interface SessionDetails extends Session {
  transcript: TranscriptMessage[];
}

export interface CreateSessionRequest {
  patientId: string;
  characterId: string;
  sessionGoals: string;
  focusTopics: string;
  sensitiveBoundaries: string;
}

export interface UpdateSessionNotesRequest {
  therapistSessionNotes: string;
}

export interface LiveSteeringRequest {
  instruction: string;
  desiredTone?: string;
  suggestedAnimationTriggerId?: string;
}

export interface LiveSteeringResponse {
  sessionId: string;
  status: 'FORWARDED';
  forwardedAt: string;
}
