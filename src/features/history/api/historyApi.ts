import { apiClient } from '@/core/api/axiosClient';
import type { SessionRecord } from '../types/history.types';

export const USE_MOCK = true;

let mockSessionRecords: SessionRecord[] = [
  {
    id: 'sess-rec-01',
    patientId: 'pat-1',
    patientName: 'איתמר לוי',
    characterName: 'בובי הדובון',
    date: '2026-03-12T14:30:00Z',
    durationMinutes: 45,
    goals: 'הפחתת חרדת פרידה בבוקר ופיתוח מנגנון הרגעה עצמית לקראת כניסה לכיתה',
    aiSummary:
      'המטופל הציג בתחילת המפגש שפת גוף סגורה ודיבור מהוסס. בעקבות שיחה על הרכבת חללית לגו, ניכר שיפור במדדי הרוגע (עלייה של 40% בטון דיבור יציב). כאשר הדמות העלתה את נושא הפרידה מאמו בבוקר, איתמר זיהה בעצמו "כיווץ בבטן". בסיוע הדמות והנחיית המטפל תורגלו 3 מחזורי נשימת דוב, ואיתמר הביע נכונות לנסות את הטכניקה מחר בבוקר בכניסה לבית הספר.',
    therapistNotes:
      'מפגש משמעותי מאוד. איתמר שיתף לראשונה מיוזמתו על הדמעות בבוקר ועל תחושת הבושה מול החברים. להמשיך לחזק את דימוי "נשימת הדוב" במפגש הבא ולבדוק עם האם כיצד עבר הבוקר.',
    transcript: [
      {
        id: 'msg-01',
        sender: 'CHARACTER',
        text: 'שלום איתמר! איזה כיף לראות אותך שוב במרחב שלנו. שמעתי שבנית משהו ממש מיוחד אתמול בלגו, בא לך לספר לי?',
        timestamp: '14:30:15',
      },
      {
        id: 'msg-02',
        sender: 'CHILD',
        text: 'היי בובי... כן, בניתי חללית חלל ענקית מלגו שיש לה שמונה מנועים ומשגר מיוחד.',
        timestamp: '14:30:40',
        detectedEmotion: 'התרגשות מתונה',
      },
      {
        id: 'msg-03',
        sender: 'CHARACTER',
        text: 'וואו, שמונה מנועים! נשמע שהחללית הזו יכולה להגיע לכל מקום בגלקסיה. תגיד, יש לה גם מגן מיוחד כשהיא נתקלת במשהו שמפחיד אותה בחלל החשוך?',
        timestamp: '14:31:10',
      },
      {
        id: 'msg-04',
        sender: 'CHILD',
        text: 'בטח, יש לה מגן אנרגיה סודי שאף אסטרואיד לא יכול לשבור, הוא שומר על כל מי שבפנים.',
        timestamp: '14:31:35',
        detectedEmotion: 'ביטחון וגאווה',
      },
      {
        id: 'msg-05',
        sender: 'THERAPIST_STEERING',
        text: 'הנחיה לדמות: קשרי את מגן האנרגיה לתחושת הביטחון של איתמר בבוקר כשהוא נפרד מאמא בכניסה לבית הספר.',
        timestamp: '14:32:00',
      },
      {
        id: 'msg-06',
        sender: 'CHARACTER',
        text: 'מגן סודי זה גאוני! לפעמים כשאני בעצמי צריך לצאת למקום חדש ואני קצת חושש, הייתי רוצה מגן כזה בדיוק בלב שלי. קורה לך לפעמים שאתה מרגיש שהיית רוצה מגן כזה?',
        timestamp: '14:32:20',
      },
      {
        id: 'msg-07',
        sender: 'CHILD',
        text: 'כן... כל יום בבוקר כשאמא מורידה אותי בבית ספר. הבטן שלי נהיית קשה כמו אבן ואני מפחד שהיא תלך ולא תחזור.',
        timestamp: '14:33:05',
        detectedEmotion: 'חרדה ופחד',
      },
      {
        id: 'msg-08',
        sender: 'THERAPIST_STEERING',
        text: 'הנחיה לדמות: הכלה מלאה בלי שיפוטיות. הציעי את תרגיל נשימות הדובון להרגעת תחושת האבן בבטן.',
        timestamp: '14:33:30',
      },
      {
        id: 'msg-09',
        sender: 'CHARACTER',
        text: 'אני כל כך מבין אותך, איתמר. גם לי קורה שהבטן מתכווצת וזה ממש לא נעים. רוצה שננסה ביחד את "נשימת הדוב החזק"? שואפים עמוק עד שהבטן מתנפחת כמו בלון, ונושפים לאט לאט...',
        timestamp: '14:33:55',
      },
      {
        id: 'msg-10',
        sender: 'CHILD',
        text: '(לוקח נשימה עמוקה) פפפפפ... עשיתי שלוש פעמים. זה באמת עושה קצת פחות כבד בבטן.',
        timestamp: '14:34:40',
        detectedEmotion: 'הקלה ורוגע',
      },
      {
        id: 'msg-11',
        sender: 'CHARACTER',
        text: 'מדהים! אתה רואה? עכשיו יש לך מגן אנרגיה סודי משלך שאתה יכול לקחת איתך בכיס לכל מקום.',
        timestamp: '14:35:10',
      },
    ],
  },
  {
    id: 'sess-rec-02',
    patientId: 'pat-2',
    patientName: 'מאיה כהן',
    characterName: 'לילי השועלה',
    date: '2026-03-08T11:00:00Z',
    durationMinutes: 40,
    goals: 'התמודדות עם הפסד במשחק תפקידים וויסות התפרצויות תסכול',
    aiSummary:
      'במהלך משחק חידות תחרותי מול הדמות, מאיה חוותה תסכול ניכר לאחר שטענה בתשובה (מדד כעס עלה ל-85%). התערבות הדמות בהכרה ברגש וחיזוק עצמי אפשרה למאיה להימנע מנטישת המפגש. לקראת סיום נרשמה רגיעה מלאה ויכולת לפרגן לדמות על הניצחון.',
    therapistNotes:
      'התקדמות מרשימה: בעבר מאיה הייתה משליכה חפצים בעת הפסד. הפעם הצליחה לומר בקול "אני כועסת אבל אני רוצה לנסות שוב" ולחזור למשחק לאחר דקה.',
    transcript: [
      {
        id: 'msg-21',
        sender: 'CHARACTER',
        text: 'מאיה! מוכנה לסיבוב השני בחידון החיות הסודיות שלנו?',
        timestamp: '11:05:00',
      },
      {
        id: 'msg-22',
        sender: 'CHILD',
        text: 'בטח, אני הולכת לנצח אותך הפעם!',
        timestamp: '11:05:20',
        detectedEmotion: 'נחישות ואנרגיה',
      },
      {
        id: 'msg-23',
        sender: 'CHARACTER',
        text: 'חידה מספר שתיים: מי ישנה בחורף, אוהבת דבש ומטפסת על עצים?',
        timestamp: '11:05:45',
      },
      {
        id: 'msg-24',
        sender: 'CHILD',
        text: 'נמלה! לא רגע... דובה!',
        timestamp: '11:06:05',
        detectedEmotion: 'בלבול קל',
      },
      {
        id: 'msg-25',
        sender: 'CHARACTER',
        text: 'התשובה הראשונה קובעת, נקודה ללילי השועלה! הידד!',
        timestamp: '11:06:20',
      },
      {
        id: 'msg-26',
        sender: 'CHILD',
        text: 'זה לא הוגן! את מרמה! אני לא משחקת יותר, זה משחק גרוע!',
        timestamp: '11:06:40',
        detectedEmotion: 'כעס ותסכול עז',
      },
      {
        id: 'msg-27',
        sender: 'THERAPIST_STEERING',
        text: 'הנחיה לדמות: שקפי את התסכול של מאיה באמפתיה, תני לה תוקף שהפסד הוא מאכזב, והציעי לה הפסקה קצרה.',
        timestamp: '11:07:00',
      },
      {
        id: 'msg-28',
        sender: 'CHARACTER',
        text: 'מאיה, את לגמרי צודקת שזה מעצבן להפסיד נקודה כשידעת את התשובה. גם אני כשאני מפספסת נקודה בא לי לצעוק. רוצה שנעצור רגע ונשתה שלוק מים לפני שממשיכים?',
        timestamp: '11:07:25',
      },
      {
        id: 'msg-29',
        sender: 'CHILD',
        text: 'כן... אני שותה מים. הייתי ממש קרובה, נכון?',
        timestamp: '11:08:10',
        detectedEmotion: 'רגיעה הדרגתית',
      },
      {
        id: 'msg-30',
        sender: 'CHARACTER',
        text: 'היית הכי קרובה שיש! בואי נמשיך, יש עוד המון חידות וכל הכיף זה לנסות.',
        timestamp: '11:08:30',
      },
    ],
  },
  {
    id: 'sess-rec-03',
    patientId: 'pat-3',
    patientName: 'נועם ברקוביץ׳',
    characterName: 'אולי הינשוף',
    date: '2026-03-04T16:00:00Z',
    durationMinutes: 50,
    goals: 'תרגול פנייה יזומה לחברים לכיתה והפחתת חרדה משיפוטיות',
    aiSummary:
      'סימולציית שיחה על משחק מחשב משותף. נועם התנסה בניסוח שלוש שאלות פתיחה שונות לדמות. רמת הביטחון הקולי והפתיחות עלתה מ-30% ל-75% במהלך התרגול.',
    therapistNotes:
      'נועם שיתף פעולה יפה. נתתי לו "משימת אומץ" קטנה לומר מחר שלום ליוסי בהסעה בבוקר. לבדוק מעקב במפגש הבא.',
    transcript: [
      {
        id: 'msg-41',
        sender: 'CHARACTER',
        text: 'שלום נועם. היום התכנסנו במעבדת החשיבה שלנו. על מה תרצה לעבוד?',
        timestamp: '16:02:00',
      },
      {
        id: 'msg-42',
        sender: 'CHILD',
        text: 'אני רוצה לדעת איך מדברים עם ילדים בכיתה בלי להרגיש מוזר...',
        timestamp: '16:02:30',
        detectedEmotion: 'ביישנות וחשש',
      },
      {
        id: 'msg-43',
        sender: 'THERAPIST_STEERING',
        text: 'הנחיה לדמות: תרגל איתו משחק תפקידים שבו אתה תלמיד חדש שמשחק מיינקראפט בהפסקה.',
        timestamp: '16:03:00',
      },
      {
        id: 'msg-44',
        sender: 'CHARACTER',
        text: 'רעיון מעולה. בוא נעשה ניסוי: אני אהיה ילד בכיתה שיושב עם טאבלט ובונה עולם במיינקראפט. נסה לגשת אליי ולשאול שאלה אחת.',
        timestamp: '16:03:25',
      },
      {
        id: 'msg-45',
        sender: 'CHILD',
        text: 'היי, איזה מוד זה שאתה משחק בו? אתה בונה טירה?',
        timestamp: '16:04:10',
        detectedEmotion: 'ביטחון גובר',
      },
      {
        id: 'msg-46',
        sender: 'CHARACTER',
        text: 'וואו נועם, שאלה פשוט מושלמת! ישר פתחת נושא משותף שמעניין את שניכם.',
        timestamp: '16:04:30',
      },
    ],
  },
  {
    id: 'sess-rec-04',
    patientId: 'pat-4',
    patientName: 'שירה אזולאי',
    characterName: 'רומי הארנבת',
    date: '2026-02-26T10:15:00Z',
    durationMinutes: 40,
    goals: 'עיבוד רגשות אשמה סביב גירושי ההורים ומתן לגיטימציה לכעס',
    aiSummary:
      'דרך סיפור מטאפורי על ארנבת שעברה לגור בשתי מחילות שונות, שירה ביטאה לראשונה את התחושה ש"אולי בגללה ההורים רבים". הדמות סייעה להפריך את המחשבה הזו בצורה רגישה ומותאמת גיל.',
    therapistNotes:
      'פריצת דרך קלינית חשובה. שירה בכתה מעט והביעה הקלה עצומה כששמעה מהדמות שילדים לעולם אינם הסיבה לפרידה של מבוגרים. לתאם שיחת הדרכת הורים.',
    transcript: [
      {
        id: 'msg-61',
        sender: 'CHARACTER',
        text: 'היי שירה, רומי כאן. ציירתי היום ציור של שתי מחילות ביער, אחת אצל אבא ואחת אצל אמא.',
        timestamp: '10:18:00',
      },
      {
        id: 'msg-62',
        sender: 'CHILD',
        text: 'גם לי יש עכשיו שני חדרים. אבל לפעמים אני חושבת שאם לא הייתי עושה בלגן הם לא היו נפרדים.',
        timestamp: '10:18:40',
        detectedEmotion: 'אשמה ועצב עמוק',
      },
      {
        id: 'msg-63',
        sender: 'THERAPIST_STEERING',
        text: 'הנחיה לדמות: הבהירי לשירה בצורה הכי ברורה וחמה שפרידה היא החלטה של מבוגרים בלבד, ושאין לזה שום קשר אליה או למעשים שלה.',
        timestamp: '10:19:00',
      },
      {
        id: 'msg-64',
        sender: 'CHARACTER',
        text: 'שירה מתוקה שלי, תקשיבי לי טוב טוב: מבוגרים נפרדים רק בגלל עניינים של מבוגרים. ילדים, גם כשהם עושים את הבלגן הכי גדול בעולם, אף פעם לא אשמים בזה! אמא ואבא אוהבים אותך באותה מידה בדיוק.',
        timestamp: '10:19:30',
      },
      {
        id: 'msg-65',
        sender: 'CHILD',
        text: 'באמת? את בטוחה בזה, רומי?',
        timestamp: '10:20:10',
        detectedEmotion: 'חיפוש אישור והקלה',
      },
      {
        id: 'msg-66',
        sender: 'CHARACTER',
        text: 'במאה אחוזים! ואת תמיד יכולה להרגיש כאן כל רגש שבא לך – לכעוס, להיות עצובה, או לשמוח.',
        timestamp: '10:20:35',
      },
    ],
  },
];

export async function getSessionsByPatient(
  patientId: string,
): Promise<SessionRecord[]> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return mockSessionRecords.filter((s) => s.patientId === patientId);
  }

  const response = await apiClient.get<SessionRecord[]>(
    `/patients/${patientId}/sessions`,
  );
  return response.data;
}

export async function getAllSessions(): Promise<SessionRecord[]> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...mockSessionRecords];
  }

  const response = await apiClient.get<SessionRecord[]>(
    '/sessions?status=completed',
  );
  return response.data;
}

export async function getSessionDetails(
  sessionId: string,
): Promise<SessionRecord> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const found = mockSessionRecords.find((s) => s.id === sessionId);
    if (!found) {
      throw new Error(`מפגש עם מזהה ${sessionId} לא נמצא`);
    }
    return { ...found };
  }

  const response = await apiClient.get<SessionRecord>(`/sessions/${sessionId}`);
  return response.data;
}

export async function updateTherapistNotes(
  sessionId: string,
  therapistNotes: string,
): Promise<SessionRecord> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = mockSessionRecords.findIndex((s) => s.id === sessionId);
    if (index === -1) {
      throw new Error(`מפגש עם מזהה ${sessionId} לא נמצא`);
    }
    mockSessionRecords[index] = {
      ...mockSessionRecords[index],
      therapistNotes,
    };
    return { ...mockSessionRecords[index] };
  }

  const response = await apiClient.patch<SessionRecord>(
    `/sessions/${sessionId}/notes`,
    { therapistNotes },
  );
  return response.data;
}

export const historyApi = {
  getSessionsByPatient,
  getAllSessions,
  getSessionDetails,
  updateTherapistNotes,
};
