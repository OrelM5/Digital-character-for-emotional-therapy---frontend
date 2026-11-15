import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/core/store/useAuthStore';
import { MainLayout } from '@/components/layout/MainLayout';

// Auth
import { LoginPage } from '@/core/auth/LoginPage';
import { TherapistProfilePage } from '@/core/auth/TherapistProfilePage';

// Features (Shalev)
import { PatientsListPage } from '@/features/patients/PatientsListPage';
import { PatientCardPage } from '@/features/patients/PatientCardPage';
import { NewSessionSetupPage } from '@/features/sessions/NewSessionSetupPage';
import { SessionArchivePage } from '@/features/history/SessionArchivePage';

// Live Session (Yishai)
import { LiveControlRoomPage } from '@/live-session/LiveControlRoomPage';

// ── Private Route Guard & Layout Wrapper ─────────────────────────────────
function ProtectedLayout() {
  const { isAuthenticated, therapist, logout } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout therapistName={therapist?.name} onLogout={logout} />;
}

// ── Router ─────────────────────────────────────────────────────────────────
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected – wrapped in MainLayout */}
        <Route element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/patients" replace />} />
          <Route path="/patients" element={<PatientsListPage />} />
          <Route path="/patients/:patientId" element={<PatientCardPage />} />
          <Route path="/sessions/new" element={<NewSessionSetupPage />} />
          <Route path="/sessions/:sessionId/live" element={<LiveControlRoomPage />} />
          <Route path="/history" element={<SessionArchivePage />} />
          <Route path="/profile" element={<TherapistProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

