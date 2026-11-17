export interface TranscriptMessage {
  id: string;
  sender: 'CHILD' | 'CHARACTER' | 'THERAPIST_STEERING';
  text: string;
  timestamp: string;
  detectedEmotion?: string;
}

export interface SessionRecord {
  id: string;
  patientId: string;
  patientName?: string;
  characterName: string;
  date: string;
  durationMinutes: number;
  goals: string;
  aiSummary: string;
  therapistNotes: string;
  transcript: TranscriptMessage[];
}

export interface SessionHistoryPageProps {
  initialPatientId?: string;
}
