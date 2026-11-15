import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { apiClient } from '@/core/api/axiosClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import type { Patient } from '@/types/patient.types';
import type { Character } from '@/types/character.types';
import type { SessionGoal, CreateSessionDto } from '@/types/session.types';

const SESSION_GOALS: { value: SessionGoal; label: string }[] = [
  { value: 'emotion-recognition', label: 'זיהוי רגשות' },
  { value: 'social-skills', label: 'כישורים חברתיים' },
  { value: 'anxiety-reduction', label: 'הפחתת חרדה' },
  { value: 'communication', label: 'תקשורת' },
  { value: 'other', label: 'אחר' },
];

const MOCK_CHARACTERS_FALLBACK: Character[] = [
  {
    id: 'char-1',
    name: 'בובי הדובון',
    gender: 'neutral',
    personality: 'calm',
    description: 'דמות רגועה ומנחמת המתאימה להפחתת חרדה',
    avatarUrl: '/avatars/bear.png',
    modelUrl: '/models/bear.glb',
    isActive: true,
  },
  {
    id: 'char-2',
    name: 'לילי השועלה',
    gender: 'female',
    personality: 'playful',
    description: 'דמות אנרגטית ושובבה לעידוד תקשורת ופתיחות',
    avatarUrl: '/avatars/fox.png',
    modelUrl: '/models/fox.glb',
    isActive: true,
  },
];

const MOCK_PATIENTS_FALLBACK: Patient[] = [
  {
    id: 'p-1',
    therapistId: 'therapist-dev-001',
    firstName: 'איתי',
    lastName: 'כהן',
    dateOfBirth: '2016-04-12',
    ageGroup: 'school-age',
    diagnosis: 'חרדה חברתית',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'p-2',
    therapistId: 'therapist-dev-001',
    firstName: 'נועה',
    lastName: 'אברהם',
    dateOfBirth: '2018-09-03',
    ageGroup: 'preschool',
    diagnosis: 'קשיים בוויסות רגשי',
    createdAt: '2026-02-14T09:30:00Z',
    updatedAt: '2026-02-14T09:30:00Z',
  },
];

export function NewSessionSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId') ?? '';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [patientId, setPatientId] = useState(preselectedPatientId);
  const [characterId, setCharacterId] = useState('');
  const [goal, setGoal] = useState<SessionGoal>('emotion-recognition');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      apiClient.get<{ data: Patient[] }>('/patients'),
      apiClient.get<Character[]>('/characters'),
    ])
      .then(([pRes, cRes]) => {
        setPatients(pRes.data.data);
        setCharacters(cRes.data);
        if (cRes.data[0]) setCharacterId(cRes.data[0].id);
      })
      .catch(() => {
        // Fallback למצב פיתוח ללא שרת
        setPatients(MOCK_PATIENTS_FALLBACK);
        setCharacters(MOCK_CHARACTERS_FALLBACK);
        setCharacterId(MOCK_CHARACTERS_FALLBACK[0].id);
        if (!patientId) {
          setPatientId(MOCK_PATIENTS_FALLBACK[0].id);
        }
      });
  }, [patientId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const dto: CreateSessionDto = { patientId, characterId, goal, scheduledAt, notes };
      const { data } = await apiClient.post<{ id: string }>('/sessions', dto);
      navigate(`/sessions/${data.id}/live`);
    } catch {
      // אם השרת לא מחובר, מדמים מעבר ישיר לחדר השליטה
      const mockSessionId = `dev-session-${Date.now()}`;
      navigate(`/sessions/${mockSessionId}/live`);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">הגדרת מפגש חדש</h1>
      <form onSubmit={handleSubmit}>
        <Card className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מטופל</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              required
            >
              <option value="">בחר מטופל...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">דמות</label>
            <div className="grid grid-cols-2 gap-3">
              {characters.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCharacterId(c.id)}
                  className={`p-3 rounded-lg border-2 text-sm text-right transition-colors ${
                    characterId === c.id
                      ? 'border-therapy-medium bg-therapy-soft'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-gray-500">{c.personality}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מטרת המפגש</label>
            <div className="flex flex-wrap gap-2">
              {SESSION_GOALS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGoal(g.value)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    goal === g.value
                      ? 'bg-therapy-medium text-white border-therapy-medium'
                      : 'border-gray-300 text-gray-700 hover:border-therapy-medium'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="מועד מתוכנן"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            dir="ltr"
          />

          <Input
            label="הערות (אופציונלי)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            as="textarea"
          />

          <Button type="submit" fullWidth loading={loading} icon={<PlayCircle className="w-4 h-4" />}>
            התחל מפגש
          </Button>
        </Card>
      </form>
    </div>
  );
}
