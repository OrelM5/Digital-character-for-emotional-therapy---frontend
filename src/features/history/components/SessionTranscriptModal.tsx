import { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Bot,
  User,
  Wand2,
  Calendar,
  Clock,
  Save,
  CheckCircle2,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { updateTherapistNotes } from '../api/historyApi';
import type { SessionDetails } from '@/types/session.types';

export interface SessionTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionDetails | null;
  patientDisplayName?: string;
  characterDisplayName?: string;
  onNotesUpdated?: (sessionId: string, newNotes: string) => void;
}

export function SessionTranscriptModal({
  isOpen,
  onClose,
  session,
  patientDisplayName,
  characterDisplayName,
  onNotesUpdated,
}: SessionTranscriptModalProps) {
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (session) {
      setNotes(session.therapistSessionNotes || '');
      setSaveSuccess(false);
    }
  }, [session]);

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

  if (!isOpen || !session) return null;

  const durationMinutes = session.durationSeconds
    ? Math.max(1, Math.round(session.durationSeconds / 60))
    : null;

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setSaveSuccess(false);
    try {
      const updated = await updateTherapistNotes(session.id, notes);
      setSaveSuccess(true);
      if (onNotesUpdated) {
        onNotesUpdated(session.id, updated.therapistSessionNotes || '');
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // Handled
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-therapy-soft text-therapy-medium flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5 text-therapy-medium" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  פרוטוקול וסיכום מפגש טיפולי
                </h2>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  <span className="font-medium text-gray-800">
                    מטופל: {patientDisplayName || session.patientId}
                  </span>
                  <span>•</span>
                  <span>דמות: {characterDisplayName || session.characterId}</span>
                  {session.startedAt && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(session.startedAt).toLocaleDateString('he-IL')}
                      </span>
                    </>
                  )}
                  {durationMinutes !== null && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {durationMinutes} דקות
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="סגור חלונית"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Highlighted AI Summary Card */}
          <div className="bg-gradient-to-br from-therapy-soft/70 via-purple-50/50 to-white rounded-xl p-5 border border-purple-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-therapy-medium text-white rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">
                  סיכום קליני חכם של המפגש (AI Summary)
                </h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-medium">
                ניתוח רגשי אוטומטי
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              {session.aiSummary || 'טרם נוצר סיכום אוטומטי למפגש זה.'}
            </p>

            <div className="pt-2 border-t border-purple-100/80 flex items-start gap-2 text-xs text-purple-900">
              <span className="font-semibold shrink-0">מטרות שהוגדרו:</span>
              <span className="text-purple-800">{session.sessionGoals}</span>
            </div>
          </div>

          {/* Full Chronological Chat Protocol Transcript */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-therapy-medium" />
                תמליל השיחה המלא (Verbatim Transcript)
              </h3>
              <span className="text-xs text-gray-400">
                {session.transcript.length} הודעות והיגויים מוקלטים
              </span>
            </div>

            {/* Transcript Messages Container */}
            <div className="bg-gray-50/60 rounded-2xl p-4 border border-gray-200 space-y-4 max-h-[380px] overflow-y-auto">
              {session.transcript.map((msg) => {
                if (msg.speaker === 'THERAPIST_STEERING') {
                  return (
                    <div
                      key={msg.sequenceNumber}
                      className="mx-auto w-full max-w-xl my-2 p-3 bg-amber-50/90 rounded-xl border border-dashed border-amber-300 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-800">
                          <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                          הנחיית מטפל חיה (מאחורי הקלעים)
                        </span>
                        <span className="text-[11px] text-amber-600 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString('he-IL')}
                        </span>
                      </div>
                      <p className="text-amber-900 leading-relaxed font-medium">
                        {msg.content}
                      </p>
                    </div>
                  );
                }

                const isChild = msg.speaker === 'CHILD';

                return (
                  <div
                    key={msg.sequenceNumber}
                    className={`flex items-start gap-3 ${
                      isChild ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                        isChild
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-purple-100 text-therapy-strong border border-purple-200'
                      }`}
                    >
                      {isChild ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs space-y-1.5 ${
                        isChild
                          ? 'bg-white border border-blue-200 text-gray-900 rounded-tr-none'
                          : 'bg-therapy-soft/70 border border-purple-200 text-purple-950 rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-[11px] text-gray-400">
                        <span className="font-semibold text-gray-700">
                          {isChild
                            ? patientDisplayName || 'הילד/ה'
                            : characterDisplayName || session.characterId}
                        </span>
                        <span className="font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString('he-IL')}
                        </span>
                      </div>

                      <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>

                      {(msg.animationTriggerId || msg.ttsDirectives) && (
                        <div className="pt-1 flex flex-wrap items-center gap-1.5">
                          {msg.animationTriggerId && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                              {msg.animationTriggerId}
                            </span>
                          )}
                          {msg.ttsDirectives && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              {msg.ttsDirectives}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Editable Therapist Notes Section */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-700" />
                <h4 className="text-sm font-bold text-gray-900">
                  הערות קליניות של המטפל למפגש זה
                </h4>
              </div>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ההערות עודכנו בהצלחה!
                </span>
              )}
            </div>

            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 text-xs sm:text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors leading-relaxed"
              placeholder="הזן כאן את הערותיך המקצועיות, דגשים למפגש הבא, תובנות להורים או הנחיות טיפוליות..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={savingNotes}
                icon={<Save className="w-3.5 h-3.5" />}
                onClick={handleSaveNotes}
              >
                שמור הערות מטפל
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-gray-100 bg-gray-50/50">
          <Button variant="secondary" size="sm" onClick={onClose}>
            סגור
          </Button>
        </div>
      </div>
    </div>
  );
}
