import { useEffect, useRef, useState } from "react";
import { IconPlus } from "@/components/icons/app-icons";
import {
  FormSubpageBottomBar,
  FormSubpageHeader,
} from "@/components/form-subpage-layout";
import { EmojiPickerSection } from "@/components/ParticipantsManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  createAvatarSeedForChosenEmoji,
  getEmojiIndexForAvatarSeed,
} from "@/lib/participant-avatar";
import type { Person } from "@/types";
import { toast } from "sonner";

export interface ParticipantFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: "add" | "edit";
  people: Person[];
  personToEdit?: Person | null;
  /** Required when `variant` is `add`. */
  onAddPerson?: (person: Person) => void | Promise<void>;
  /** Required when `variant` is `edit`. */
  onUpdatePerson?: (person: Person) => void | Promise<void>;
  /** Success toast after add (trip flow). */
  notifyOnAdd?: boolean;
  addButtonVariant?: "default" | "secondary";
}

export function ParticipantFormSheet({
  open,
  onOpenChange,
  variant,
  people,
  personToEdit,
  onAddPerson,
  onUpdatePerson,
  notifyOnAdd = true,
  addButtonVariant = "default",
}: ParticipantFormSheetProps) {
  const [name, setName] = useState("");
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && variant === "edit" && !personToEdit) {
      onOpenChange(false);
    }
  }, [open, variant, personToEdit, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    if (variant === "edit" && personToEdit) {
      setName(personToEdit.name);
      setEmojiIndex(getEmojiIndexForAvatarSeed(personToEdit.avatarSeed));
    } else if (variant === "add") {
      setName("");
      setEmojiIndex(0);
    }
    const id = requestAnimationFrame(() => nameInputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open, variant, personToEdit]);

  const handleClose = () => {
    if (!submitting) {
      onOpenChange(false);
    }
  };

  const runSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a name");
      return;
    }
    if (variant === "add") {
      if (!onAddPerson) return;
      if (people.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
        toast.error("This person already exists");
        return;
      }
      setSubmitting(true);
      try {
        await onAddPerson({
          id: crypto.randomUUID(),
          name: trimmed,
          avatarSeed: createAvatarSeedForChosenEmoji(emojiIndex),
        });
        if (notifyOnAdd) {
          toast.success("Person added!");
        }
        onOpenChange(false);
      } catch {
        // Parent may toast
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!personToEdit || !onUpdatePerson) return;
    if (
      people.some(
        (p) =>
          p.id !== personToEdit.id && p.name.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      toast.error("This person already exists");
      return;
    }
    const originalIdx = getEmojiIndexForAvatarSeed(personToEdit.avatarSeed);
    const avatarSeed =
      emojiIndex === originalIdx
        ? personToEdit.avatarSeed
        : createAvatarSeedForChosenEmoji(emojiIndex);
    setSubmitting(true);
    try {
      await onUpdatePerson({ ...personToEdit, name: trimmed, avatarSeed });
      onOpenChange(false);
    } catch {
      // Parent shows error toast
    } finally {
      setSubmitting(false);
    }
  };

  const title =
    variant === "add" ? "Add a participant" : "Edit participant";
  const primaryLabel =
    variant === "add"
      ? submitting
        ? "Adding…"
        : "Add participant"
      : submitting
        ? "Saving…"
        : "Save changes";

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next && !submitting) {
          onOpenChange(false);
        }
      }}
    >
      <SheetContent
        side="bottom"
        hideClose
        className="flex max-h-[min(96dvh,900px)] flex-col gap-0 rounded-t-2xl border-border p-0"
        onPointerDownOutside={(e) => {
          if (submitting) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (submitting) e.preventDefault();
        }}
      >
        <FormSubpageHeader
          variant="title-close"
          title={title}
          onBack={handleClose}
          backDisabled={submitting}
          titleElement="h2"
        />

        <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-app flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6">
            <div className="space-y-10">
              <div className="space-y-2">
                <Label htmlFor="participant-form-sheet-name">Name</Label>
                <Input
                  ref={nameInputRef}
                  id="participant-form-sheet-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  className="min-w-0 w-full bg-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !submitting) {
                      e.preventDefault();
                      void runSubmit();
                    }
                  }}
                />
              </div>
              <EmojiPickerSection value={emojiIndex} onChange={setEmojiIndex} />
            </div>
          </div>
        </div>

        <FormSubpageBottomBar>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={addButtonVariant}
            className="flex-1 gap-2"
            onClick={() => void runSubmit()}
            disabled={submitting}
          >
            {variant === "add" && !submitting ? (
              <IconPlus className="h-5 w-5 shrink-0" />
            ) : null}
            {primaryLabel}
          </Button>
        </FormSubpageBottomBar>
      </SheetContent>
    </Sheet>
  );
}
