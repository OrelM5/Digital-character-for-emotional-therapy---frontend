import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive, Calendar } from 'lucide-react';
import { apiClient } from '@/core/api/axiosClient';
import { Card } from '@/components/ui/Card';
import type { Session } from '@/types/session.types';

const MOCK_ARCHIVED_SESSIONS: Session[] = [
  {
    id: 'arch-1',
    patientId: 'p-1',
    therapistId: 'therapist-dev-001',
    characterId: 'char-1',
    status: 'completed',
    goal: 'anxiety-reduction',
    scheduledAt: '2026-03-10T14:00:00Z',
    durationMinutes: 45,
    patient: {
      id: 'p-1',
      therapistId: 'therapist-dev-001',
      firstName: 'איתי',
      lastName: 'כהן',
      dateOfBirth: '2016-04-12',
      ageGroup: 'school-age',
      createdAt: '',
      updatedAt: '',
    },
    createdAt: '2026-03-10T14:00:00Z',
    updatedAt: '2026-03-10T14:45:00Z',
  },
  {
    id: 'arch-2',
    patientId: 'p-2',
    therapistId: 'therapist-dev-001',
    characterId: 'char-2',
    status: 'completed',
    goal: 'social-skills',
    scheduledAt: '2026-03-08T10:30:00Z',
    durationMinutes: 35,
    patient: {
      id: 'p-2',
      therapistId: 'therapist-dev-001',
      firstName: 'נועה',
      lastName: 'אברהם',
      dateOfBirth: '2018-09-03',
      ageGroup: 'preschool',
      createdAt: '',
      updatedAt: '',
    },
    createdAt: '2026-03-08T10:30:00Z',
    updatedAt: '2026-03-08T11:05:00Z',
  },
];

export function SessionArchivePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<Session[]>('/sessions?status=completed')
      .then((res) => setSessions(res.data))
      .catch(() => {
        // Fallback למצב פיתוח ללא שרת
        setSessions(MOCK_ARCHIVED_SESSIONS);
      })
      .finally(() => setLoading(false));
  }, []);


  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Archive className="w-6 h-6 text-therapy-medium" />
        <h1 className="text-2xl font-bold text-gray-900">ארכיון מפגשים</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">טוען...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">אין מפגשים מושלמים עדיין</div>
      ) : (
        <div className="grid gap-3">
          {sessions.map((s) => (
            <Link key={s.id} to={`/sessions/${s.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {s.patient
                          ? `${s.patient.firstName} ${s.patient.lastName}`
                          : s.patientId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(s.scheduledAt).toLocaleDateString('he-IL')}
                        {s.durationMinutes ? ` · ${s.durationMinutes} דקות` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    הושלם
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
