import { apiClient } from '@/core/api/axiosClient';
import type {
  Patient,
  CreatePatientInput,
  UpdatePatientInput,
} from '../types/patient.types';

export const USE_MOCK = true;

let mockPatients: Patient[] = [
  {
    id: 'pat-1',
    firstName: 'איתמר',
    lastName: 'לוי',
    age: 8,
    emotionalBackground:
      'מתמודד עם חרדת פרידה מוגברת וקשיי הסתגלות למסגרת בית ספרית. מגיב בעוצמה רגשית גבוהה בעת מעברים ושינויים בשגרה.',
    interests: ['לגו והרכבות', 'ציור קומיקס', 'משחקי חלל', 'דינוזאורים'],
    longTermGoals:
      'חיזוק תחושת הביטחון העצמי, פיתוח אסטרטגיות הרגעה עצמית ומתן כלים לוויסות חרדה בעת פרידה מההורים.',
    ongoingNotes:
      'ניכרת פתיחות רבה מול הדמות המונפשת. שיתף ביוזמתו על פחדים בלילה ועל תחושת בדידות בהפסקות.',
    createdAt: '2026-01-15T08:30:00Z',
  },
  {
    id: 'pat-2',
    firstName: 'מאיה',
    lastName: 'כהן',
    age: 6,
    emotionalBackground:
      'קשיים בוויסות רגשי וסף תסכול נמוך. נוטה להתפרצויות זעם כאשר אינה מנצחת במשחקים או כשנתקלת במכשול מתסכל.',
    interests: ['חיות מחמד ווטרינריה', 'פלסטלינה ויצירה', 'שירי ילדים', 'ריקוד'],
    longTermGoals:
      'זיהוי תחושות גופניות מקדימות לתסכול, תרגול טכניקות עצירה ונשימה, וחיזוק יכולת ההתמדה בעת אתגר.',
    ongoingNotes:
      'מדגימה שיפור ביכולת להירגע בסיוע הדמות. הצליחה להשלים משימה מאתגרת במשחק תפקידים ללא התפרצות.',
    createdAt: '2026-02-01T10:15:00Z',
  },
  {
    id: 'pat-3',
    firstName: 'נועם',
    lastName: 'ברקוביץ׳',
    age: 10,
    emotionalBackground:
      'חרדה חברתית מובהקת, ביישנות והימנעות מוחלטת משיח מול קבוצת השווים. דימוי עצמי נמוך ותחושת חוסר שייכות.',
    interests: ['תכנות סקראץ׳', 'מיינקראפט', 'רובוטיקה', 'אורגנית'],
    longTermGoals:
      'הרחבת מעגל התקשורת החברתית, העלאת תחושת המסוגלות העצמית והפחתת דפוסי הימנעות חברתיים.',
    ongoingNotes:
      'התחבר מיד לדמות המדען הווירטואלי. החל לתרגל משפטי פנייה לחברים לכיתה בהנחיית הדמות.',
    createdAt: '2026-02-18T14:00:00Z',
  },
  {
    id: 'pat-4',
    firstName: 'שירה',
    lastName: 'אזולאי',
    age: 7,
    emotionalBackground:
      'התמודדות עם משבר גירושין במשפחה. קושי בביטוי רגשות מורכבים כמו כעס ואשמה, ונטייה בולטת לריצוי הסביבה.',
    interests: ['תיאטרון בובות', 'אגדות וספרי הרפתקאות', 'אפייה', 'ציור בצבעי מים'],
    longTermGoals:
      'עיבוד תהליך הפרידה של ההורים, מתן לגיטימציה לביטוי רגשות מודחקים וחיזוק החוסן הנפשי האישי.',
    ongoingNotes:
      'הביעה לראשונה כעס דרך סיפור שהמחיזה יחד עם הדמות. צעד משמעותי בהסרת מנגנוני הריצוי.',
    createdAt: '2026-03-02T11:20:00Z',
  },
  {
    id: 'pat-5',
    firstName: 'יונתן',
    lastName: 'שפירא',
    age: 9,
    emotionalBackground:
      'קשיי קשב ופעלתנות יתר (ADHD) המלווים באימפולסיביות ותסכול לימודי מתמשך. פגיעה בערך העצמי עקב ביקורת חוזרת.',
    interests: ['כדורגל', 'רכיבה על אופניים', 'לגו טכני', 'חידות היגיון'],
    longTermGoals:
      'פיתוח מנגנוני ניטור ובקרה עצמית, העלאת הביטחון העצמי ביכולות הלימודיות, ותרגול דחיית סיפוקים.',
    ongoingNotes:
      'הגיב בחיוב לפעילות מובנית וקצרה עם הדמות. נהנה ממשוב חיובי ומיידי שחיזק את תחושת המסוגלות.',
    createdAt: '2026-03-10T16:00:00Z',
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
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const inName = fullName.includes(term);
      const inBackground = patient.emotionalBackground.toLowerCase().includes(term);
      const inInterests = patient.interests.some((interest) =>
        interest.toLowerCase().includes(term),
      );
      return inName || inBackground || inInterests;
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

export async function createPatient(data: CreatePatientInput): Promise<Patient> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const newPatient: Patient = {
      ...data,
      id: `pat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mockPatients = [newPatient, ...mockPatients];
    return { ...newPatient };
  }

  const response = await apiClient.post<Patient>('/patients', data);
  return response.data;
}

export async function updatePatient(
  id: string,
  data: UpdatePatientInput,
): Promise<Patient> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = mockPatients.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`מטופל עם מזהה ${id} לא נמצא`);
    }
    const updated: Patient = {
      ...mockPatients[index],
      ...data,
    };
    mockPatients[index] = updated;
    return { ...updated };
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
