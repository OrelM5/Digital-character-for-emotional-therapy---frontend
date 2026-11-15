import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TherapistProfile } from '@/types/patient.types';

// ── Mock Defaults ──────────────────────────────────────────────────────────
export const MOCK_JWT_TOKEN = 'mock_jwt_token_12345';

export const MOCK_THERAPIST: TherapistProfile = {
  id: 'therapist-mock-001',
  name: 'ד״ר שרה לוי',
  email: 'sarah.levi@therapy.org',
  createdAt: '2026-01-01T08:00:00Z',
};

// ── Types ─────────────────────────────────────────────────────────────────
export interface AuthState {
  token: string | null;
  therapist: TherapistProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (token: string, therapist: TherapistProfile) => void;
  loginWithMock: (email?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (partial: Partial<TherapistProfile>) => void;
}

// ── Store ──────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      therapist: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (token, therapist) =>
        set({ token, therapist, isAuthenticated: true, isLoading: false }),

      /**
       * Mock Authentication Flow:
       * Simulates a 1-second network delay, then sets a standard fake JWT
       * and therapist profile so the frontend team can work unblocked.
       */
      loginWithMock: async (email?: string) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockProfile: TherapistProfile = {
          ...MOCK_THERAPIST,
          ...(email ? { email } : {}),
        };

        set({
          token: MOCK_JWT_TOKEN,
          therapist: mockProfile,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () =>
        set({
          token: null,
          therapist: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      updateProfile: (partial) =>
        set((state) => ({
          therapist: state.therapist ? { ...state.therapist, ...partial } : null,
        })),
    }),
    {
      name: 'therapist-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist token, therapist, and auth status
      partialize: (state) => ({
        token: state.token,
        therapist: state.therapist,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
