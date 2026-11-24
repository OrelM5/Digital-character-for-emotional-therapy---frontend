export type {
  Session,
  SessionDetails,
  SessionStatus,
  TranscriptMessage,
  TranscriptSpeaker,
  UpdateSessionNotesRequest,
} from '@/types/session.types';

export interface SessionHistoryPageProps {
  initialPatientId?: string;
}
