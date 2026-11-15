import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send, Smile, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ClientMessage } from '@/types/websocket.types';

type CharacterEmotion = 'happy' | 'sad' | 'excited' | 'curious' | 'calm' | 'concerned';

const EMOTION_OPTIONS: { value: CharacterEmotion; label: string; emoji: string }[] = [
  { value: 'happy', label: 'שמח', emoji: '😊' },
  { value: 'calm', label: 'רגוע', emoji: '😌' },
  { value: 'excited', label: 'נרגש', emoji: '🤩' },
  { value: 'curious', label: 'סקרן', emoji: '🤔' },
  { value: 'sad', label: 'עצוב', emoji: '😢' },
  { value: 'concerned', label: 'מודאג', emoji: '😟' },
];

interface LiveSteeringInputProps {
  sessionId: string;
  onSend: (message: ClientMessage) => void;
  disabled?: boolean;
}

export function LiveSteeringInput({ sessionId, onSend, disabled }: LiveSteeringInputProps) {
  const [text, setText] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<CharacterEmotion | null>(null);
  const [mode, setMode] = useState<'text' | 'emotion'>('text');

  function handleSendText(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend({ type: 'steering.text', sessionId, text: text.trim() });
    setText('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText(e as unknown as FormEvent);
    }
  }

  function handleSendEmotion() {
    if (!selectedEmotion) return;
    onSend({
      type: 'steering.emotion',
      sessionId,
      emotion: selectedEmotion,
      intensity: 0.8,
    });
    setSelectedEmotion(null);
  }

  return (
    <div className="bg-white border-t border-gray-200 p-4 space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-2 text-xs font-medium">
        <button
          className={`px-3 py-1.5 rounded-full transition-colors ${
            mode === 'text'
              ? 'bg-therapy-medium text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setMode('text')}
        >
          הזן טקסט לדמות
        </button>
        <button
          className={`px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
            mode === 'emotion'
              ? 'bg-therapy-medium text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setMode('emotion')}
        >
          <Smile className="w-3 h-3" />
          שנה מצב רוח
        </button>
      </div>

      {/* Text mode */}
      {mode === 'text' && (
        <form onSubmit={handleSendText} className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="הקלד הוראה לדמות... (Enter לשליחה)"
            disabled={disabled}
            rows={2}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
            dir="rtl"
          />
          <Button
            type="submit"
            disabled={!text.trim() || disabled}
            icon={<Send className="w-4 h-4" />}
            aria-label="שלח"
          />
        </form>
      )}

      {/* Emotion mode */}
      {mode === 'emotion' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {EMOTION_OPTIONS.map((e) => (
              <button
                key={e.value}
                onClick={() => setSelectedEmotion(e.value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 text-xs font-medium transition-colors ${
                  selectedEmotion === e.value
                    ? 'border-therapy-medium bg-therapy-soft'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">{e.emoji}</span>
                {e.label}
              </button>
            ))}
          </div>
          <Button
            fullWidth
            disabled={!selectedEmotion || disabled}
            onClick={handleSendEmotion}
            icon={<Smile className="w-4 h-4" />}
          >
            הפעל רגש
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
