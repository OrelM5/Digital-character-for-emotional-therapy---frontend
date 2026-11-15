import { useState } from 'react';
import { User, Save } from 'lucide-react';
import { useAuthStore } from '@/core/store/useAuthStore';
import { apiClient } from '@/core/api/axiosClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function TherapistProfilePage() {
  const { therapist, updateProfile } = useAuthStore();
  const [name, setName] = useState(therapist?.name ?? '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await apiClient.patch('/therapist/profile', { name });
      updateProfile({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-therapy-medium" />
        <h1 className="text-2xl font-bold text-gray-900">הפרופיל שלי</h1>
      </div>

      <Card>
        <div className="space-y-4">
          <Input
            label="שם מלא"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="אימייל"
            value={therapist?.email ?? ''}
            disabled
            dir="ltr"
          />
          <Button
            onClick={handleSave}
            loading={loading}
            icon={<Save className="w-4 h-4" />}
          >
            {saved ? 'נשמר! ✓' : 'שמור שינויים'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
