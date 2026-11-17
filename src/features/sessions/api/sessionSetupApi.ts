import { apiClient } from '@/core/api/axiosClient';
import type {
  CharacterProfile,
  CreateSessionRequest,
  CreateSessionResponse,
} from '../types/sessionSetup.types';

export const USE_MOCK = true;

const MOCK_CHARACTERS: CharacterProfile[] = [
  {
    id: 'char-bear',
    name: 'בובי הדובון',
    description:
      'דובון חם, מכיל וסבלני במיוחד בעל קול רך ומרגיע. מתאים להפחתת חרדה, יצירת מרחב בטוח וסיוע בפרידה מהורים.',
    personalityTraits: ['רגוע', 'מכיל', 'אמפתי', 'חם', 'סבלני'],
    avatarUrl: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=200&auto=format&fit=crop&q=80',
    gender: 'neutral',
    ageTarget: 'גילאי 4-9',
  },
  {
    id: 'char-fox',
    name: 'לילי השועלה',
    description:
      'שועלה סקרנית, שנונה ועליזה. מעולה למשחקי תפקידים, לעידוד פתרון בעיות יצירתי, תקשורת והתמודדות עם תסכולים במשחק.',
    personalityTraits: ['שובבה', 'חכמה', 'סקרנית', 'מעודדת', 'יצירתית'],
    avatarUrl: 'https://images.unsplash.com/photo-1516934024742-b461fba47600?w=200&auto=format&fit=crop&q=80',
    gender: 'female',
    ageTarget: 'גילאי 6-12',
  },
  {
    id: 'char-owl',
    name: 'אולי הינשוף',
    description:
      'ינשוף חכם ושקול עם משקפיים עגולים. עוזר לילדים לחקור רגשות בצורה הגיונית, לזהות מחשבות מכשילות ולפתח כלים קוגניטיביים.',
    personalityTraits: ['חכם', 'שקול', 'קשוב', 'אנליטי', 'מרגיע'],
    avatarUrl: 'https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?w=200&auto=format&fit=crop&q=80',
    gender: 'male',
    ageTarget: 'גילאי 8-14',
  },
  {
    id: 'char-rabbit',
    name: 'רומי הארנבת',
    description:
      'ארנבת עדינה ורגישה שגם היא לפעמים חווה פחדים ודפיקות לב. מייצרת הזדהות עמוקה סביב ביישנות, חרדה חברתית ודימוי עצמי.',
    personalityTraits: ['עדינה', 'רגישה', 'כנה', 'משתפת', 'מבינה'],
    avatarUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&auto=format&fit=crop&q=80',
    gender: 'female',
    ageTarget: 'גילאי 5-11',
  },
  {
    id: 'char-dragon',
    name: 'קאי הדרקון הקטן',
    description:
      'דרקון חמוד שלומד איך לא להוציא אש כשהוא כועס! מושלם לעבודה על שליטה בכעסים, ויסות רגשי ואימפולסיביות.',
    personalityTraits: ['אנרגטי', 'לומד ויסות', 'אמיץ', 'אוהב לעזור', 'מצחיק'],
    avatarUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80',
    gender: 'male',
    ageTarget: 'גילאי 5-10',
  },
];

export async function getCharacters(): Promise<CharacterProfile[]> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    return [...MOCK_CHARACTERS];
  }

  const response = await apiClient.get<CharacterProfile[]>('/characters');
  return response.data;
}

export async function createSession(
  payload: CreateSessionRequest,
): Promise<CreateSessionResponse> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const sessionId = `sess-${Date.now()}`;
    return {
      sessionId,
      status: 'scheduled',
    };
  }

  const response = await apiClient.post<CreateSessionResponse>('/sessions', payload);
  return response.data;
}

export const sessionSetupApi = {
  getCharacters,
  createSession,
};
