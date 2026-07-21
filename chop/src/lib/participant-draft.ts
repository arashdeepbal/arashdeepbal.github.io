import {
  createAvatarSeedForChosenEmoji,
  PARTICIPANT_ANIMAL_EMOJIS,
} from "@/lib/participant-avatar";
import type { Person } from "@/types";

export function createParticipantDraft(): Person {
  const emojiIndex = Math.floor(
    Math.random() * PARTICIPANT_ANIMAL_EMOJIS.length,
  );

  return {
    id: crypto.randomUUID(),
    name: "",
    avatarSeed: createAvatarSeedForChosenEmoji(emojiIndex),
  };
}
