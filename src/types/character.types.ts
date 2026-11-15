// ─────────────────────────────────────────────────────────────────────────────
// OWNER: Team Lead  |  DO NOT EDIT without Team Lead approval
// API Contract: matches Team 2 (REST) backend schemas
// ─────────────────────────────────────────────────────────────────────────────

export type CharacterPersonality =
  | 'gentle'
  | 'playful'
  | 'encouraging'
  | 'calm'
  | 'energetic';

export type CharacterGender = 'male' | 'female' | 'neutral';

export interface Character {
  id: string;
  name: string;
  gender: CharacterGender;
  personality: CharacterPersonality;
  description: string;
  avatarUrl: string;
  modelUrl: string;            // 3D model asset URL
  isActive: boolean;
}

export type CharacterEmotion =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'excited'
  | 'curious'
  | 'calm'
  | 'concerned';

export interface CharacterAnimationCommand {
  emotion: CharacterEmotion;
  intensity: number;           // 0-1
  durationMs?: number;
}
