import { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StopCircle, Wifi, WifiOff } from 'lucide-react';
import { apiClient } from '@/core/api/axiosClient';
import { useLiveSessionSocket } from './hooks/useLiveSessionSocket';
import {
  LiveTranscript,
  transcriptEntryFromPayload,
  type TranscriptEntry,
} from './components/LiveTranscript';
import { LiveSteeringInput } from './components/LiveSteeringInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Session } from '@/types/session.types';
import type {
  TranscriptUpdatePayload,
  EmotionDetectedPayload,
  CharacterStatePayload,
} from '@/types/websocket.types';

export function LiveControlRoomPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [latestEmotion, setLatestEmotion] = useState<string | null>(null);
  const [emotionConfidence, setEmotionConfidence] = useState<number>(0);
  const [characterState, setCharacterState] = useState<CharacterStatePayload | null>(null);
  const [endingSession, setEndingSession] = useState(false);

  const handleTranscriptUpdate = useCallback((payload: TranscriptUpdatePayload) => {
    setTranscript((prev) => {
      const existing = prev.findIndex(
        (e) => e.speaker === payload.speaker && !e.isFinal,
      );
      const entry = transcriptEntryFromPayload(payload, prev.length + 1);
      if (existing !== -1) {
        const next = [...prev];
        next[existing] = entry;
        return next;
      }
      return [...prev, entry];
    });
  }, []);

  const handleEmotionDetected = useCallback((payload: EmotionDetectedPayload) => {
    setLatestEmotion(payload.emotion);
    setEmotionConfidence(payload.confidence ?? 0);
  }, []);

  const handleCharacterState = useCallback((payload: CharacterStatePayload) => {
    setCharacterState(payload);
  }, []);

  const handleSessionEnded = useCallback(() => {
    navigate('/history', { replace: true });
  }, [navigate]);

  const { status, disconnect } = useLiveSessionSocket({
    sessionId: sessionId ?? '',
    onTranscriptUpdate: handleTranscriptUpdate,
    onEmotionDetected: handleEmotionDetected,
    onCharacterState: handleCharacterState,
    onSessionEnded: handleSessionEnded,
  });

  // Contract 1: End session via Team 2 HTTP POST, disconnect WS, navigate to /history
  async function handleEndSession() {
    if (!sessionId || endingSession) return;
    setEndingSession(true);
    try {
      await apiClient.post<Session>('/sessions/' + sessionId + '/end');
    } catch (err) {
      console.error('[LiveControlRoom] Failed to call /sessions/:id/end:', err);
    } finally {
      disconnect();
      setEndingSession(false);
      navigate('/history', { replace: true });
    }
  }

  // Optimistically append THERAPIST_STEERING entry after HTTP POST succeeds
  const handleSteeringSent = useCallback((content: string) => {
    setTranscript((prev) => [
      ...prev,
      {
        sequenceNumber: prev.length + 1,
        speaker: 'THERAPIST_STEERING',
        content,
        timestamp: new Date().toISOString(),
        isFinal: true,
        ttsDirectives: null,
        animationTriggerId: null,
      },
    ]);
  }, []);

  const isConnected = status === 'connected';

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">חדר שליטה חי</h1>
          <span
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
              isConnected
                ? 'bg-green-100 text-green-700'
                : status === 'connecting' || status === 'reconnecting'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {isConnected ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            {status === 'connected'
              ? 'מחובר'
              : status === 'connecting'
              ? 'מתחבר...'
              : status === 'reconnecting'
              ? 'מתחבר מחדש...'
              : 'מנותק'}
          </span>
        </div>

        <Button
          variant="danger"
          loading={endingSession}
          onClick={handleEndSession}
          icon={<StopCircle className="w-4 h-4" />}
        >
          סיים מפגש
        </Button>
      </div>

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        {/* Transcript – spans 2 cols */}
        <div className="col-span-2 flex flex-col min-h-0">
          <Card className="flex-1 overflow-hidden p-0">
            <LiveTranscript entries={transcript} />
          </Card>
          <LiveSteeringInput
            sessionId={sessionId ?? ''}
            onSteeringSent={handleSteeringSent}
            disabled={!isConnected}
          />
        </div>

        {/* Side status panel */}
        <div className="flex flex-col gap-4">
          <Card title="זיהוי רגשות">
            {latestEmotion ? (
              <div className="text-center py-4">
                <p className="text-3xl mb-2">
                  {latestEmotion === 'happy'
                    ? '😊'
                    : latestEmotion === 'sad'
                    ? '😢'
                    : latestEmotion === 'angry'
                    ? '😠'
                    : latestEmotion === 'calm'
                    ? '😌'
                    : '🤔'}
                </p>
                <p className="font-semibold text-gray-900 capitalize">{latestEmotion}</p>
                {emotionConfidence > 0 && (
                  <>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-therapy-medium h-2 rounded-full transition-all"
                        style={{ width: `${(emotionConfidence * 100).toFixed(0)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {(emotionConfidence * 100).toFixed(0)}% ודאות
                    </p>
                  </>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-400 text-sm py-6">
                ממתין לנתוני רגש...
              </p>
            )}
          </Card>

          <Card title="מידע על הסשן">
            <dl className="text-xs space-y-2 text-gray-600">
              <div className="flex justify-between">
                <dt>מזהה סשן</dt>
                <dd className="font-mono text-gray-500 truncate max-w-[100px]">{sessionId}</dd>
              </div>
              <div className="flex justify-between">
                <dt>סטטוס חיבור</dt>
                <dd className="font-medium">{status}</dd>
              </div>
              {characterState && (
                <>
                  <div className="flex justify-between">
                    <dt>מצב דמות</dt>
                    <dd className="font-medium">{characterState.state}</dd>
                  </div>
                  {characterState.animationTriggerId && (
                    <div className="flex justify-between">
                      <dt>אנימציה פעילה</dt>
                      <dd className="font-mono text-therapy-medium">
                        {characterState.animationTriggerId}
                      </dd>
                    </div>
                  )}
                </>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
