import { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getParticipantAnimalEmoji } from "@/lib/participant-avatar";

interface PersonAvatarProps {
  name: string;
  /** Must be `Person.avatarSeed` (persisted per trip). Do not use display name or a different id. */
  seed: string;
  size?: "sm" | "md" | "lg";
}

export default function PersonAvatar({ name, seed, size = "md" }: PersonAvatarProps) {
  const emoji = useMemo(() => getParticipantAnimalEmoji(seed), [seed]);

  const sizeClasses = {
    sm: "h-9 w-9 min-h-9 min-w-9 text-xl leading-none",
    md: "h-11 w-11 min-h-11 min-w-11 text-2xl leading-none",
    lg: "h-14 w-14 min-h-14 min-w-14 text-3xl leading-none",
  };

  return (
    <Avatar
      className={`${sizeClasses[size]} shrink-0 rounded-none bg-transparent`}
    >
      <AvatarFallback
        className="rounded-none bg-transparent font-normal text-foreground"
        title={name}
      >
        {emoji}
      </AvatarFallback>
    </Avatar>
  );
}
