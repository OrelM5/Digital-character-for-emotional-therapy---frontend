import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  PlayCircle,
  ArrowRight,
  ShieldAlert,
  User,
  CheckCircle2,
  Target,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getPatients } from '@/features/patients/api/patientsApi';
import type { Patient } from '@/types/patient.types';
import type { Character } from '@/types/character.types';
import type { CreateSessionRequest } from '@/types/session.types';
import { getCharacters, createSession } from '../api/sessionSetupApi';
import type { SessionSetupPageProps } from '../types/sessionSetup.types';

const COMMON_FOCUS_TOPICS = [
  'הסתגלות לבית ספר',
  'מריבות עם אחים',
  'חרדת פרידה מהורים',
  'זיהוי כעס וסבלנות',
  'פחד מחושך',
  'ביישנות וקשר חברתי',
  'התמודדות עם הפסד במשחק',
];

const SUGGESTED_GOALS = [
  'הפחתת חרדה ותרגול נשימות להרגעה עצמית',
  'זיהוי רגשות ושיח על תחושת תסכול בגוף',
  'משחק תפקידים לחיזוק פניות חברתיות ויצירת חברים',
  'עיבוד חוויה לא נעימה וחיזוק תחושת המסוגלות',
];

export function SessionSetupPage({
  preselectedPatientId,
  onSessionCreated,
}: SessionSetupPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPatientId =
    preselectedPatientId || searchParams.get('patientId') || '';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId);
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [sessionGoals, setSessionGoals] = useState('');
  const [focusTopics, setFocusTopics] = useState('');
  const [sensitiveBoundaries, setSensitiveBoundaries] = useState('');

  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setInitialLoading(true);
    setLoadError(null);

    Promise.all([getPatients(), getCharacters()])
      .then(([patientsData, charactersData]) => {
        if (!mounted) return;
        setPatients(patientsData);
        setCharacters(charactersData);

        if (charactersData.length > 0 && !selectedCharacterId) {
          setSelectedCharacterId(charactersData[0].id);
        }

        if (initialPatientId && patientsData.some((p) => p.id === initialPatientId)) {
          setSelectedPatientId(initialPatientId);
        } else if (patientsData.length > 0 && !selectedPatientId) {
          setSelectedPatientId(patientsData[0].id);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setLoadError('שגיאה בטעינת הנתונים לצורך הגדרת המפגש');
      })
      .finally(() => {
        if (mounted) setInitialLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [initialPatientId]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const selectedCharacter = characters.find((c) => c.id === selectedCharacterId);

  const appendFocusTopic = (topic: string) => {
    setFocusTopics((prev) => {
      if (!prev.trim()) return topic;
      if (prev.includes(topic)) return prev;
      return `${prev}, ${topic}`;
    });
  };

  const handleImportPatientInterests = () => {
    if (!selectedPatient?.interestsAndSafeTopics) return;
    appendFocusTopic(selectedPatient.interestsAndSafeTopics);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedPatientId) {
      newErrors.patient = 'יש לבחור מטופל עבור המפגש';
    }
    if (!selectedCharacterId) {
      newErrors.character = 'יש לבחור דמות מונפשת להובלת המפגש';
    }
    if (!sessionGoals.trim() || sessionGoals.trim().length < 5) {
      newErrors.sessionGoals = 'נא להגדיר את מטרות המפגש והנחיות הפתיחה (לפחות 5 תווים)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: CreateSessionRequest = {
        patientId: selectedPatientId,
        characterId: selectedCharacterId,
        sessionGoals: sessionGoals.trim(),
        focusTopics: focusTopics.trim(),
        sensitiveBoundaries: sensitiveBoundaries.trim(),
      };

      const createdSession = await createSession(payload);

      if (onSessionCreated) {
        onSessionCreated(createdSession.id);
      } else {
        navigate(`/sessions/${createdSession.id}/live`);
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        submit: 'אירעה שגיאה ביצירת המפגש. אנא נסה שנית.',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center py-24">
        <RefreshCw className="w-8 h-8 text-therapy-medium animate-spin mb-3" />
        <p className="text-sm font-medium text-gray-600">
          טוען נתוני מטופלים וקטלוג דמויות...
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        dir="rtl"
        className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-4"
      >
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <h3 className="text-base font-semibold text-red-800">{loadError}</h3>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          טען מחדש
        </Button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header & Breadcrumb */}
      <div className="space-y-2 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link to="/patients" className="hover:text-therapy-medium transition-colors">
            מטופלים
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">הגדרת מפגש חדש</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-therapy-medium" />
              הגדרת מפגש טיפולי חדש
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              הגדר את הדמות הווירטואלית, יעדי השיחה והגבולות הרגישים לפני מעבר לחדר השליטה החי
            </p>
          </div>

          <Button
            as={Link}
            to="/patients"
            variant="secondary"
            size="sm"
            icon={<ArrowRight className="w-4 h-4 icon-rtl" />}
          >
            חזרה למטופלים
          </Button>
        </div>
      </div>

      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Select Patient */}
        <Card padding="lg" className="space-y-4 border-gray-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-therapy-medium text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-base font-bold text-gray-900">בחירת מטופל</h2>
            </div>
            {selectedPatient && (
              <span className="text-xs text-therapy-strong bg-therapy-soft px-2.5 py-0.5 rounded-full font-medium">
                גיל {selectedPatient.age}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              בחר מטופל מהרשימה *
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                errors.patient ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">-- בחר מטופל/ת --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayAlias} (גיל {p.age})
                </option>
              ))}
            </select>
            {errors.patient && (
              <p className="mt-1 text-xs text-red-600">{errors.patient}</p>
            )}
          </div>

          {/* Patient Quick Preview Card */}
          {selectedPatient && (
            <div className="mt-3 p-4 bg-gray-50/80 rounded-xl border border-gray-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-600">
                <span className="flex items-center gap-1.5 font-medium text-gray-900">
                  <User className="w-4 h-4 text-therapy-medium" />
                  {selectedPatient.displayAlias}
                </span>
                <span className="text-gray-400">מזהה: {selectedPatient.id}</span>
              </div>

              <div className="text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-700">רקע רגשי: </span>
                {selectedPatient.emotionalBackground}
              </div>

              {selectedPatient.interestsAndSafeTopics && (
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <div className="text-gray-600">
                    <span className="font-semibold text-gray-700">תחומי עניין ונושאים בטוחים: </span>
                    {selectedPatient.interestsAndSafeTopics}
                  </div>
                  <button
                    type="button"
                    onClick={handleImportPatientInterests}
                    className="text-therapy-medium hover:text-therapy-strong font-medium underline text-xs transition-colors"
                  >
                    + הוסף לנושאי המיקוד
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Step 2: Choose Interactive 3D Character */}
        <Card padding="lg" className="space-y-4 border-gray-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-therapy-medium text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-base font-bold text-gray-900">
                בחירת דמות אינטראקטיבית מהקטלוג *
              </h2>
            </div>
            <span className="text-xs text-gray-500">
              {characters.length} דמויות זמינות לטיפול
            </span>
          </div>

          {errors.character && (
            <p className="text-xs text-red-600">{errors.character}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((character) => {
              const isSelected = selectedCharacterId === character.id;
              return (
                <div
                  key={character.id}
                  onClick={() => setSelectedCharacterId(character.id)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between text-right ${
                    isSelected
                      ? 'border-therapy-medium bg-therapy-soft/40 shadow-sm ring-1 ring-therapy-medium'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-therapy-medium text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      {character.avatarUrl ? (
                        <img
                          src={character.avatarUrl}
                          alt={character.name}
                          className="w-12 h-12 rounded-full object-cover border border-purple-200 bg-purple-50 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-purple-100 text-therapy-strong font-bold flex items-center justify-center shrink-0">
                          {character.name.slice(0, 1)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          {character.name}
                        </h3>
                        <span className="text-[11px] text-gray-400 font-mono">
                          {character.unityModelAssetId}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                      {character.description}
                    </p>
                  </div>

                  {/* Available Animations Chips */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap gap-1">
                    {character.availableAnimations.slice(0, 4).map((anim) => (
                      <span
                        key={anim.animationTriggerId}
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          isSelected
                            ? 'bg-white text-therapy-strong border border-purple-200'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {anim.displayName}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedCharacter && (
            <div className="text-xs text-gray-500 bg-purple-50/50 p-2.5 rounded-lg border border-purple-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-therapy-medium shrink-0" />
              <span>
                נבחרה הדמות: <strong>{selectedCharacter.name}</strong> — זמינות{' '}
                <strong>{selectedCharacter.availableAnimations.length}</strong> אנימציות תגובה.
              </span>
            </div>
          )}
        </Card>

        {/* Step 3: Session Goals */}
        <Card padding="lg" className="space-y-4 border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-therapy-medium text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="text-base font-bold text-gray-900">
              מטרות המפגש והנחיות פתיחה לדמות ה-AI *
            </h2>
          </div>

          <Input
            as="textarea"
            label="הנחיות לדמות (איך לפתוח את המפגש, מה לבחון ומה המטרה המרכזית) *"
            placeholder="לדוגמה: הדמות תפתח בשיחת חולין על לגו כדי לבנות קרבה ואמון. בהמשך תעלה בעדינות את החשש מהמבחן מחר..."
            value={sessionGoals}
            onChange={(e) => setSessionGoals(e.target.value)}
            error={errors.sessionGoals}
            rows={4}
          />

          <div className="space-y-1.5 pt-1">
            <span className="text-xs text-gray-500 font-medium">
              הצעות מהירות ליעדי מפגש (לחץ להוספה):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_GOALS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() =>
                    setSessionGoals((prev) =>
                      prev ? `${prev}\n• ${suggestion}` : suggestion,
                    )
                  }
                  className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Step 4: Focus Topics & Desired Tone */}
        <Card padding="lg" className="space-y-4 border-gray-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-therapy-medium text-white text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h2 className="text-base font-bold text-gray-900">
                נושאי מיקוד וטון שיחה רצוי (Focus Topics)
              </h2>
            </div>
            <span className="text-xs text-gray-400">אופציונלי אך מומלץ</span>
          </div>

          <Input
            as="textarea"
            label="נושאים מרכזיים וסגנון/טון שיחה מועדף (שובב, רגוע, מכיל וכו׳)"
            placeholder="לדוגמה: הסתגלות לבית הספר, חרדת פרידה בבוקר — טון שיחה רגוע, חם ומעודד..."
            value={focusTopics}
            onChange={(e) => setFocusTopics(e.target.value)}
            rows={2}
          />

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Target className="w-3 h-3 text-brand-500" />
              נושאים נפוצים:
            </span>
            {COMMON_FOCUS_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => appendFocusTopic(topic)}
                className="text-xs px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                + {topic}
              </button>
            ))}
          </div>
        </Card>

        {/* Step 5: Safety & Sensitive Boundaries */}
        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border-2 border-amber-300/80 shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-amber-950">
                  גבולות רגישים ונושאים להימנעות (Safety Boundaries)
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-200/70 text-amber-900 border border-amber-300">
                  אבטחה ומוגנות
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                הגדר במפורש נושאים, מילים או חוויות שהדמות המונפשת{' '}
                <strong>מחויבת להימנע מהם לחלוטין</strong>.
              </p>
            </div>
          </div>

          <textarea
            className="w-full border border-amber-300 rounded-xl px-3.5 py-2.5 text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors leading-relaxed"
            rows={3}
            placeholder="לדוגמה: לא להעלות שיחה על גירושי ההורים, לא לדבר על חיות מחמד שנפטרו..."
            value={sensitiveBoundaries}
            onChange={(e) => setSensitiveBoundaries(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/patients')}
            disabled={submitting}
          >
            ביטול
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            icon={<PlayCircle className="w-5 h-5" />}
            className="px-8 shadow-md"
          >
            הפעל מפגש בחדר השליטה
          </Button>
        </div>
      </form>
    </div>
  );
}
