import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, Clock } from 'lucide-react';
import { apiClient } from '@/core/api/axiosClient';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Patient } from '@/types/patient.types';
import type { Session } from '@/types/session.types';

const MOCK_PATIENT_FALLBACK: Record<string, Patient> = {
  'p-1': {
    id: 'p-1',
    therapistId: 'therapist-dev-001',
    firstName: 'איתי',
    lastName: 'כהן',
    dateOfBirth: '2016-04-12',
    ageGroup: 'school-age',
    diagnosis: 'חרדה חברתית',
    notes: 'מגיב מעולה לדמות דובון רגוע',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  'p-2': {
    id: 'p-2',
    therapistId: 'therapist-dev-001',
    firstName: 'נועה',
    lastName: 'אברהם',
    dateOfBirth: '2018-09-03',
    ageGroup: 'preschool',
    diagnosis: 'קשיים בוויסות רגשי',
    notes: 'אוהבת דמויות עליזות ושובבות',
    createdAt: '2026-02-14T09:30:00Z',
    updatedAt: '2026-02-14T09:30:00Z',
  },
  'p-3': {
    id: 'p-3',
    therapistId: 'therapist-dev-001',
    firstName: 'דניאל',
    lastName: 'מזרחי',
    dateOfBirth: '2014-11-20',
    ageGroup: 'teenager',
    diagnosis: 'התמודדות עם תסכול וכעס',
    notes: 'עבודה על זיהוי טריגרים',
    createdAt: '2026-03-01T11:00:00Z',
    updatedAt: '2026-03-01T11:00:00Z',
  },
};

const MOCK_SESSIONS_FALLBACK: Session[] = [
  {
    id: 'sess-001',
    patientId: 'p-1',
    therapistId: 'therapist-dev-001',
    characterId: 'char-1',
    status: 'completed',
    goal: 'anxiety-reduction',
    scheduledAt: '2026-03-10T14:00:00Z',
    durationMinutes: 45,
    createdAt: '2026-03-10T14:00:00Z',
    updatedAt: '2026-03-10T14:45:00Z',
  },
  {
    id: 'sess-002',
    patientId: 'p-1',
    therapistId: 'therapist-dev-001',
    characterId: 'char-1',
    status: 'completed',
    goal: 'emotion-recognition',
    scheduledAt: '2026-03-03T14:00:00Z',
    durationMinutes: 40,
    createdAt: '2026-03-03T14:00:00Z',
    updatedAt: '2026-03-03T14:40:00Z',
  },
];

export function PatientCardPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    Promise.all([
      apiClient.get<Patient>(`/patients/${patientId}`),
      apiClient.get<Session[]>(`/patients/${patientId}/sessions`),
    ])
      .then(([pRes, sRes]) => {
        setPatient(pRes.data);
        setSessions(sRes.data);
      })
      .catch(() => {
        // Fallback למצב פיתוח
        const fallback =
          MOCK_PATIENT_FALLBACK[patientId] ?? MOCK_PATIENT_FALLBACK['p-1'];
        setPatient(fallback);
        setSessions(MOCK_SESSIONS_FALLBACK);
      })
      .finally(() => setLoading(false));
  }, [patientId]);


  if (loading) return <div className="text-center py-12 text-gray-500">טוען...</div>;
  if (!patient) return <div className="text-center py-12 text-red-500">מטופל לא נמצא</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/patients" className="text-gray-500 hover:text-gray-700">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {patient.firstName} {patient.lastName}
        </h1>
      </div>

      <div className="grid gap-4 mb-6">
        <Card title="פרטי מטופל">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">תאריך לידה</dt>
              <dd className="font-medium">{patient.dateOfBirth}</dd>
            </div>
            <div>
              <dt className="text-gray-500">קבוצת גיל</dt>
              <dd className="font-medium">{patient.ageGroup}</dd>
            </div>
            {patient.diagnosis && (
              <div className="col-span-2">
                <dt className="text-gray-500">אבחנה</dt>
                <dd className="font-medium">{patient.diagnosis}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>

      <div className="flex gap-3 mb-6">
        <Button
          as={Link}
          to={`/sessions/new?patientId=${patientId}`}
          icon={<PlayCircle className="w-4 h-4" />}
        >
          התחל מפגש חדש
        </Button>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        היסטוריית מפגשים
      </h2>
      {sessions.length === 0 ? (
        <p className="text-gray-500 text-sm">אין מפגשים עדיין</p>
      ) : (
        <div className="grid gap-2">
          {sessions.map((s) => (
            <Card key={s.id} className="text-sm">
              <div className="flex justify-between">
                <span>{new Date(s.scheduledAt).toLocaleDateString('he-IL')}</span>
                <span className="text-gray-500">{s.status}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
