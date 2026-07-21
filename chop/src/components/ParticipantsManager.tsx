import { useState } from "react";
import { IconBin, IconEdit, IconPlus } from "@/components/icons/app-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ConfirmBottomSheet } from "@/components/ConfirmBottomSheet";
import { Person } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createAvatarSeedForChosenEmoji, PARTICIPANT_ANIMAL_EMOJIS } from "@/lib/participant-avatar";
import PersonAvatar from "./PersonAvatar";

export function EmojiPickerSection({
  value,
  onChange,
  title = "Choose an emoji for this person",
}: {
  value: number;
  onChange: (index: number) => void;
  title?: string;
}) {
  return (
    <fieldset className="m-0 min-w-0 space-y-3 border-0 p-0">
      <legend className="block w-full text-base font-semibold leading-snug text-foreground">
        {title}
      </legend>
      <div className="grid grid-cols-5 gap-2">
        {PARTICIPANT_ANIMAL_EMOJIS.map((emoji, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={cn(
              "flex aspect-square w-full min-h-0 min-w-0 items-center justify-center rounded-md border p-0 text-4xl leading-none transition-colors sm:text-5xl",
              value === i
                ? "border-primary bg-primary/5"
                : "border-transparent bg-muted/50 hover:bg-muted"
            )}
            aria-pressed={value === i}
            aria-label={`${emoji} avatar`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

type ParticipantsMode = "onboarding" | "list";

interface ParticipantsManagerProps {
  people: Person[];
  onAddPerson: (person: Person) => void;
  onRemovePerson: (id: string) => void;
  /** Opens participant edit sheet (parent controls sheet). */
  onEditPerson?: (person: Person) => void;
  /** When false, do not show a success toast on each add (e.g. onboarding before saving) */
  notifyOnAdd?: boolean;
  /** Replaces the empty-state line when the list is empty */
  emptyStateText?: string;
  /** Shadcn button variant for the Add action (e.g. secondary on onboarding) */
  addButtonVariant?: "default" | "secondary";
  /**
   * - `onboarding`: name field + add button + list (first-run flow)
   * - `list`: roster only
   */
  mode?: ParticipantsMode;
}

function ParticipantRoster({
  people,
  onRemovePerson,
  onEditPerson,
  emptyStateText,
  showListHeading = true,
}: {
  people: Person[];
  onRemovePerson: (id: string) => void;
  onEditPerson?: (person: Person) => void;
  emptyStateText: string;
  showListHeading?: boolean;
}) {
  const [deleteTarget, setDeleteTarget] = useState<Person | null>(null);

  return (
    <div className="space-y-2">
      {showListHeading ? (
        <h2 className="text-base font-semibold text-foreground">
          People ({people.length})
        </h2>
      ) : null}
      <div className="grid grid-cols-1 gap-3">
        {people.map((person) => (
          <div
            key={person.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex min-w-0 items-center">
              <PersonAvatar name={person.name} seed={person.avatarSeed} />
              <span className="ml-3 min-w-0 flex-1 truncate font-medium text-foreground">
                {person.name}
              </span>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {onEditPerson ? (
                <Button
                  type="button"
                  onClick={() => onEditPerson(person)}
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                >
                  <IconEdit className="h-5 w-5 shrink-0" />
                  Edit
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={() => setDeleteTarget(person)}
                variant="deleteOutline"
                size="sm"
                className="gap-1.5"
              >
                <IconBin className="h-5 w-5 shrink-0" />
                Delete
              </Button>
            </div>
          </div>
        ))}
        {people.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            {emptyStateText}
          </div>
        )}
      </div>

      <ConfirmBottomSheet
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        visual="delete"
        title="Are you sure you want to delete this participant?"
        description={
          <>
            <span className="font-medium text-foreground">
              {deleteTarget?.name ?? "This participant"}
            </span>{" "}
            will be removed from this trip. Line items and splits that include
            them may be changed or removed, and group balances and totals can
            change. This can&apos;t be undone.
          </>
        }
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleteTarget) {
            await Promise.resolve(onRemovePerson(deleteTarget.id));
          }
        }}
      />
    </div>
  );
}

export default function ParticipantsManager({
  people,
  onAddPerson,
  onRemovePerson,
  onEditPerson,
  notifyOnAdd = true,
  emptyStateText = "No participants added yet. Add someone to get started!",
  addButtonVariant = "default",
  mode = "onboarding",
}: ParticipantsManagerProps) {
  const [newPersonName, setNewPersonName] = useState("");
  const [selectedEmojiIndex, setSelectedEmojiIndex] = useState(0);

  const handleAddPerson = () => {
    if (!newPersonName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (people.some((p) => p.name.toLowerCase() === newPersonName.trim().toLowerCase())) {
      toast.error("This person already exists");
      return;
    }
    onAddPerson({
      id: crypto.randomUUID(),
      name: newPersonName.trim(),
      avatarSeed: createAvatarSeedForChosenEmoji(selectedEmojiIndex),
    });
    setNewPersonName("");
    setSelectedEmojiIndex(0);
    if (notifyOnAdd) {
      toast.success("Person added!");
    }
  };

  if (mode === "list") {
    return (
      <ParticipantRoster
        people={people}
        onRemovePerson={onRemovePerson}
        onEditPerson={onEditPerson}
        emptyStateText={emptyStateText}
        showListHeading={false}
      />
    );
  }

  // onboarding: form + list
  return (
    <div className="space-y-6">
      <div className="flex w-full min-w-0 flex-col gap-6">
        <Input
          value={newPersonName}
          onChange={(e) => setNewPersonName(e.target.value)}
          placeholder="Enter name"
          className="min-w-0 w-full"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddPerson();
            }
          }}
        />
        <EmojiPickerSection
          value={selectedEmojiIndex}
          onChange={setSelectedEmojiIndex}
        />
        <Button
          type="button"
          variant={addButtonVariant}
          onClick={handleAddPerson}
          className="h-12 min-h-12 w-full gap-2 text-base font-medium"
        >
          <IconPlus className="h-5 w-5 shrink-0" />
          Add
        </Button>
      </div>

      {people.length > 0 ? (
        <ParticipantRoster
          people={people}
          onRemovePerson={onRemovePerson}
          onEditPerson={onEditPerson}
          emptyStateText={emptyStateText}
          showListHeading
        />
      ) : null}
    </div>
  );
}
