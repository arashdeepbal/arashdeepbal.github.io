/**
 * Avatars for participants: one animal emoji + background tint per person, derived
 * from `avatar_seed` stored for that participant. Same seed → same emoji everywhere in the app.
 *
 * The seed is the source of truth (set once when the person is added to a trip) — never derive from name or a different id.
 *
 * - **V2** (`"{emojiIndex}|{styleKey}"`): chosen emoji + separate key for background tint (styleKey is usually a UUID).
 * - **V1** (any other string, e.g. a bare UUID): emoji and style both derived from the full string hash (backwards compatible).
 */

/** Real / cartoon animal faces & creatures only (no objects, no fantasy creatures like unicorns). */
export const PARTICIPANT_ANIMAL_EMOJIS = [
  "🐼",
  "🐻",
  "🐨",
  "🐯",
  "🦊",
  "🐰",
  "🐱",
  "🐶",
  "🦁",
  "🐻‍❄️",
  "🐸",
  "🐙",
  "🦉",
  "🐧",
  "🦆",
  "🐢",
  "🦎",
  "🐍",
  "🦦",
  "🦫",
] as const;

const STYLE_COUNT = 8;

/**
 * 32-bit FNV-1a: stable, better spread than char-sum for UUID seeds.
 */
function stableIndex(seed: string, mod: number): number {
  if (mod <= 0) return 0;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Force unsigned, then mod
  return (h >>> 0) % mod;
}

const V2_SEED = /^(\d+)\|(.+)$/;

function parseV2AvatarSeed(avatarSeed: string): { emojiIndex: number; styleKey: string } | null {
  const m = V2_SEED.exec(avatarSeed);
  if (!m) {
    return null;
  }
  const styleKey = m[2]!;
  const parsed = parseInt(m[1]!, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  const n = PARTICIPANT_ANIMAL_EMOJIS.length;
  const emojiIndex =
    parsed < n ? Math.floor(parsed) : stableIndex(styleKey, n);
  return { emojiIndex, styleKey };
}

/** New participant: chosen emoji index + unique style key (e.g. UUID) so two people can share an emoji with different tints. */
export function createAvatarSeedForChosenEmoji(emojiIndex: number): string {
  const n = PARTICIPANT_ANIMAL_EMOJIS.length;
  const i =
    Number.isFinite(emojiIndex) && emojiIndex >= 0 && emojiIndex < n
      ? Math.floor(emojiIndex)
      : 0;
  return `${i}|${crypto.randomUUID()}`;
}

/** Picker index for a stored seed (V2 index, or V1 hash — matches `getParticipantAnimalEmoji` / `stableIndex`). */
export function getEmojiIndexForAvatarSeed(avatarSeed: string): number {
  if (!avatarSeed?.trim()) {
    return 0;
  }
  const v2 = parseV2AvatarSeed(avatarSeed);
  if (v2) {
    return v2.emojiIndex;
  }
  return stableIndex(avatarSeed, PARTICIPANT_ANIMAL_EMOJIS.length);
}

/** Animal emoji for this participant, always the same for a given `avatar_seed`. */
export function getParticipantAnimalEmoji(avatarSeed: string): (typeof PARTICIPANT_ANIMAL_EMOJIS)[number] {
  if (!avatarSeed?.trim()) {
    return PARTICIPANT_ANIMAL_EMOJIS[0];
  }
  const v2 = parseV2AvatarSeed(avatarSeed);
  if (v2) {
    return PARTICIPANT_ANIMAL_EMOJIS[v2.emojiIndex]!;
  }
  const i = stableIndex(avatarSeed, PARTICIPANT_ANIMAL_EMOJIS.length);
  return PARTICIPANT_ANIMAL_EMOJIS[i]!;
}

/** Index 0..STYLE_COUNT-1 for background / ring styling (separate from emoji for visual variety). */
export function getParticipantStyleIndex(avatarSeed: string): number {
  if (!avatarSeed?.trim()) {
    return 0;
  }
  const v2 = parseV2AvatarSeed(avatarSeed);
  if (v2) {
    return stableIndex(v2.styleKey, STYLE_COUNT);
  }
  return stableIndex(avatarSeed, STYLE_COUNT);
}
