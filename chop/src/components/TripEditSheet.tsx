import { useEffect, useRef, useState } from "react";
import { FormBottomSheet } from "@/components/bottom-sheet-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateEvent } from "@/services/database";
import { toast } from "@/lib/app-toast";

interface TripEditSheetProps {
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
      toast.error("Trip name cannot be empty", { id: "trip-edit" });
      return;
    }
    setSubmitting(true);
    try {
      await updateEvent(eventId, trimmed);
      onSaved?.(trimmed);
      toast.success("Trip updated", { id: "trip-edit" });
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save changes", { id: "trip-edit" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Edit trip details"
      description="Change the name of this trip."
      submitting={submitting}
      bodyClassName="py-10"
      actions={
        <>
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
        </>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="trip-edit-sheet-name">Trip name</Label>
        <Input
          ref={inputRef}
          id="trip-edit-sheet-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Trip name"
          className="min-w-0 w-full bg-card"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !submitting) {
              e.preventDefault();
              void handleSave();
            }
          }}
        />
      </div>
    </FormBottomSheet>
  );
}
