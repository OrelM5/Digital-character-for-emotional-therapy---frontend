import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Archive,
  Calendar,
  Clock,
  Search,
  Bot,
  User,
  Sparkles,
  FileText,
  Eye,
  RefreshCw,
  AlertCircle,
  Filter,
  Target,
  PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getPatients } from '@/features/patients/api/patientsApi';
import type { Patient } from '@/features/patients/types/patient.types';
import { getAllSessions, getSessionsByPatient } from '../api/historyApi';
import type {
  SessionRecord,
  SessionHistoryPageProps,
} from '../types/history.types';
import { SessionTranscriptModal } from '../components/SessionTranscriptModal';

export function SessionHistoryPage({
  initialPatientId,
}: SessionHistoryPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryPatientId = initialPatientId || searchParams.get('patientId') || '';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(queryPatientId);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load patients list once for the dropdown
  useEffect(() => {
    getPatients()
      .then((data) => setPatients(data))
      .catch(() => {});
  }, []);

  // Update selected patient when query parameter changes
  useEffect(() => {
    if (queryPatientId) {
      setSelectedPatientId(queryPatientId);
    }
  }, [queryPatientId]);

  // Load session archives
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: SessionRecord[];
      if (selectedPatientId) {
        data = await getSessionsByPatient(selectedPatientId);
      } else {
        data = await getAllSessions();
      }
      setSessions(data);
    } catch {
      setError('שגיאה בטעינת ארכיון המפגשים. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handlePatientFilterChange = (id: string) => {
    setSelectedPatientId(id);
    if (id) {
      setSearchParams({ patientId: id });
    } else {
      setSearchParams({});
    }
  };

  const handleOpenTranscript = (session: SessionRecord) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  const handleNotesUpdated = (sessionId: string, newNotes: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, therapistNotes: newNotes } : s)),
    );
    if (selectedSession && selectedSession.id === sessionId) {
      setSelectedSession((prev) => (prev ? { ...prev, therapistNotes: newNotes } : null));
    }
  };

  // Filter sessions by text search
  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.trim().toLowerCase();
    const pName = (s.patientName || '').toLowerCase();
    const cName = s.characterName.toLowerCase();
    const goals = s.goals.toLowerCase();
    const summary = s.aiSummary.toLowerCase();
    const notes = s.therapistNotes.toLowerCase();
    return (
      pName.includes(term) ||
      cName.includes(term) ||
      goals.includes(term) ||
      summary.includes(term) ||
      notes.includes(term)
    );
  });

  return (
    <div dir="rtl" className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-therapy-soft rounded-lg text-therapy-medium">
              <Archive className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ארכיון והיסטוריית מפגשים</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            צפייה בפרוטוקולים מלאים של מפגשים שהסתיימו, ניתוחים רגשיים של ה-AI והערות מטפל
          </p>
        </div>

        <Button
          as={Link}
          to="/sessions/new"
          variant="primary"
          icon={<PlayCircle className="w-4 h-4" />}
        >
          הגדרת מפגש חדש
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Patient Dropdown Filter */}
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-therapy-medium" />
            סינון לפי מטופל:
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => handlePatientFilterChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
          >
            <option value="">כל המטופלים</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName} (גיל {p.age})
              </option>
            ))}
          </select>
        </div>

        {/* Free Text Search */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            חיפוש חופשי בפרוטוקולים וסיכומים:
          </label>
          <Input
            placeholder="חיפוש לפי שם מטופל, דמות, יעדי מפגש, מילים בסיכום..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
          <RefreshCw className="w-8 h-8 text-therapy-medium animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-600">טוען את ארכיון המפגשים...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <Button size="sm" variant="secondary" onClick={fetchSessions}>
            נסה שוב
          </Button>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 p-8 space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <Archive className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              לא נמצאו מפגשים בארכיון
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery || selectedPatientId
                ? 'לא נמצאו מפגשים התואמים את הסינון שנבחר.'
                : 'טרם הושלמו מפגשים במערכת. לאחר קיום מפגש בחדר הבקרה, הפרוטוקול והניתוח יופיעו כאן.'}
            </p>
          </div>
          {(searchQuery || selectedPatientId) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                handlePatientFilterChange('');
              }}
            >
              איפוס סינונים
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSessions.map((session) => (
            <Card
              key={session.id}
              className="hover:shadow-md transition-shadow border-gray-200"
              padding="lg"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Right / Main Info */}
                <div className="space-y-3 flex-1">
                  {/* Top Meta Header */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-bold text-gray-900 text-sm">
                      <User className="w-4 h-4 text-therapy-medium" />
                      {session.patientName || session.patientId}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-medium border border-purple-200">
                      <Bot className="w-3.5 h-3.5" />
                      {session.characterName}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(session.date).toLocaleDateString('he-IL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {session.durationMinutes} דקות
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold mr-auto">
                      מפגש הושלם
                    </span>
                  </div>

                  {/* Session Goals */}
                  <div className="text-xs text-gray-700 flex items-start gap-1.5">
                    <Target className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                    <span className="font-semibold text-gray-800">יעדי המפגש:</span>
                    <span className="text-gray-600">{session.goals}</span>
                  </div>

                  {/* AI Summary Highlight Box */}
                  <div className="bg-gradient-to-r from-therapy-soft/50 to-purple-50/30 rounded-xl p-3 border border-purple-100 text-xs leading-relaxed text-gray-700 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-therapy-strong">
                      <Sparkles className="w-3.5 h-3.5 text-therapy-medium" />
                      <span>תמצית סיכום ה-AI:</span>
                    </div>
                    <p className="line-clamp-2 text-gray-700 pr-5">
                      {session.aiSummary}
                    </p>
                  </div>

                  {/* Therapist Notes Snippet (if available) */}
                  {session.therapistNotes && (
                    <div className="text-xs text-gray-600 flex items-start gap-1.5 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <FileText className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                      <span className="font-semibold text-gray-700">הערות מטפל:</span>
                      <p className="line-clamp-1 text-gray-600">
                        {session.therapistNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Left Action Button */}
                <div className="lg:self-center shrink-0 pt-2 lg:pt-0">
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Eye className="w-4 h-4" />}
                    onClick={() => handleOpenTranscript(session)}
                    className="w-full lg:w-auto"
                  >
                    פרוטוקול וסיכום מלא
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Transcript & Summary Modal */}
      <SessionTranscriptModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        session={selectedSession}
        onNotesUpdated={handleNotesUpdated}
      />
    </div>
  );
}
