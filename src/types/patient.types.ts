// ─────────────────────────────────────────────────────────────────────────────
// OWNER: Team Lead  |  DO NOT EDIT without Team Lead approval
// API Contract: matches Team 2 (REST) backend schemas
// ─────────────────────────────────────────────────────────────────────────────

export interface TherapistProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export type AgeGroup = 'toddler' | 'preschool' | 'school-age' | 'teenager';

export interface Patient {
  id: string;
  therapistId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;         // ISO 8601 date string
  ageGroup: AgeGroup;
  diagnosis?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ageGroup: AgeGroup;
  diagnosis?: string;
  notes?: string;
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> {}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
