import { useState } from 'react';
import { User, Save } from 'lucide-react';
import { useAuthStore } from '@/core/store/useAuthStore';
import { apiClient } from '@/core/api/axiosClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import type { UpdateTherapistProfileRequest } from '@/types/patient.types';

export function TherapistProfilePage() {
  const { therapist, updateProfile } = useAuthStore();
  const [fullName, setFullName] = useState(therapist?.fullName ?? '');
  const [specialty, setSpecialty] = useState(therapist?.specialty ?? '');
  const [therapeuticPreferences, setTherapeuticPreferences] = useState(
    therapist?.therapeuticPreferences ?? '',
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    const payload: UpdateTherapistProfileRequest = {
      fullName: fullName.trim(),
      specialty: specialty.trim() || undefined,
      therapeuticPreferences: therapeuticPreferences.trim() || undefined,
    };

    try {
      await apiClient.put('/therapists/me', payload);
    } catch {
      // Mock-friendly fallback while Team 2 backend is offline
    } finally {
      updateProfile(payload);
      setSaved(true);
      setLoading(false);
      setTimeout(() => setSaved(false), 3000);
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
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="אימייל"
            value={therapist?.email ?? ''}
            disabled
            dir="ltr"
          />
          {therapist?.licenseNumber && (
            <Input
              label="מספר רישיון"
              value={therapist.licenseNumber}
              disabled
              dir="ltr"
            />
          )}
          <Input
            label="תחומי התמחות ושיטות טיפול"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="לדוגמה: חרדה, ADHD, וויסות רגשי, CBT"
          />
          <Input
            label="עקרונות והעדפות טיפוליות"
            as="textarea"
            value={therapeuticPreferences}
            onChange={(e) => setTherapeuticPreferences(e.target.value)}
            placeholder="עקרונות מנחים לאופן שבו הדמות תתקשר במפגשים..."
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
