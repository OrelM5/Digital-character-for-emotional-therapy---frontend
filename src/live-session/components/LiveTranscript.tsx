import { useEffect, useRef } from 'react';
import { MessageCircle, Bot, ShieldAlert } from 'lucide-react';
import type { TranscriptSpeaker } from '@/types/session.types';
import type { TranscriptUpdatePayload } from '@/types/websocket.types';

export interface TranscriptEntry {
  sequenceNumber: number;
  speaker: TranscriptSpeaker;
  content: string;
  timestamp: string;
  isFinal: boolean;
  ttsDirectives?: string | null;
  animationTriggerId?: string | null;
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

        {entries.map((entry) => {
          if (entry.speaker === 'THERAPIST_STEERING') {
            return (
              <div key={`${entry.sequenceNumber}-${entry.timestamp}`} className="flex justify-center">
                <div className="max-w-[85%] rounded-lg px-3 py-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    <strong className="font-semibold">הנחיית מטפל סמויה: </strong>
                    {entry.content}
                  </span>
                </div>
              </div>
            );
          }

          const isCharacter = entry.speaker === 'CHARACTER';
          return (
            <div
              key={`${entry.sequenceNumber}-${entry.timestamp}`}
              className={`flex gap-2 ${isCharacter ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                  isCharacter
                    ? 'bg-therapy-medium text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isCharacter ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <MessageCircle className="w-4 h-4" />
                )}
              </div>

              <div
                className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                  isCharacter
                    ? 'bg-therapy-soft text-therapy-strong'
                    : 'bg-white text-gray-800 border border-gray-200'
                } ${!entry.isFinal ? 'opacity-60 italic' : ''}`}
              >
                <p>{entry.content}</p>
                {!entry.isFinal && <span className="animate-pulse"> ...</span>}
                {(entry.animationTriggerId || entry.ttsDirectives) && (
                  <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] opacity-75">
                    {entry.animationTriggerId && (
                      <span className="px-1.5 py-0.5 rounded bg-black/5 font-mono">
                        {entry.animationTriggerId}
                      </span>
                    )}
                    {entry.ttsDirectives && (
                      <span className="px-1.5 py-0.5 rounded bg-black/5">
                        {entry.ttsDirectives}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// Helper to build TranscriptEntry from inbound WS payload
export function transcriptEntryFromPayload(
  payload: TranscriptUpdatePayload,
  fallbackSequenceNumber: number,
): TranscriptEntry {
  return {
    sequenceNumber: payload.sequenceNumber ?? fallbackSequenceNumber,
    speaker: payload.speaker,
    content: payload.content,
    timestamp: payload.timestamp,
    isFinal: payload.isFinal,
    ttsDirectives: payload.ttsDirectives ?? null,
    animationTriggerId: payload.animationTriggerId ?? null,
  };
}
