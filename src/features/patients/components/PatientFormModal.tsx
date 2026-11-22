import { useState, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { X, UserPlus, UserCheck, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Patient, CreatePatientInput } from '../types/patient.types';

export interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePatientInput) => Promise<void> | void;
  patient?: Patient | null;
  loading?: boolean;
}

const COMMON_INTERESTS_SUGGESTIONS = [
  'לגו והרכבות',
  'ציור ויצירה',
  'משחקי מחשב',
  'חיות מחמד',
  'כדורגל וספורט',
  'סיפורים ואגדות',
  'מוזיקה ושירה',
  'מדע וחלל',
];

export function PatientFormModal({
  isOpen,
  onClose,
  onSubmit,
  patient,
  loading = false,
}: PatientFormModalProps) {
  const isEditMode = Boolean(patient);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [emotionalBackground, setEmotionalBackground] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [longTermGoals, setLongTermGoals] = useState('');
  const [ongoingNotes, setOngoingNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (patient) {
      setFirstName(patient.firstName);
      setLastName(patient.lastName);
      setAge(patient.age);
      setEmotionalBackground(patient.emotionalBackground);
      setInterests(patient.interests || []);
      setLongTermGoals(patient.longTermGoals);
      setOngoingNotes(patient.ongoingNotes || '');
    } else {
      setFirstName('');
      setLastName('');
      setAge('');
      setEmotionalBackground('');
      setInterests([]);
      setLongTermGoals('');
      setOngoingNotes('');
    }
    setInterestInput('');
    setErrors({});
  }, [patient, isOpen]);

  // Close on Escape key
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

  const handleAddInterest = (itemToAdd?: string) => {
    const value = (itemToAdd || interestInput).trim();
    if (!value) return;
    if (!interests.includes(value)) {
      setInterests((prev) => [...prev, value]);
    }
    if (!itemToAdd) {
      setInterestInput('');
    }
  };

  const handleInterestKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddInterest();
    }
  };

  const handleRemoveInterest = (itemToRemove: string) => {
    setInterests((prev) => prev.filter((i) => i !== itemToRemove));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'נא להזין שם פרטי';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'נא להזין שם משפחה';
    }
    if (age === '' || isNaN(Number(age)) || Number(age) < 3 || Number(age) > 18) {
      newErrors.age = 'נא להזין גיל תקין בין 3 ל-18';
    }
    if (!emotionalBackground.trim()) {
      newErrors.emotionalBackground = 'נא למלא רקע רגשי עבור הטיפול';
    } else if (emotionalBackground.trim().length < 5) {
      newErrors.emotionalBackground = 'הרקע הרגשי קצר מדי (לפחות 5 תווים)';
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

    const data: CreatePatientInput = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age: Number(age),
      emotionalBackground: emotionalBackground.trim(),
      interests,
      longTermGoals: longTermGoals.trim(),
      ongoingNotes: ongoingNotes.trim(),
    };

    try {
      setSubmitting(true);
      await onSubmit(data);
      onClose();
    } catch {
      // errors handled by parent or rejected
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
        {/* Header */}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Row 1: Name and Age */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Input
                label="שם פרטי *"
                placeholder="לדוגמה: איתמר"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={errors.firstName}
              />
            </div>
            <div className="md:col-span-1">
              <Input
                label="שם משפחה *"
                placeholder="לדוגמה: לוי"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={errors.lastName}
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

          {/* Interests Tag Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תחומי עניין ותחביבים
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="הקלד תחום עניין ולחץ אנטר או הוסף (למשל: לגו, ציור)"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={handleInterestKeyDown}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => handleAddInterest()}
              >
                הוסף
              </Button>
            </div>

            {/* Selected interests tags */}
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="text-brand-500 hover:text-brand-800 transition-colors"
                      title="הסר"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick suggested chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                הצעות מהירות:
              </span>
              {COMMON_INTERESTS_SUGGESTIONS.map((suggestion) => {
                const isSelected = interests.includes(suggestion);
                return (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={isSelected}
                    onClick={() => handleAddInterest(suggestion)}
                    className={`text-xs px-2 py-0.5 rounded-md transition-colors ${
                      isSelected
                        ? 'bg-gray-100 text-gray-400 cursor-default'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    + {suggestion}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emotional Background */}
          <div>
            <Input
              as="textarea"
              label="רקע רגשי וקשיים עיקריים *"
              placeholder="תאר את הרקע הרגשי של המטופל/ת, קשיים עיקריים (כגון חרדה חברתית, ויסות רגשי, הסתגלות) וטריגרים רלוונטיים..."
              value={emotionalBackground}
              onChange={(e) => setEmotionalBackground(e.target.value)}
              error={errors.emotionalBackground}
              rows={3}
            />
          </div>

          {/* Long Term Goals */}
          <div>
            <Input
              as="textarea"
              label="מטרות טיפוליות ארוכות טווח *"
              placeholder="יעדים מרכזיים בתהליך הטיפולי (לדוגמה: פיתוח מנגנוני הרגעה עצמית, חיזוק הביטחון החברתי, זיהוי תסכול)..."
              value={longTermGoals}
              onChange={(e) => setLongTermGoals(e.target.value)}
              error={errors.longTermGoals}
              rows={3}
            />
          </div>

          {/* Ongoing Notes */}
          <div>
            <Input
              as="textarea"
              label="הערות שוטפות של המטפל"
              placeholder="רשמים ממפגשים, תובנות, נקודות לחיזוק והנחיות לצוות (אופציונלי)..."
              value={ongoingNotes}
              onChange={(e) => setOngoingNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Modal Footer */}
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
