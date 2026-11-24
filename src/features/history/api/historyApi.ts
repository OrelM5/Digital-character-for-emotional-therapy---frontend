import { apiClient } from '@/core/api/axiosClient';
import type {
  Session,
  SessionDetails,
  UpdateSessionNotesRequest,
} from '@/types/session.types';

export const USE_MOCK = true;

let mockSessionDetails: SessionDetails[] = [
  {
    id: 'sess-rec-01',
    patientId: 'pat-1',
    therapistId: 'therapist-mock-001',
    characterId: 'char_bobi',
    status: 'COMPLETED',
    sessionGoals: 'הפחתת חרדת פרידה בבוקר ופיתוח מנגנון הרגעה עצמית לקראת כניסה לכיתה',
    focusTopics: 'הסתגלות לבית ספר, חרדת פרידה בבוקר, נשימות הרגעה',
    sensitiveBoundaries: 'לא להזכיר ציונים או השוואה לאחרים',
    startedAt: '2026-03-12T14:30:00Z',
    endedAt: '2026-03-12T15:15:00Z',
    durationSeconds: 2700,
    aiSummary:
      'המטופל הציג בתחילת המפגש שפת גוף סגורה ודיבור מהוסס. בעקבות שיחה על הרכבת חללית לגו, ניכר שיפור במדדי הרוגע. כאשר הדמות העלתה את נושא הפרידה בבוקר, איתמר זיהה בעצמו "כיווץ בבטן" ותורגלו 3 מחזורי נשימת דוב.',
    therapistSessionNotes:
      'מפגש משמעותי מאוד. איתמר שיתף לראשונה מיוזמתו על הדמעות בבוקר. להמשיך לחזק את דימוי "נשימת הדוב" במפגש הבא.',
    transcript: [
      {
        sequenceNumber: 1,
        timestamp: '2026-03-12T14:30:15Z',
        speaker: 'CHARACTER',
        content:
          'שלום איתמר! איזה כיף לראות אותך שוב במרחב שלנו. שמעתי שבנית משהו ממש מיוחד אתמול בלגו, בא לך לספר לי?',
        ttsDirectives: 'warm, inviting',
        animationTriggerId: 'WAVE_HELLO',
      },
      {
        sequenceNumber: 2,
        timestamp: '2026-03-12T14:30:40Z',
        speaker: 'CHILD',
        content:
          'היי בובי... כן, בניתי חללית חלל ענקית מלגו שיש לה שמונה מנועים ומשגר מיוחד.',
        ttsDirectives: null,
        animationTriggerId: null,
      },
      {
        sequenceNumber: 3,
        timestamp: '2026-03-12T14:31:10Z',
        speaker: 'THERAPIST_STEERING',
        content: 'הנחיה לדמות: קשר בעדינות בין האומץ של החללית לבין הכניסה לכיתה בבוקר.',
        ttsDirectives: null,
        animationTriggerId: null,
      },
      {
        sequenceNumber: 4,
        timestamp: '2026-03-12T14:31:35Z',
        speaker: 'CHARACTER',
        content:
          'וואו, שמונה מנועים! נשמע שהחללית הזו ממש אמיצה. תגיד, גם לך לפעמים יש רגע בבוקר לפני הכיתה שהבטן מרגישה קצת מתכווצת?',
        ttsDirectives: 'calm, empathetic',
        animationTriggerId: 'EMPATHIC_NOD',
      },
      {
        sequenceNumber: 5,
        timestamp: '2026-03-12T14:32:10Z',
        speaker: 'CHILD',
        content: 'כן, כשאמא הולכת בבוקר אני מרגיש כיווץ קטן בבטן.',
        ttsDirectives: null,
        animationTriggerId: null,
      },
    ],
  },
  {
    id: 'sess-rec-02',
    patientId: 'pat-2',
    therapistId: 'therapist-mock-001',
    characterId: 'char_lili',
    status: 'COMPLETED',
    sessionGoals: 'זיהוי סימני תסכול מוקדמים ותרגול עצירה לפני התפרצות במשחק',
    focusTopics: 'משחקי תפקידים, סבלנות, התמודדות עם הפסד',
    sensitiveBoundaries: 'להימנע מביקורת ישירה על התפרצויות קודמות',
    startedAt: '2026-03-10T10:00:00Z',
    endedAt: '2026-03-10T10:35:00Z',
    durationSeconds: 2100,
    aiSummary:
      'מאיה שיתפה פעולה בהתלהבות במשחק תפקידים עם לילי. תורגל סימן "רמזור אדום" לעצירה לפני כעס, ומאיה הדגימה הבנה מלאה של התחושה בגוף.',
    therapistSessionNotes:
      'שיפור משמעותי בסף התסכול. מומלץ להמשיך בתרגול משחקי תורות במפגש הבא.',
    transcript: [
      {
        sequenceNumber: 1,
        timestamp: '2026-03-10T10:01:00Z',
        speaker: 'CHARACTER',
        content: 'היי מאיה! מוכנה שנשחק היום במשחק החיות המיוחד שלנו?',
        ttsDirectives: 'playful, energetic',
        animationTriggerId: 'CLAP_HAPPY',
      },
      {
        sequenceNumber: 2,
        timestamp: '2026-03-10T10:01:25Z',
        speaker: 'CHILD',
        content: 'כן! אבל רק אם אני מתחילה ראשונה.',
        ttsDirectives: null,
        animationTriggerId: null,
      },
      {
        sequenceNumber: 3,
        timestamp: '2026-03-10T10:02:00Z',
        speaker: 'CHARACTER',
        content:
          'בטח שאת יכולה להתחיל! ואם משהו יהיה קשה במשחק, נפעיל יחד את תרגיל הנשימה שלנו.',
        ttsDirectives: 'warm, encouraging',
        animationTriggerId: 'HUG_GESTURE',
      },
    ],
  },
];

export async function getSessionsByPatient(patientId: string): Promise<SessionDetails[]> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return mockSessionDetails.filter((s) => s.patientId === patientId);
  }

  const response = await apiClient.get<Session[]>(`/patients/${patientId}/sessions`);
  return response.data.map((s) => ({ ...s, transcript: [] }));
}

export async function getAllSessions(): Promise<SessionDetails[]> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...mockSessionDetails];
  }

  const response = await apiClient.get<Session[]>('/sessions?status=COMPLETED');
  return response.data.map((s) => ({ ...s, transcript: [] }));
}

export async function getSessionDetails(sessionId: string): Promise<SessionDetails> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const found = mockSessionDetails.find((s) => s.id === sessionId);
    if (!found) {
      throw new Error(`מפגש עם מזהה ${sessionId} לא נמצא`);
    }
    return { ...found };
  }

  const response = await apiClient.get<SessionDetails>(`/sessions/${sessionId}`);
  return response.data;
}

export async function updateTherapistNotes(
  sessionId: string,
  therapistSessionNotes: string,
): Promise<SessionDetails> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = mockSessionDetails.findIndex((s) => s.id === sessionId);
    if (index === -1) {
      throw new Error(`מפגש עם מזהה ${sessionId} לא נמצא`);
    }
    mockSessionDetails[index] = {
      ...mockSessionDetails[index],
      therapistSessionNotes,
    };
    return { ...mockSessionDetails[index] };
  }

  const payload: UpdateSessionNotesRequest = { therapistSessionNotes };
  const response = await apiClient.patch<SessionDetails>(
    `/sessions/${sessionId}/notes`,
    payload,
  );
  return response.data;
}

export const historyApi = {
  getSessionsByPatient,
  getAllSessions,
  getSessionDetails,
  updateTherapistNotes,
};
