export interface CharacterProfile {
  id: string;
  name: string;
  description: string;
  personalityTraits: string[];
  avatarUrl: string;
  gender?: 'male' | 'female' | 'neutral';
  ageTarget?: string;
}

export interface CreateSessionRequest {
  patientId: string;
  characterId: string;
  sessionGoals: string;
  focusTopics: string[];
  sensitiveBoundaries: string;
  scheduledAt?: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  status: string;
}

export interface SessionSetupPageProps {
  preselectedPatientId?: string;
  onSessionCreated?: (sessionId: string) => void;
}
