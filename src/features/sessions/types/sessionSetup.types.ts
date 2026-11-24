export type { Character, AnimationTrigger } from '@/types/character.types';
export type { Session, CreateSessionRequest } from '@/types/session.types';

export interface SessionSetupPageProps {
  preselectedPatientId?: string;
  onSessionCreated?: (sessionId: string) => void;
}
