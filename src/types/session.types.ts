// ─────────────────────────────────────────────────────────────────────────────
// OWNER: Team Lead  |  DO NOT EDIT without Team Lead approval
// API Contract: matches Team 2 (REST) backend schemas
// ─────────────────────────────────────────────────────────────────────────────

import type { Patient } from './patient.types';
import type { Character } from './character.types';

export type SessionStatus =
  | 'scheduled'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export type SessionGoal =
  | 'emotion-recognition'
  | 'social-skills'
  | 'anxiety-reduction'
  | 'communication'
  | 'other';

export interface Session {
  id: string;
  patientId: string;
  therapistId: string;
  characterId: string;
  status: SessionStatus;
  goal: SessionGoal;
  scheduledAt: string;         // ISO 8601 datetime
  startedAt?: string;
  endedAt?: string;
  durationMinutes?: number;
  notes?: string;
  summaryText?: string;
  patient?: Patient;
  character?: Character;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionDto {
  patientId: string;
  characterId: string;
  goal: SessionGoal;
  scheduledAt: string;
  notes?: string;
}

export interface SessionSummary {
  sessionId: string;
  emotionLog: EmotionEntry[];
  keyMoments: string[];
  therapistRemarks: string;
  overallRating: 1 | 2 | 3 | 4 | 5;
}

export interface EmotionEntry {
  timestamp: number;           // seconds from session start
  emotion: string;
  confidence: number;          // 0-1
}
