import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Search } from 'lucide-react';
import { apiClient } from '@/core/api/axiosClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import type { Patient, PaginatedResponse } from '@/types/patient.types';

const MOCK_PATIENTS: Patient[] = [
  {
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
  {
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
  {
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
];

export function PatientsListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get<PaginatedResponse<Patient>>('/patients', { params: { search } })
      .then((res) => setPatients(res.data.data))
      .catch(() => {
        // Fallback למצב שבו אין שרת עדיין
        const filtered = search
          ? MOCK_PATIENTS.filter((p) =>
              `${p.firstName} ${p.lastName}`.includes(search),
            )
          : MOCK_PATIENTS;
        setPatients(filtered);
      })
      .finally(() => setLoading(false));
  }, [search]);


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">המטופלים שלי</h1>
        <Button icon={<UserPlus className="w-4 h-4" />} as={Link} to="/patients/new">
          מטופל חדש
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="חיפוש לפי שם..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4 text-gray-400" />}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">טוען...</div>
      ) : patients.length === 0 ? (
        <div className="text-center py-12 text-gray-500">לא נמצאו מטופלים</div>
      ) : (
        <div className="grid gap-3">
          {patients.map((p) => (
            <Link key={p.id} to={`/patients/${p.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{p.ageGroup}</p>
                  </div>
                  <span className="text-brand-600 text-sm">פרטים ←</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
