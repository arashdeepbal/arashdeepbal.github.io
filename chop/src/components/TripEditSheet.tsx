import { useEffect, useRef, useState } from "react";
import {
  FormSubpageBottomBar,
  FormSubpageHeader,
} from "@/components/form-subpage-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { updateEvent } from "@/services/database";
import { toast } from "sonner";

export interface TripEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  /** Current trip name from parent; resets the field when the sheet opens. */
  tripName: string;
  onSaved?: (name: string) => void;
}

export function TripEditSheet({
  open,
  onOpenChange,
  eventId,
  tripName,
  onSaved,
}: TripEditSheetProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName(tripName);
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open, tripName]);

  const handleClose = () => {
    if (!submitting) {
      onOpenChange(false);
    }
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Trip name cannot be empty");
      return;
    }
    setSubmitting(true);
    try {
      await updateEvent(eventId, trimmed);
      onSaved?.(trimmed);
      toast.success("Trip updated");
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save changes");
    } finally {
      setSubmitting(false);
    }
  };

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
          title="Edit trip details"
          onBack={handleClose}
          backDisabled={submitting}
          titleElement="h2"
        />

        <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-app flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="trip-edit-sheet-name">Trip name</Label>
              <Input
                ref={inputRef}
                id="trip-edit-sheet-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Trip name"
                className="min-w-0 w-full bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !submitting) {
                    e.preventDefault();
                    void handleSave();
                  }
                }}
              />
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
            className="flex-1"
            onClick={() => void handleSave()}
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Save changes"}
          </Button>
        </FormSubpageBottomBar>
      </SheetContent>
    </Sheet>
  );
}
