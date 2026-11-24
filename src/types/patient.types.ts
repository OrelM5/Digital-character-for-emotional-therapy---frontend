// ─────────────────────────────────────────────────────────────────────────────
// OWNER: Team Lead  |  DO NOT EDIT without Team Lead approval
// Contract 1 (LOCKED): Team 2 SpringBoot REST API — Auth, Therapists & Patients
// ─────────────────────────────────────────────────────────────────────────────

export interface Therapist {
  id: string;
  email: string;
  fullName: string;
  specialty?: string | null;
  licenseNumber?: string | null;
  therapeuticPreferences?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  licenseNumber: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  therapist: Therapist;
}

export interface UpdateTherapistProfileRequest {
  fullName?: string;
  specialty?: string;
  therapeuticPreferences?: string;
}

export interface PatientSummary {
  id: string;
  displayAlias: string;
  age: number;
  lastSessionDate: string | null;
}

export interface Patient {
  id: string;
  therapistId?: string;
  displayAlias: string;
  personalDetails: string;
  age: number;
  emotionalBackground: string;
  interestsAndSafeTopics: string;
  longTermGoals: string;
  therapistNotes: string;
  preferredCharacterIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type CreatePatientRequest = Omit<
  Patient,
  'id' | 'therapistId' | 'createdAt' | 'updatedAt'
>;

export type UpdatePatientRequest = Partial<CreatePatientRequest>;
