import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { IconBin, IconPlus } from "@/components/icons/app-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAvatarSeedForChosenEmoji,
  PARTICIPANT_ANIMAL_EMOJIS,
} from "@/lib/participant-avatar";
import type { Person } from "@/types";
import { toast } from "sonner";

interface ParticipantOnboardingFormProps {
  people: Person[];
  onPeopleChange: (people: Person[]) => void;
  onCreateTrip: (people: Person[]) => void | Promise<void>;
  saving?: boolean;
}

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

function hasDuplicateName(people: Person[], personToConfirm: Person) {
  const normalizedName = personToConfirm.name.trim().toLowerCase();
  return people.some(
    (person) =>
      person.id !== personToConfirm.id &&
      person.name.trim().toLowerCase() === normalizedName,
  );
}

export function ParticipantOnboardingForm({
  people,
  onPeopleChange,
  onCreateTrip,
  saving = false,
}: ParticipantOnboardingFormProps) {
  const [confirmedParticipantIds, setConfirmedParticipantIds] = useState<
    Set<string>
  >(() => new Set());
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const previousPeopleCount = useRef(people.length);

  const confirmedPeople = people.filter((person) =>
    confirmedParticipantIds.has(person.id),
  );
  const hasUnconfirmedParticipant = people.some(
    (person) => !confirmedParticipantIds.has(person.id),
  );

  useEffect(() => {
    if (people.length > previousPeopleCount.current) {
      const frame = requestAnimationFrame(() => {
        inputRefs.current[people.length - 1]?.focus();
      });
      previousPeopleCount.current = people.length;
      return () => cancelAnimationFrame(frame);
    }
    previousPeopleCount.current = people.length;
  }, [people.length]);

  useEffect(() => {
    const personIds = new Set(people.map((person) => person.id));
    setConfirmedParticipantIds(
      (current) => new Set([...current].filter((id) => personIds.has(id))),
    );
  }, [people]);

  const updateName = (id: string, name: string) => {
    if (confirmedParticipantIds.has(id)) {
      setConfirmedParticipantIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }

    onPeopleChange(
      people.map((person) => (person.id === id ? { ...person, name } : person)),
    );
  };

  const handleDone = (person: Person) => {
    const name = person.name.trim();
    if (!name) {
      toast.error("Please enter a name");
      return;
    }
    if (hasDuplicateName(people, person)) {
      toast.error("This person already exists");
      return;
    }

    onPeopleChange(
      people.map((currentPerson) =>
        currentPerson.id === person.id
          ? { ...currentPerson, name }
          : currentPerson,
      ),
    );
    setConfirmedParticipantIds((current) => new Set(current).add(person.id));
    toast.success("Participant added!");
  };

  const handleAddAnotherParticipant = () => {
    if (hasUnconfirmedParticipant) return;
    onPeopleChange([...people, createParticipantDraft()]);
  };

  const handleRemoveParticipant = (id: string) => {
    setConfirmedParticipantIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });

    const remainingPeople = people.filter((person) => person.id !== id);
    onPeopleChange(
      remainingPeople.length > 0 ? remainingPeople : [createParticipantDraft()],
    );
  };

  const handleCreateTrip = () => {
    if (hasUnconfirmedParticipant) {
      toast.error("Tap Done to confirm each participant");
      return;
    }
    void onCreateTrip(confirmedPeople);
  };

  return (
    <div className="space-y-4">
      {people.map((person, index) => {
        const nameInputId = `onboarding-participant-${person.id}-name`;
        const isConfirmed = confirmedParticipantIds.has(person.id);
        const showDeleteAction =
          people.length > 1 && (isConfirmed || !person.name.trim());

        return (
          <section
            key={person.id}
            className="space-y-4 rounded-lg border border-border bg-card p-4"
            aria-labelledby={`onboarding-participant-${person.id}-title`}
          >
            <h2
              id={`onboarding-participant-${person.id}-title`}
              className="min-w-0 truncate text-base font-semibold text-foreground"
            >
              Participant {index + 1}
            </h2>

            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0 flex-1">
                <Label className="sr-only" htmlFor={nameInputId}>
                  Participant {index + 1} name
                </Label>
                <Input
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  id={nameInputId}
                  value={person.name}
                  onChange={(event) => updateName(person.id, event.target.value)}
                  placeholder="Name"
                  className="min-w-0 w-full bg-white"
                  autoComplete="off"
                  disabled={saving}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && person.name.trim()) {
                      event.preventDefault();
                      handleDone(person);
                    }
                  }}
                />
              </div>

              {showDeleteAction ? (
                <Button
                  type="button"
                  variant="deleteOutline"
                  className="h-12 shrink-0 px-4"
                  onClick={() => handleRemoveParticipant(person.id)}
                  aria-label={`Remove participant ${index + 1}`}
                  disabled={saving}
                >
                  <IconBin className="h-5 w-5" />
                  Delete
                </Button>
              ) : isConfirmed ? null : (
                <Button
                  type="button"
                  className="h-12 shrink-0 px-4"
                  onClick={() => handleDone(person)}
                  disabled={saving || !person.name.trim()}
                  aria-label={`Confirm participant ${index + 1}`}
                >
                  <Check className="h-4 w-4" />
                  Done
                </Button>
              )}
            </div>
          </section>
        );
      })}

      {confirmedPeople.length > 0 ? (
        <>
          <Button
            type="button"
            variant="secondary"
            className="h-12 w-full gap-2"
            onClick={handleAddAnotherParticipant}
            disabled={saving || hasUnconfirmedParticipant}
          >
            <IconPlus className="h-5 w-5 shrink-0" />
            Add another participant
          </Button>
          <div className="pt-8">
            <Button
              type="button"
              className="h-12 w-full"
              onClick={handleCreateTrip}
              disabled={saving || hasUnconfirmedParticipant}
            >
              {saving ? "Creating trip…" : "Create trip"}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
