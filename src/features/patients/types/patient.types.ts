export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  emotionalBackground: string;
  interests: string[];
  longTermGoals: string;
  ongoingNotes: string;
  createdAt: string;
}

export type CreatePatientInput = Omit<Patient, 'id' | 'createdAt'>;

export type UpdatePatientInput = Partial<CreatePatientInput>;
