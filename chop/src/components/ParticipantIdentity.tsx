import PersonAvatar from "@/components/PersonAvatar";
import {
  REMOVED_PARTICIPANT_AVATAR_SEED,
  REMOVED_PARTICIPANT_LABEL,
} from "@/lib/participant-avatar";
import { cn } from "@/lib/utils";
import type { Person } from "@/types";

interface ParticipantIdentityProps {
  person?: Pick<Person, "avatarSeed" | "name"> | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  nameClassName?: string;
  fallbackName?: string;
  fallbackSeed?: string;
}

export function ParticipantIdentity({
  person,
  size = "sm",
  className,
  nameClassName,
  fallbackName = REMOVED_PARTICIPANT_LABEL,
  fallbackSeed = REMOVED_PARTICIPANT_AVATAR_SEED,
}: ParticipantIdentityProps) {
  const name = person?.name ?? fallbackName;
  const seed = person?.avatarSeed ?? fallbackSeed;

  return (
    <span className={cn("flex min-w-0 items-center gap-2", className)}>
      <PersonAvatar name={name} seed={seed} size={size} />
      <span
        className={cn(
          "min-w-0 truncate font-medium text-foreground",
          nameClassName
        )}
      >
        {name}
      </span>
    </span>
  );
}
