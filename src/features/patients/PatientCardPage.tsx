import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getPatientById } from './api/patientsApi';
import { getSessionsByPatient } from '@/features/history/api/historyApi';
import type { Patient } from '@/types/patient.types';
import type { Session } from '@/types/session.types';

export function PatientCardPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    Promise.all([getPatientById(patientId), getSessionsByPatient(patientId)])
      .then(([pData, sData]) => {
        setPatient(pData);
        setSessions(sData);
      })
      .catch((err) => {
        console.error(err);
        setPatient(null);
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
        <h1 className="text-2xl font-bold text-gray-900">{patient.displayAlias}</h1>
      </div>

      <div className="grid gap-4 mb-6">
        <Card title="פרטי מטופל">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">גיל</dt>
              <dd className="font-medium">{patient.age}</dd>
            </div>
            <div>
              <dt className="text-gray-500">פרטים אישיים (חסוי)</dt>
              <dd className="font-medium">{patient.personalDetails}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-gray-500">רקע רגשי</dt>
              <dd className="font-medium">{patient.emotionalBackground}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-gray-500">תחומי עניין ונושאים בטוחים</dt>
              <dd className="font-medium">{patient.interestsAndSafeTopics}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-gray-500">מטרות ארוכות טווח</dt>
              <dd className="font-medium">{patient.longTermGoals}</dd>
            </div>
            {patient.therapistNotes && (
              <div className="col-span-2">
                <dt className="text-gray-500">הערות מטפל</dt>
                <dd className="font-medium">{patient.therapistNotes}</dd>
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
                <span>
                  {s.startedAt
                    ? new Date(s.startedAt).toLocaleDateString('he-IL')
                    : s.id}
                </span>
                <span className="text-gray-500">
                  {s.status}
                  {s.durationSeconds
                    ? ` · ${Math.round(s.durationSeconds / 60)} דקות`
                    : ''}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
