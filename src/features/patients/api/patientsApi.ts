import { apiClient } from '@/core/api/axiosClient';
import type {
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
} from '@/types/patient.types';

export const USE_MOCK = true;

let mockPatients: Patient[] = [
  {
    id: 'pat-1',
    therapistId: 'therapist-mock-001',
    displayAlias: 'איתמר',
    personalDetails: 'איתמר לוי, תלמיד כיתה ב׳, בן בכור במשפחה של 2 ילדים',
    age: 8,
    emotionalBackground:
      'מתמודד עם חרדת פרידה מוגברת וקשיי הסתגלות למסגרת בית ספרית. מגיב בעוצמה רגשית גבוהה בעת מעברים ושינויים בשגרה.',
    interestsAndSafeTopics: 'לגו והרכבות, ציור קומיקס, משחקי חלל, דינוזאורים',
    longTermGoals:
      'חיזוק תחושת הביטחון העצמי, פיתוח אסטרטגיות הרגעה עצמית ומתן כלים לוויסות חרדה בעת פרידה מההורים.',
    therapistNotes:
      'ניכרת פתיחות רבה מול הדמות המונפשת. שיתף ביוזמתו על פחדים בלילה ועל תחושת בדידות בהפסקות.',
    preferredCharacterIds: ['char_bobi', 'char_leo'],
    createdAt: '2026-01-15T08:30:00Z',
    updatedAt: '2026-03-12T15:00:00Z',
  },
  {
    id: 'pat-2',
    therapistId: 'therapist-mock-001',
    displayAlias: 'מאיה',
    personalDetails: 'מאיה כהן, גן חובה, מתגוררת עם שני הוריה ואחות גדולה',
    age: 6,
    emotionalBackground:
      'קשיים בוויסות רגשי וסף תסכול נמוך. נוטה להתפרצויות זעם כאשר אינה מנצחת במשחקים או כשנתקלת במכשול מתסכל.',
    interestsAndSafeTopics: 'חיות מחמד ווטרינריה, פלסטלינה ויצירה, שירי ילדים, ריקוד',
    longTermGoals:
      'זיהוי תחושות גופניות מקדימות לתסכול, תרגול טכניקות עצירה ונשימה, וחיזוק יכולת ההתמדה בעת אתגר.',
    therapistNotes:
      'מדגימה שיפור ביכולת להירגע בסיוע הדמות. הצליחה להשלים משימה מאתגרת במשחק תפקידים ללא התפרצות.',
    preferredCharacterIds: ['char_lili', 'char_kai'],
    createdAt: '2026-02-01T10:15:00Z',
    updatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'pat-3',
    therapistId: 'therapist-mock-001',
    displayAlias: 'דניאל',
    personalDetails: 'דניאל מזרחי, כיתה ה׳, לומד בבית ספר יסודי מקומי',
    age: 11,
    emotionalBackground:
      'ביישנות חברתית וחשש מביקורת. מתקשה ליזום שיחה עם בני גילו ונמנע מהשתתפות בשיעורים.',
    interestsAndSafeTopics: 'כדורגל, מיינקראפט, קומיקס גיבורי על, אסטרונומיה',
    longTermGoals:
      'בניית ביטחון במצבים חברתיים, תרגול פתיחת שיחה והתמודדות עם מחשבות שליליות אוטומטיות.',
    therapistNotes:
      'מתחבר במיוחד לשיחות בגובה העיניים והומור עדין. מגיב טוב לעידוד לא מוגזם.',
    preferredCharacterIds: ['char_oli', 'char_leo'],
    createdAt: '2026-02-20T11:00:00Z',
    updatedAt: '2026-03-08T16:30:00Z',
  },
];

export async function getPatients(search?: string): Promise<Patient[]> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const term = (search || '').trim().toLowerCase();
    if (!term) {
      return [...mockPatients];
    }
    return mockPatients.filter((patient) => {
      const inAlias = patient.displayAlias.toLowerCase().includes(term);
      const inPersonal = patient.personalDetails.toLowerCase().includes(term);
      const inBackground = patient.emotionalBackground.toLowerCase().includes(term);
      const inInterests = patient.interestsAndSafeTopics.toLowerCase().includes(term);
      return inAlias || inPersonal || inBackground || inInterests;
    });
  }

  const response = await apiClient.get<Patient[]>('/patients', {
    params: search ? { search } : undefined,
  });
  return response.data;
}

export async function getPatientById(id: string): Promise<Patient> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const found = mockPatients.find((p) => p.id === id);
    if (!found) {
      throw new Error(`מטופל עם מזהה ${id} לא נמצא`);
    }
    return { ...found };
  }

  const response = await apiClient.get<Patient>(`/patients/${id}`);
  return response.data;
}

export async function createPatient(data: CreatePatientRequest): Promise<Patient> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const now = new Date().toISOString();
    const newPatient: Patient = {
      ...data,
      id: `pat-${Date.now()}`,
      therapistId: 'therapist-mock-001',
      createdAt: now,
      updatedAt: now,
    };
    mockPatients = [newPatient, ...mockPatients];
    return { ...newPatient };
  }

  const response = await apiClient.post<Patient>('/patients', data);
  return response.data;
}

export async function updatePatient(
  id: string,
  data: UpdatePatientRequest,
): Promise<Patient> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const idx = mockPatients.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error(`מטופל עם מזהה ${id} לא נמצא`);
    }
    mockPatients[idx] = {
      ...mockPatients[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return { ...mockPatients[idx] };
  }

  const response = await apiClient.put<Patient>(`/patients/${id}`, data);
  return response.data;
}

export const patientsApi = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
};
