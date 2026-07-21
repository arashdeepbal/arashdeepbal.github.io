import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { IconBin, IconPlus } from "@/components/icons/app-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { createParticipantDraft } from "@/lib/participant-draft";
import type { Person } from "@/types";
import { toast } from "@/lib/app-toast";
import { waitForMotion } from "@/lib/motion";

interface ParticipantOnboardingFormProps {
  people: Person[];
  onPeopleChange: (people: Person[]) => void;
  onCreateTrip: (people: Person[]) => void | Promise<void>;
  saving?: boolean;
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
  const [removingParticipantId, setRemovingParticipantId] = useState<string | null>(
    null,
  );
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
  };

  const handleAddAnotherParticipant = () => {
    if (hasUnconfirmedParticipant) return;
    onPeopleChange([...people, createParticipantDraft()]);
  };

  const handleRemoveParticipant = async (id: string) => {
    setRemovingParticipantId(id);
    await waitForMotion(200);
    setConfirmedParticipantIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });

    const remainingPeople = people.filter((person) => person.id !== id);
    onPeopleChange(
      remainingPeople.length > 0 ? remainingPeople : [createParticipantDraft()],
    );
    setRemovingParticipantId(null);
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
          <Card
            key={person.id}
            asChild
            className="motion-list-enter motion-removable space-y-4 p-4"
          >
            <section
              data-removing={removingParticipantId === person.id ? "true" : "false"}
              style={{ animationDelay: `${Math.min(index, 5) * 40}ms` }}
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
                  className="min-w-0 w-full bg-card"
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
                  onClick={() => void handleRemoveParticipant(person.id)}
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
          </Card>
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
              {saving ? "Saving participants…" : "Finish setup"}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
