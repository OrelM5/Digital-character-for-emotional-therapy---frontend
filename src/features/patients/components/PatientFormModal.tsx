import { useState, useEffect, type FormEvent } from 'react';
import { X, UserPlus, UserCheck, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Patient, CreatePatientRequest } from '@/types/patient.types';

export interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePatientRequest) => Promise<void> | void;
  patient?: Patient | null;
  loading?: boolean;
}

const CHARACTER_OPTIONS = [
  { id: 'char_bobi', label: 'בובי הדובון' },
  { id: 'char_lili', label: 'לילי השועלה' },
  { id: 'char_oli', label: 'אולי הינשוף' },
  { id: 'char_leo', label: 'ליאו האריה' },
  { id: 'char_kai', label: 'קאי הדרקון' },
];

export function PatientFormModal({
  isOpen,
  onClose,
  onSubmit,
  patient,
  loading = false,
}: PatientFormModalProps) {
  const isEditMode = Boolean(patient);

  const [displayAlias, setDisplayAlias] = useState('');
  const [personalDetails, setPersonalDetails] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [emotionalBackground, setEmotionalBackground] = useState('');
  const [interestsAndSafeTopics, setInterestsAndSafeTopics] = useState('');
  const [longTermGoals, setLongTermGoals] = useState('');
  const [therapistNotes, setTherapistNotes] = useState('');
  const [preferredCharacterIds, setPreferredCharacterIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (patient) {
      setDisplayAlias(patient.displayAlias);
      setPersonalDetails(patient.personalDetails);
      setAge(patient.age);
      setEmotionalBackground(patient.emotionalBackground);
      setInterestsAndSafeTopics(patient.interestsAndSafeTopics);
      setLongTermGoals(patient.longTermGoals);
      setTherapistNotes(patient.therapistNotes || '');
      setPreferredCharacterIds(patient.preferredCharacterIds || []);
    } else {
      setDisplayAlias('');
      setPersonalDetails('');
      setAge('');
      setEmotionalBackground('');
      setInterestsAndSafeTopics('');
      setLongTermGoals('');
      setTherapistNotes('');
      setPreferredCharacterIds([]);
    }
    setErrors({});
  }, [patient, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const togglePreferredCharacter = (charId: string) => {
    setPreferredCharacterIds((prev) =>
      prev.includes(charId) ? prev.filter((id) => id !== charId) : [...prev, charId],
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!displayAlias.trim()) {
      newErrors.displayAlias = 'נא להזין שם תצוגה / כינוי לשיחה';
    }
    if (!personalDetails.trim()) {
      newErrors.personalDetails = 'נא להזין פרטים מזהים ורקע אישי';
    }
    if (age === '' || isNaN(Number(age)) || Number(age) < 3 || Number(age) > 18) {
      newErrors.age = 'נא להזין גיל תקין בין 3 ל-18';
    }
    if (!emotionalBackground.trim() || emotionalBackground.trim().length < 5) {
      newErrors.emotionalBackground = 'נא למלא רקע רגשי (לפחות 5 תווים)';
    }
    if (!interestsAndSafeTopics.trim()) {
      newErrors.interestsAndSafeTopics = 'נא להזין תחומי עניין ונושאים בטוחים';
    }
    if (!longTermGoals.trim()) {
      newErrors.longTermGoals = 'נא להגדיר מטרות טיפוליות ארוכות טווח';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: CreatePatientRequest = {
      displayAlias: displayAlias.trim(),
      personalDetails: personalDetails.trim(),
      age: Number(age),
      emotionalBackground: emotionalBackground.trim(),
      interestsAndSafeTopics: interestsAndSafeTopics.trim(),
      longTermGoals: longTermGoals.trim(),
      therapistNotes: therapistNotes.trim(),
      preferredCharacterIds,
    };

    try {
      setSubmitting(true);
      await onSubmit(data);
      onClose();
    } catch {
      // errors handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const isProcessing = loading || submitting;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-therapy-soft text-therapy-medium flex items-center justify-center font-bold">
              {isEditMode ? (
                <UserCheck className="w-5 h-5 text-therapy-medium" />
              ) : (
                <UserPlus className="w-5 h-5 text-therapy-medium" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isEditMode ? 'עריכת פרטי מטופל' : 'הוספת מטופל חדש'}
              </h2>
              <p className="text-xs text-gray-500">
                פרטי הילד/ה, הרקע הרגשי וההעדפות להתאמת דמות הטיפול התלת-ממדית
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="כינוי / שם פרטי לשיחה עם הדמות *"
                placeholder="לדוגמה: איתמר"
                value={displayAlias}
                onChange={(e) => setDisplayAlias(e.target.value)}
                error={errors.displayAlias}
              />
            </div>
            <div className="md:col-span-1">
              <Input
                label="גיל (3-18) *"
                type="number"
                min={3}
                max={18}
                placeholder="8"
                value={age === '' ? '' : age}
                onChange={(e) =>
                  setAge(e.target.value === '' ? '' : Number(e.target.value))
                }
                error={errors.age}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs text-amber-700 font-medium">
                שדה חסוי — נשמר למטפל בלבד ואינו נשלח למודל ה-AI
              </span>
            </div>
            <Input
              label="פרטים אישיים מלאים (שם מלא ורקע משפחתי) *"
              placeholder="לדוגמה: איתמר לוי, תלמיד כיתה ב׳, בן בכור..."
              value={personalDetails}
              onChange={(e) => setPersonalDetails(e.target.value)}
              error={errors.personalDetails}
            />
          </div>

          <Input
            as="textarea"
            label="תחומי עניין ונושאים בטוחים *"
            placeholder="לדוגמה: לגו והרכבות, ציור קומיקס, דינוזאורים, משחקי חלל..."
            value={interestsAndSafeTopics}
            onChange={(e) => setInterestsAndSafeTopics(e.target.value)}
            error={errors.interestsAndSafeTopics}
            rows={2}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-therapy-medium" />
              דמויות מועדפות
            </label>
            <div className="flex flex-wrap gap-2">
              {CHARACTER_OPTIONS.map((char) => {
                const selected = preferredCharacterIds.includes(char.id);
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => togglePreferredCharacter(char.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selected
                        ? 'bg-therapy-medium text-white border-therapy-medium'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-therapy-medium'
                    }`}
                  >
                    {char.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            as="textarea"
            label="רקע רגשי וקשיים עיקריים *"
            placeholder="תאר את הרקע הרגשי של המטופל/ת, קשיים עיקריים וטריגרים רלוונטיים..."
            value={emotionalBackground}
            onChange={(e) => setEmotionalBackground(e.target.value)}
            error={errors.emotionalBackground}
            rows={3}
          />

          <Input
            as="textarea"
            label="מטרות טיפוליות ארוכות טווח *"
            placeholder="יעדים מרכזיים בתהליך הטיפולי..."
            value={longTermGoals}
            onChange={(e) => setLongTermGoals(e.target.value)}
            error={errors.longTermGoals}
            rows={3}
          />

          <Input
            as="textarea"
            label="הערות שוטפות של המטפל"
            placeholder="רשמים ממפגשים, תובנות, נקודות לחיזוק (אופציונלי)..."
            value={therapistNotes}
            onChange={(e) => setTherapistNotes(e.target.value)}
            rows={2}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isProcessing}
            >
              ביטול
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isProcessing}
              icon={
                isEditMode ? (
                  <UserCheck className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )
              }
            >
              {isEditMode ? 'שמירת שינויים' : 'הוספת מטופל'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
