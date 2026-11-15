import { useEffect, useRef } from 'react';
import { MessageCircle, Bot } from 'lucide-react';
import type { TranscriptUpdateMessage } from '@/types/websocket.types';

export interface TranscriptEntry {
  id: string;
  speaker: 'child' | 'character';
  text: string;
  timestamp: number;
  isFinal: boolean;
}

interface LiveTranscriptProps {
  entries: TranscriptEntry[];
}

export function LiveTranscript({ entries }: LiveTranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white">
        <MessageCircle className="w-4 h-4 text-therapy-medium" />
        <h2 className="text-sm font-semibold text-gray-900">תמלול חי</h2>
        <span className="ms-auto flex items-center gap-1.5 text-xs text-green-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft" />
          בשידור
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {entries.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">
            הסשן עדיין לא התחיל...
          </p>
        )}

        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`flex gap-2 ${entry.speaker === 'character' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                entry.speaker === 'character'
                  ? 'bg-therapy-medium text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {entry.speaker === 'character' ? (
                <Bot className="w-4 h-4" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
            </div>

            <div
              className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                entry.speaker === 'character'
                  ? 'bg-therapy-soft text-therapy-strong'
                  : 'bg-white text-gray-800 border border-gray-200'
              } ${!entry.isFinal ? 'opacity-60 italic' : ''}`}
            >
              {entry.text}
              {!entry.isFinal && <span className="animate-pulse"> ...</span>}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// Helper to build TranscriptEntry from WS message
export function transcriptEntryFromMessage(msg: TranscriptUpdateMessage): TranscriptEntry {
  return {
    id: `${msg.sessionId}-${msg.timestamp}`,
    speaker: msg.speaker,
    text: msg.text,
    timestamp: msg.timestamp,
    isFinal: msg.isFinal,
  };
}
