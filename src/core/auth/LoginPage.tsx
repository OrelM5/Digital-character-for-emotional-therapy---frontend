import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/core/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function LoginPage() {
  const navigate = useNavigate();
  const { loginWithMock, isLoading } = useAuthStore();

  const [email, setEmail] = useState('sarah.levi@therapy.org');
  const [password, setPassword] = useState('password123');

  // Regular form submission using the mock flow until Team 2 REST API is ready
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await loginWithMock(email);
    navigate('/patients', { replace: true });
  }

  // Dev bypass button: directly triggers mock login with default therapist credentials
  async function handleDevBypass() {
    await loginWithMock();
    navigate('/patients', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-therapy-soft via-brand-50 to-white flex items-center justify-center p-4">
      <Card padding="lg" className="w-full max-w-md shadow-xl border-gray-100">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-therapy-medium rounded-2xl p-3 mb-3 shadow-md">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Therapist Back-Office</h1>
          <p className="text-gray-500 mt-1 text-sm text-center">
            מערכת ניהול טיפולים רגשיים מבוססי דמויות 3D
          </p>
        </div>

        {/* Temporary Mock Flow Notification Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-800">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">מצב אימות פיתוח (Mock Auth)</p>
            <p className="text-blue-700 mt-0.5">
              האימות פועל כעת במצב Mock עם JWT מדומה עד לחיבור שרת SpringBoot של Team 2.
            </p>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="אימייל מטפל/ת"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            dir="ltr"
            placeholder="therapist@example.com"
          />
          <Input
            label="סיסמה"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            dir="ltr"
            placeholder="••••••••"
          />

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            icon={<LogIn className="w-4 h-4" />}
          >
            כניסה למערכת
          </Button>
        </form>

        {/* Prominent Dev Bypass Section */}
        <div className="mt-6 pt-5 border-t border-gray-100 space-y-2">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            loading={isLoading}
            onClick={handleDevBypass}
            icon={<Sparkles className="w-4 h-4 text-therapy-medium" />}
            className="border-dashed border-2 border-therapy-medium/40 hover:border-therapy-medium bg-therapy-soft/40 hover:bg-therapy-soft"
          >
            כניסה מהירה למפתחים (Dev Bypass / Mock Login)
          </Button>
          <p className="text-[11px] text-center text-gray-400">
            מייצר טוקן דמו (mock_jwt_token_12345) ללא אימות שרת
          </p>
        </div>
      </Card>
    </div>
  );
}
