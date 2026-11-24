import { apiClient } from '@/core/api/axiosClient';
import type { Character } from '@/types/character.types';
import type { Session, CreateSessionRequest } from '@/types/session.types';

export const USE_MOCK = true;

const COMMON_ANIMATIONS = [
  { animationTriggerId: 'IDLE_LISTEN', displayName: 'הקשבה רגועה' },
  { animationTriggerId: 'WAVE_HELLO', displayName: 'נפנוף לשלום' },
  { animationTriggerId: 'THINKING', displayName: 'חשיבה וסקרנות' },
  { animationTriggerId: 'CLAP_HAPPY', displayName: 'מחיאות כפיים ושמחה' },
  { animationTriggerId: 'EMPATHIC_NOD', displayName: 'הנהון אמפתי' },
  { animationTriggerId: 'HUG_GESTURE', displayName: 'תנועת חיבוק' },
];

const MOCK_CHARACTERS: Character[] = [
  {
    id: 'char_bobi',
    name: 'בובי הדובון',
    description:
      'דובון חם, מכיל וסבלני במיוחד בעל קול רך ומרגיע. מתאים להפחתת חרדה, יצירת מרחב בטוח וסיוע בפרידה מהורים.',
    unityModelAssetId: 'unity_bear_bobi_v1',
    avatarUrl:
      'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=200&auto=format&fit=crop&q=80',
    availableAnimations: COMMON_ANIMATIONS,
  },
  {
    id: 'char_lili',
    name: 'לילי השועלה',
    description:
      'שועלה סקרנית, שנונה ועליזה. מעולה למשחקי תפקידים, לעידוד פתרון בעיות יצירתי, תקשורת והתמודדות עם תסכולים במשחק.',
    unityModelAssetId: 'unity_fox_lili_v1',
    avatarUrl:
      'https://images.unsplash.com/photo-1516934024742-b461fba47600?w=200&auto=format&fit=crop&q=80',
    availableAnimations: COMMON_ANIMATIONS,
  },
  {
    id: 'char_oli',
    name: 'אולי הינשוף',
    description:
      'ינשוף חכם ושקול עם משקפיים עגולים. עוזר לילדים לחקור רגשות בצורה הגיונית, לזהות מחשבות מכשילות ולפתח כלים קוגניטיביים.',
    unityModelAssetId: 'unity_owl_oli_v1',
    avatarUrl:
      'https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?w=200&auto=format&fit=crop&q=80',
    availableAnimations: COMMON_ANIMATIONS,
  },
  {
    id: 'char_leo',
    name: 'ליאו האריה',
    description:
      'אריה אמיץ אך רגיש שגם הוא לפעמים מרגיש פרפרים בבטן. מייצר הזדהות עמוקה סביב אומץ, ביישנות וחרדה חברתית.',
    unityModelAssetId: 'unity_lion_leo_v1',
    avatarUrl:
      'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&auto=format&fit=crop&q=80',
    availableAnimations: COMMON_ANIMATIONS,
  },
  {
    id: 'char_kai',
    name: 'קאי הדרקון הקטן',
    description:
      'דרקון חמוד שלומד איך לא להוציא אש כשהוא כועס! מושלם לעבודה על שליטה בכעסים, ויסות רגשי ואימפולסיביות.',
    unityModelAssetId: 'unity_dragon_kai_v1',
    avatarUrl:
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80',
    availableAnimations: COMMON_ANIMATIONS,
  },
];

export async function getCharacters(): Promise<Character[]> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    return [...MOCK_CHARACTERS];
  }

  const response = await apiClient.get<Character[]>('/characters');
  return response.data;
}

export async function createSession(
  payload: CreateSessionRequest,
): Promise<Session> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const now = new Date().toISOString();
    return {
      id: `sess-${Date.now()}`,
      patientId: payload.patientId,
      therapistId: 'therapist-mock-001',
      characterId: payload.characterId,
      status: 'CREATED',
      sessionGoals: payload.sessionGoals,
      focusTopics: payload.focusTopics,
      sensitiveBoundaries: payload.sensitiveBoundaries,
      startedAt: now,
      endedAt: null,
      durationSeconds: null,
      therapistSessionNotes: null,
      aiSummary: null,
    };
  }

  const response = await apiClient.post<Session>('/sessions', payload);
  return response.data;
}

export const sessionSetupApi = {
  getCharacters,
  createSession,
};
