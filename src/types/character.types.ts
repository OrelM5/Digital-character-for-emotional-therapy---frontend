// ─────────────────────────────────────────────────────────────────────────────
// OWNER: Team Lead  |  DO NOT EDIT without Team Lead approval
// Contract 1 (LOCKED): Team 2 REST API — Characters & Animations
// ─────────────────────────────────────────────────────────────────────────────

export interface AnimationTrigger {
  animationTriggerId: string;
  displayName: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  unityModelAssetId: string;
  avatarUrl: string | null;
  availableAnimations: AnimationTrigger[];
}
