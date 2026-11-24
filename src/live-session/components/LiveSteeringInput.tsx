import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send, Smile, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/core/api/axiosClient';
import { Button } from '@/components/ui/Button';
import type { LiveSteeringRequest, LiveSteeringResponse } from '@/types/session.types';

const TONE_OPTIONS: { value: string; label: string; emoji: string; animationTriggerId: string }[] = [
  { value: 'happy', label: 'שמח', emoji: '😊', animationTriggerId: 'CLAP_HAPPY' },
  { value: 'calm', label: 'רגוע', emoji: '😌', animationTriggerId: 'IDLE_LISTEN' },
  { value: 'empathetic', label: 'אמפתי', emoji: '💛', animationTriggerId: 'EMPATHIC_NOD' },
  { value: 'curious', label: 'סקרן', emoji: '🤔', animationTriggerId: 'THINKING' },
  { value: 'warm', label: 'מחבק', emoji: '🤗', animationTriggerId: 'HUG_GESTURE' },
  { value: 'welcoming', label: 'מזמין', emoji: '👋', animationTriggerId: 'WAVE_HELLO' },
];

interface LiveSteeringInputProps {
  sessionId: string;
  onSteeringSent?: (content: string) => void;
  disabled?: boolean;
}

/**
 * Contract 1 (LOCKED) Outbound Live Steering via Team 2 HTTP POST:
 * POST /sessions/:sessionId/steering (Team 2 forwards internally to Team 3 LLM).
 * No direct frontend connection to Team 3.
 */
export function LiveSteeringInput({
  sessionId,
  onSteeringSent,
  disabled,
}: LiveSteeringInputProps) {
  const [instruction, setInstruction] = useState('');
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [mode, setMode] = useState<'text' | 'tone'>('text');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  async function submitSteering(payload: LiveSteeringRequest, displaySummary: string) {
    if (!sessionId) return;
    setSending(true);
    setFeedback(null);
    try {
      await apiClient.post<LiveSteeringResponse>(
        '/sessions/' + sessionId + '/steering',
        payload,
      );
      onSteeringSent?.(displaySummary);
      setFeedback({ type: 'success', text: 'ההנחיה נשלחה בהצלחה לדמות' });
      setTimeout(() => setFeedback(null), 2500);
    } catch {
      setFeedback({ type: 'error', text: 'שגיאה בשליחת ההנחיה לשרת. נסה שוב.' });
    } finally {
      setSending(false);
    }
  }

  async function handleSendText(e: FormEvent) {
    e.preventDefault();
    const trimmed = instruction.trim();
    if (!trimmed || sending) return;
    await submitSteering({ instruction: trimmed }, trimmed);
    setInstruction('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendText(e as unknown as FormEvent);
    }
  }

  async function handleSendTone() {
    if (!selectedTone || sending) return;
    const option = TONE_OPTIONS.find((o) => o.value === selectedTone);
    const payload: LiveSteeringRequest = {
      instruction: option
        ? `עבור לטון ${option.label} והבע רגש מותאם`
        : `עבור לטון ${selectedTone}`,
      desiredTone: selectedTone,
      suggestedAnimationTriggerId: option?.animationTriggerId,
    };
    const label = option ? `${option.emoji} שינוי טון/אנימציה: ${option.label}` : selectedTone;
    await submitSteering(payload, label);
    setSelectedTone(null);
  }

  return (
    <div className="bg-white border-t border-gray-200 p-4 space-y-3">
      {/* Mode toggle */}
      <div className="flex items-center gap-2 text-xs font-medium">
        <button
          type="button"
          className={`px-3 py-1.5 rounded-full transition-colors ${
            mode === 'text'
              ? 'bg-therapy-medium text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setMode('text')}
        >
          הנחיה סמויה לדמות
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
            mode === 'tone'
              ? 'bg-therapy-medium text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setMode('tone')}
        >
          <Smile className="w-3 h-3" />
          שנה טון ואנימציה
        </button>

        {feedback && (
          <span
            className={`ms-auto flex items-center gap-1 text-xs ${
              feedback.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            {feedback.text}
          </span>
        )}
      </div>

      {/* Text mode */}
      {mode === 'text' && (
        <form onSubmit={handleSendText} className="flex gap-2">
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="הקלד הנחיה סמויה לדמות (למשל: שאל על בית הספר)... Enter לשליחה"
            disabled={disabled || sending}
            rows={2}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
            dir="rtl"
          />
          <Button
            type="submit"
            loading={sending}
            disabled={!instruction.trim() || disabled || sending}
            icon={<Send className="w-4 h-4" />}
            aria-label="שלח הנחיה"
          />
        </form>
      )}

      {/* Tone & Animation mode */}
      {mode === 'tone' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {TONE_OPTIONS.map((t) => (
              <button
                key={t.value}
                type="button"
                disabled={disabled || sending}
                onClick={() => setSelectedTone(t.value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 text-xs font-medium transition-colors ${
                  selectedTone === t.value
                    ? 'border-therapy-medium bg-therapy-soft'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
          <Button
            fullWidth
            loading={sending}
            disabled={!selectedTone || disabled || sending}
            onClick={handleSendTone}
            icon={<Smile className="w-4 h-4" />}
          >
            שלח הנחיית טון
          </Button>
        </div>
      )}

      {disabled && (
        <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          ממתין לחיבור WebSocket...
        </div>
      )}
    </div>
  );
}
