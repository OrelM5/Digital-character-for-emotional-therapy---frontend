import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  PlayCircle,
  Clock,
  Edit3,
  Heart,
  Target,
  FileText,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PatientFormModal } from '../components/PatientFormModal';
import {
  getPatients,
  createPatient,
  updatePatient,
} from '../api/patientsApi';
import type { Patient, CreatePatientRequest } from '@/types/patient.types';

export interface PatientsPageProps {
  onStartSession?: (patientId: string) => void;
  onViewHistory?: (patientId: string) => void;
}

export function PatientsPage({ onStartSession, onViewHistory }: PatientsPageProps) {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchPatientsList = useCallback(async (searchTerm?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPatients(searchTerm);
      setPatients(data);
    } catch {
      setError('לא ניתן לטעון את רשימת המטופלים כעת. אנא נסה שוב מאוחר יותר.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatientsList(search);
    }, 200);
    return () => clearTimeout(timer);
  }, [search, fetchPatientsList]);

  const handleStartSession = (patientId: string) => {
    if (onStartSession) {
      onStartSession(patientId);
    } else {
      navigate(`/sessions/new?patientId=${patientId}`);
    }
  };

  const handleViewHistory = (patientId: string) => {
    if (onViewHistory) {
      onViewHistory(patientId);
    } else {
      navigate(`/history?patientId=${patientId}`);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleSavePatient = async (formData: CreatePatientRequest) => {
    if (editingPatient) {
      const updated = await updatePatient(editingPatient.id, formData);
      setPatients((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
      showToast(`פרטי המטופל/ת ${updated.displayAlias} עודכנו בהצלחה`);
    } else {
      const created = await createPatient(formData);
      setPatients((prev) => [created, ...prev]);
      showToast(`המטופל/ת ${created.displayAlias} נוסף/ה בהצלחה למערכת`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  return (
    <div dir="rtl" className="w-full max-w-7xl mx-auto space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="mr-2 text-emerald-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-therapy-soft rounded-lg text-therapy-medium">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ניהול מטופלים</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            מעקב אחר תיקי ילדים בטיפול, התאמת דמויות וירטואליות והפעלת מפגשים
          </p>
        </div>

        <Button
          variant="primary"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={handleOpenCreateModal}
        >
          הוספת מטופל חדש
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="חיפוש לפי כינוי, פרטים אישיים, תחומי עניין או רקע רגשי..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-gray-400" />}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              title="נקה חיפוש"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500 self-center whitespace-nowrap">
          סה״כ: <span className="font-semibold text-gray-800">{patients.length}</span> מטופלים
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 shadow-xs">
          <RefreshCw className="w-8 h-8 text-therapy-medium animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-600">טוען את נתוני המטופלים...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fetchPatientsList(search)}
          >
            נסה שוב
          </Button>
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 p-8 space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {search ? 'לא נמצאו תוצאות' : 'טרם נוספו מטופלים'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {search
                ? `לא נמצאו מטופלים התואמים את מונח החיפוש "${search}".`
                : 'הוסף את המטופל/ת הראשון/ה כדי להתחיל בהגדרת מפגשים טיפוליים.'}
            </p>
          </div>
          <div>
            {search ? (
              <Button variant="secondary" size="sm" onClick={() => setSearch('')}>
                איפוס חיפוש
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={<UserPlus className="w-4 h-4" />}
                onClick={handleOpenCreateModal}
              >
                הוספת מטופל חדש
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {patients.map((patient) => (
            <Card
              key={patient.id}
              className="flex flex-col justify-between hover:shadow-md transition-shadow border-gray-200 hover:border-therapy-soft"
              padding="md"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-therapy-soft to-purple-100 text-therapy-strong font-bold text-base flex items-center justify-center border border-purple-200 shrink-0">
                      {patient.displayAlias.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900">
                          {patient.displayAlias}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          גיל {patient.age}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {patient.personalDetails}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        מזהה: {patient.id}
                        {patient.createdAt
                          ? ` • נוצר: ${new Date(patient.createdAt).toLocaleDateString('he-IL')}`
                          : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(patient)}
                    className="p-1.5 text-gray-400 hover:text-therapy-medium hover:bg-gray-100 rounded-lg transition-colors"
                    title="עריכת פרטי מטופל"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-xs leading-relaxed text-gray-700 border border-gray-100">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800 mb-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>רקע רגשי:</span>
                  </div>
                  <p>{patient.emotionalBackground}</p>
                </div>

                {patient.interestsAndSafeTopics && (
                  <div className="text-xs text-gray-700">
                    <div className="flex items-center gap-1.5 font-medium text-gray-600 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      <span>תחומי עניין ונושאים בטוחים:</span>
                    </div>
                    <p className="pr-5 text-gray-600">{patient.interestsAndSafeTopics}</p>
                  </div>
                )}

                <div className="text-xs text-gray-700 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                    <Target className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>מטרות טיפוליות:</span>
                  </div>
                  <p className="pr-5 leading-relaxed text-gray-600 line-clamp-2">
                    {patient.longTermGoals}
                  </p>
                </div>

                {patient.therapistNotes && (
                  <div className="text-xs text-gray-600 space-y-1 bg-amber-50/60 border border-amber-100 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 font-medium text-amber-800">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span>הערות מטפל:</span>
                    </div>
                    <p className="pr-5 text-gray-700 line-clamp-2">
                      {patient.therapistNotes}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<PlayCircle className="w-4 h-4" />}
                  onClick={() => handleStartSession(patient.id)}
                  className="flex-1"
                >
                  התחל מפגש
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Clock className="w-4 h-4" />}
                  onClick={() => handleViewHistory(patient.id)}
                  className="flex-1"
                >
                  היסטוריית מפגשים
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <PatientFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSavePatient}
        patient={editingPatient}
      />
    </div>
  );
}
