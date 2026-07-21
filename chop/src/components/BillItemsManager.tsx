import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { IconPlus } from "@/components/icons/app-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BillItem, Person, SplitMode, PersonSplit } from "@/types";
import { getCurrencyByValue } from "@/lib/currencies";
import {
  formatAmount,
  formatAmountInput,
  getCurrencyFractionDigits,
  normalizeAmountInput,
  parseAmountInput,
} from "@/lib/format-amount";
import {
  amountsEqually,
  amountsFromPercents,
  equalSplitPercents,
} from "@/lib/split-total-by-percents";
import { CurrencyBottomSheet, PersonBottomSheet } from "@/components/form-bottom-sheets";
import { toast } from "@/lib/app-toast";
import {
  readLastSplitMode,
  rememberLastSplitMode,
} from "@/lib/bill-form-preferences";
import { cn } from "@/lib/utils";
import PersonAvatar from "./PersonAvatar";
import { FeedbackIcon } from "@/components/FeedbackIcon";
import { useTransientFeedback } from "@/hooks/use-transient-feedback";
import {
  FloatingActionButton,
  TripFloatingActionBar,
} from "@/components/trip-floating-action-bar";

interface BillItemsManagerProps {
  billItems: BillItem[];
  people: Person[];
  tripId: string;
  activeCurrency: string;
  onAddItem: (item: BillItem) => Promise<void>;
  editingItem?: BillItem | null;
  onUpdateItem?: (item: BillItem) => Promise<void>;
  onCancelEdit?: () => void;
}

const BOTTOM_NAV_HEIGHT_PX = 56;
const BILL_ACTION_NAV_GAP_PX = 16;
const INLINE_ACTION_VISIBLE_RATIO = 0.75;

function useInlineBillActionsVisibility(
  actionRef: React.RefObject<HTMLDivElement>,
) {
  const [isInlineVisible, setIsInlineVisible] = useState(false);

  useLayoutEffect(() => {
    const action = actionRef.current;
    if (!action) return;

    let observer: IntersectionObserver | null = null;

    const getBottomObstruction = () => {
      const safeAreaBottom = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--safe-area-bottom",
        ),
      );

      return (
        BOTTOM_NAV_HEIGHT_PX +
        BILL_ACTION_NAV_GAP_PX +
        (Number.isFinite(safeAreaBottom) ? safeAreaBottom : 0)
      );
    };

    const updateVisibility = () => {
      const rect = action.getBoundingClientRect();
      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportBottom =
        viewportTop + (viewport?.height ?? window.innerHeight) - getBottomObstruction();
      const visibleHeight = Math.max(
        0,
        Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, viewportTop),
      );

      setIsInlineVisible(
        rect.height > 0 && visibleHeight / rect.height >= INLINE_ACTION_VISIBLE_RATIO,
      );
    };

    const observe = () => {
      observer?.disconnect();
      updateVisibility();

      if (!("IntersectionObserver" in window)) return;

      observer = new IntersectionObserver(updateVisibility, {
        rootMargin: `0px 0px -${getBottomObstruction()}px 0px`,
        threshold: [0, INLINE_ACTION_VISIBLE_RATIO, 1],
      });
      observer.observe(action);
    };

    observe();
    window.addEventListener("resize", observe);
    window.visualViewport?.addEventListener("resize", observe);
    window.visualViewport?.addEventListener("scroll", updateVisibility);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", observe);
      window.visualViewport?.removeEventListener("resize", observe);
      window.visualViewport?.removeEventListener("scroll", updateVisibility);
    };
  }, [actionRef]);

  return isInlineVisible;
}

export default function BillItemsManager({
  billItems,
  people,
  tripId,
  activeCurrency,
  onAddItem,
  editingItem = null,
  onUpdateItem,
  onCancelEdit,
}: BillItemsManagerProps) {
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [newItemPaidBy, setNewItemPaidBy] = useState<string | null>(null);
  const [newItemSharedWith, setNewItemSharedWith] = useState<string[]>([]);
  const [newItemCurrency, setNewItemCurrency] = useState(activeCurrency);
  const [splitMode, setSplitMode] = useState<SplitMode>(() =>
    readLastSplitMode(tripId),
  );
  const [personAmounts, setPersonAmounts] = useState<Record<string, string>>({});
  const [personPercents, setPersonPercents] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const saveFeedback = useTransientFeedback(1200);
  const lastPercentageSharedKeyRef = useRef<string>("");
  const previousEditingItemIdRef = useRef<string | null>(null);
  const skipNextSharedAmountPruneRef = useRef(false);
  const inlineActionsRef = useRef<HTMLDivElement>(null);
  const inlineActionsVisible = useInlineBillActionsVisibility(inlineActionsRef);

  const usedCurrencyValues = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    for (const item of billItems) {
      if (!seen.has(item.currency)) {
        seen.add(item.currency);
        order.push(item.currency);
      }
    }
    return order;
  }, [billItems]);

  useEffect(() => {
    if (!editingItem && previousEditingItemIdRef.current === null) {
      setSplitMode(readLastSplitMode(tripId));
    }
  }, [editingItem, tripId]);

  useEffect(() => {
    // Reset custom split values when people change.
    setPersonAmounts({});
    setPersonPercents({});
    lastPercentageSharedKeyRef.current = "";
  }, [people]);

  useEffect(() => {
    const currentPersonIds = new Set(people.map((person) => person.id));
    if (editingItem) {
      // This effect and the shared-participant pruning effect both run on the
      // editor's first mount. Preserve the stored custom amounts during that
      // initial pass; the following sharedWith update will safely prune them.
      skipNextSharedAmountPruneRef.current = true;
      setNewItemDescription(editingItem.description);
      setNewItemAmount(formatAmountInput(String(editingItem.amount)));
      setNewItemCurrency(editingItem.currency);
      setNewItemPaidBy(
        editingItem.paidBy && currentPersonIds.has(editingItem.paidBy)
          ? editingItem.paidBy
          : null,
      );
      setNewItemSharedWith(
        editingItem.sharedWith.filter((personId) => currentPersonIds.has(personId)),
      );
      if (editingItem.personSplits?.length) {
        setSplitMode("amount");
        setPersonAmounts(
          Object.fromEntries(
            editingItem.personSplits.map((split) => [
              split.personId,
              formatAmountInput(String(split.amount)),
            ]),
          ),
        );
      } else {
        setSplitMode("equal");
        setPersonAmounts({});
      }
      setPersonPercents({});
      previousEditingItemIdRef.current = editingItem.id;
      return;
    }

    if (previousEditingItemIdRef.current) {
      setNewItemDescription("");
      setNewItemAmount("");
      setSplitMode(readLastSplitMode(tripId));
      setPersonAmounts({});
      setPersonPercents({});
      previousEditingItemIdRef.current = null;
    }

    // Restore the last added bill's currency and participant selection.
    if (billItems.length > 0) {
      const lastBillItem = billItems[billItems.length - 1];
      setNewItemCurrency(lastBillItem.currency);
      setNewItemPaidBy(
        lastBillItem.paidBy && currentPersonIds.has(lastBillItem.paidBy)
          ? lastBillItem.paidBy
          : null,
      );
      setNewItemSharedWith(
        lastBillItem.sharedWith.filter((personId) => currentPersonIds.has(personId))
      );
    } else {
      setNewItemCurrency(activeCurrency);
      setNewItemPaidBy(null);
      setNewItemSharedWith([]);
    }
  }, [billItems, activeCurrency, editingItem, people, tripId]);

  useEffect(() => {
    // Reset amounts when shared participants change
    if (skipNextSharedAmountPruneRef.current) {
      skipNextSharedAmountPruneRef.current = false;
      return;
    }
    setPersonAmounts((currentAmounts) => {
      const nextAmounts: Record<string, string> = {};
      newItemSharedWith.forEach((personId) => {
        nextAmounts[personId] = currentAmounts[personId] || "";
      });
      return nextAmounts;
    });
  }, [newItemSharedWith]);

  useEffect(() => {
    if (splitMode !== "percentage") {
      lastPercentageSharedKeyRef.current = "";
      return;
    }
    if (newItemSharedWith.length === 0) {
      setPersonPercents({});
      lastPercentageSharedKeyRef.current = "";
      return;
    }
    const key = [...newItemSharedWith].sort().join("|");
    if (key !== lastPercentageSharedKeyRef.current) {
      lastPercentageSharedKeyRef.current = key;
      const parts = equalSplitPercents(newItemSharedWith.length);
      const next: Record<string, string> = {};
      newItemSharedWith.forEach((id, i) => {
        next[id] = parts[i]!.toFixed(2);
      });
      setPersonPercents(next);
    }
  }, [newItemSharedWith, splitMode]);

  const validateSplit = (): boolean => {
    const totalAmount = parseAmountInput(newItemAmount);
    
    if (splitMode === "amount") {
      const totalAssigned = newItemSharedWith.reduce((sum, personId) => {
        const amount = parseAmountInput(personAmounts[personId] || "0");
        return sum + amount;
      }, 0);
      
      if (Math.abs(totalAssigned - totalAmount) > 0.01) {
        toast.error(
          `Amounts must sum to ${getCurrencyByValue(newItemCurrency)?.symbol ?? newItemCurrency} ${formatAmount(totalAmount)}`
        );
        return false;
      }
    }

    if (splitMode === "percentage") {
      for (const personId of newItemSharedWith) {
        const p = parseFloat(personPercents[personId] || "0");
        if (!Number.isFinite(p) || p < 0) {
          toast.error("Each percentage must be zero or greater");
          return false;
        }
      }
      const totalPct = newItemSharedWith.reduce(
        (sum, personId) => sum + parseFloat(personPercents[personId] || "0"),
        0
      );
      if (Math.abs(totalPct - 100) > 0.02) {
        toast.error("Percentages must add up to 100%");
        return false;
      }
    }

    return true;
  };

  const handleSaveItem = async () => {
    if (submitting) return;
    if (!newItemDescription.trim()) {
      toast.error("Please enter an item description");
      return;
    }
    if (!newItemAmount || parseAmountInput(newItemAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!newItemPaidBy) {
      toast.error("Please select who paid for this item");
      return;
    }
    if (newItemSharedWith.length === 0) {
      toast.error("Please select at least one person who shares this item");
      return;
    }

    if (splitMode !== "equal" && !validateSplit()) {
      return;
    }

    // Generate person splits based on split mode
    let personSplits: PersonSplit[] = [];
    const totalAmount = parseAmountInput(newItemAmount);
    const fractionDigits = getCurrencyFractionDigits(newItemCurrency);

    if (splitMode === "equal") {
      personSplits = amountsEqually(
        totalAmount,
        newItemSharedWith,
        fractionDigits,
      );
    } else if (splitMode === "percentage") {
      personSplits = amountsFromPercents(
        totalAmount,
        newItemSharedWith.map((personId) => ({
          personId,
          percent: parseFloat(personPercents[personId] || "0"),
        })),
        fractionDigits,
      );
    } else {
      personSplits = newItemSharedWith.map((personId) => ({
        personId,
        amount: parseAmountInput(personAmounts[personId] || "0"),
      }));
    }

    const item: BillItem = {
      id: editingItem?.id ?? crypto.randomUUID(),
      description: newItemDescription.trim(),
      amount: parseAmountInput(newItemAmount),
      paidBy: newItemPaidBy,
      sharedWith: newItemSharedWith,
      currency: newItemCurrency,
      date: editingItem?.date ?? new Date().toISOString(),
      personSplits,
    };

    setSubmitting(true);
    try {
      if (editingItem && onUpdateItem) {
        await onUpdateItem(item);
      } else {
        await onAddItem(item);
      }
      setNewItemDescription("");
      setNewItemAmount("");
      setNewItemCurrency(activeCurrency);
      setPersonAmounts({});
      if (splitMode === "percentage" && newItemSharedWith.length > 0) {
        const parts = equalSplitPercents(newItemSharedWith.length);
        setPersonPercents(
          Object.fromEntries(
            newItemSharedWith.map((personId, index) => [
              personId,
              parts[index]!.toFixed(2),
            ]),
          ),
        );
        lastPercentageSharedKeyRef.current = [...newItemSharedWith]
          .sort()
          .join("|");
      } else {
        setPersonPercents({});
        lastPercentageSharedKeyRef.current = "";
      }
      if (!editingItem) {
        saveFeedback.trigger();
        toast.success("Item added to the bill!", { id: "bill-save" });
      }
    } catch {
      // The parent reports the save error; keep the form intact for retry.
    } finally {
      setSubmitting(false);
    }
  };

  const togglePersonInSharedWith = (personId: string) => {
    if (newItemSharedWith.includes(personId)) {
      setNewItemSharedWith(prev => prev.filter(id => id !== personId));
    } else {
      setNewItemSharedWith(prev => [...prev, personId]);
    }
  };

  const selectAllPeople = () => {
    setNewItemSharedWith(people.map((person) => person.id));
  };

  const clearSharedWith = () => {
    setNewItemSharedWith([]);
  };

  const allPeopleShared =
    people.length > 0 && newItemSharedWith.length === people.length;
  /** Checked only when everyone is selected (no indeterminate state). */
  const selectAllChecked = allPeopleShared;

  const handlePersonAmountChange = (personId: string, value: string) => {
    const normalized = normalizeAmountInput(value);
    if (normalized == null) return;
    setPersonAmounts(prev => ({
      ...prev,
      [personId]: normalized
    }));
  };

  const handlePersonAmountBlur = (personId: string) => {
    setPersonAmounts((prev) => ({
      ...prev,
      [personId]: formatAmountInput(prev[personId] || ""),
    }));
  };

  const handlePersonPercentChange = (personId: string, value: string) => {
    setPersonPercents((prev) => ({
      ...prev,
      [personId]: value,
    }));
  };

  const renderBillActions = (
    presentation: "inline" | "floating",
    interactive: boolean,
  ) => {
    const ActionButton = presentation === "floating" ? FloatingActionButton : Button;
    const inlineButtonClassName =
      presentation === "inline" ? "h-12 min-h-12 text-base font-medium" : undefined;
    const inactiveClassName = interactive ? undefined : "pointer-events-none";

    if (editingItem && onCancelEdit) {
      return (
        <div
          className={cn(
            "flex w-full gap-2",
            presentation === "floating" && "max-w-sm",
          )}
        >
          <ActionButton
            type="button"
            variant="outline"
            className={cn("flex-1", inlineButtonClassName, inactiveClassName)}
            onClick={onCancelEdit}
            disabled={submitting}
            tabIndex={interactive ? 0 : -1}
          >
            Cancel
          </ActionButton>
          <ActionButton
            type="button"
            onClick={() => void handleSaveItem()}
            disabled={people.length === 0 || submitting}
            className={cn("flex-1", inlineButtonClassName, inactiveClassName)}
            tabIndex={interactive ? 0 : -1}
          >
            {submitting ? "Saving…" : "Save changes"}
          </ActionButton>
        </div>
      );
    }

    return (
      <ActionButton
        type="button"
        onClick={() => void handleSaveItem()}
        disabled={people.length === 0 || submitting || saveFeedback.active}
        className={cn(
          presentation === "inline" && "w-full",
          inlineButtonClassName,
          inactiveClassName,
        )}
        tabIndex={interactive ? 0 : -1}
      >
        <FeedbackIcon active={saveFeedback.active}>
          <IconPlus className="h-5 w-5" />
        </FeedbackIcon>
        {submitting
          ? "Adding…"
          : saveFeedback.active
            ? "Added"
            : editingItem
              ? "Save changes"
              : "Add bill"}
      </ActionButton>
    );
  };

  return (
    <div className="space-y-4">
          <div
            key={saveFeedback.sequence}
            className={cn(
              "grid grid-cols-1 gap-4",
              saveFeedback.sequence > 0 && "bill-form-reset",
            )}
          >
            {/* Description row - full width */}
            <div className="space-y-2.5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newItemDescription}
                onChange={e => setNewItemDescription(e.target.value)}
                placeholder="e.g., Pizza"
              />
            </div>

            {/* Amount — own row, then currency on the next line */}
            <div className="space-y-2.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                value={newItemAmount}
                onChange={(e) => {
                  const normalized = normalizeAmountInput(e.target.value);
                  if (normalized != null) setNewItemAmount(normalized);
                }}
                onBlur={() => setNewItemAmount(formatAmountInput(newItemAmount))}
                placeholder="0.00"
              />
            </div>

            <CurrencyBottomSheet
              id="currency"
              value={newItemCurrency}
              onValueChange={setNewItemCurrency}
              label="Currency"
              usedCurrencyValues={usedCurrencyValues}
            />

            <PersonBottomSheet
              id="paidBy"
              value={newItemPaidBy}
              onValueChange={setNewItemPaidBy}
              people={people}
              label="Paid by"
              placeholder="Select who paid"
            />
          </div>

          {/* Split Mode Selection */}
          <div className="space-y-2.5">
            <Label>Split mode</Label>
            <ToggleGroup
              type="single"
              value={splitMode}
              onValueChange={(value) => {
                if (!value) return;
                const nextMode = value as SplitMode;
                setSplitMode(nextMode);
                rememberLastSplitMode(tripId, nextMode);
              }}
              className="flex flex-wrap justify-start gap-2"
            >
              <ToggleGroupItem
                value="equal"
                className="text-sm rounded-full border border-input bg-card px-4 py-1.5 text-muted-foreground hover:bg-accent data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                Equally
              </ToggleGroupItem>
              <ToggleGroupItem
                value="amount"
                className="text-sm rounded-full border border-input bg-card px-4 py-1.5 text-muted-foreground hover:bg-accent data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                By amount
              </ToggleGroupItem>
              <ToggleGroupItem
                value="percentage"
                className="text-sm rounded-full border border-input bg-card px-4 py-1.5 text-muted-foreground hover:bg-accent data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                By %
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2.5">
            <Label>Shared with</Label>
            <div className="grid grid-cols-1 gap-3">
              {people.length > 0 && (
                <div
                  className={cn(
                    "flex items-center gap-4 rounded-lg border bg-card px-3 py-3.5 transition-colors",
                    selectAllChecked
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <Checkbox
                    id="select-all-shared"
                    checked={selectAllChecked}
                    onCheckedChange={(c) => {
                      if (c === true) {
                        selectAllPeople();
                      } else {
                        clearSharedWith();
                      }
                    }}
                    className="text-primary"
                  />
                  <label
                    htmlFor="select-all-shared"
                    className="flex min-w-0 flex-1 cursor-pointer items-center text-base font-medium text-foreground"
                  >
                    Select all
                  </label>
                  {splitMode !== "equal" && (
                    <div
                      className="shrink-0 sm:w-48"
                      aria-hidden
                    />
                  )}
                </div>
              )}
              {people.map((person) => {
                const included = newItemSharedWith.includes(person.id);
                return (
                <div
                  key={person.id}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border bg-card px-3 py-3.5 transition-colors",
                    included
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <Checkbox
                    id={`person-${person.id}`}
                    checked={included}
                    onCheckedChange={() => togglePersonInSharedWith(person.id)}
                    className="text-primary"
                  />
                  <label
                    htmlFor={`person-${person.id}`}
                    className="flex min-w-0 flex-1 cursor-pointer items-center text-base text-foreground"
                  >
                    <PersonAvatar
                      name={person.name}
                      seed={person.avatarSeed}
                      size="sm"
                    />
                    <span className="ml-2 font-medium">{person.name}</span>
                  </label>
                  {splitMode === "amount" && included && (
                    <div
                      className="flex shrink-0 items-center gap-1.5 pl-1"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={personAmounts[person.id] || ""}
                        onChange={(e) =>
                          handlePersonAmountChange(person.id, e.target.value)
                        }
                        onBlur={() => handlePersonAmountBlur(person.id)}
                        placeholder="0.00"
                        className="h-10 min-h-10 w-36 text-left text-sm tabular-nums"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`${person.name} share amount`}
                      />
                      <span
                        className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground"
                        aria-hidden
                      >
                        {getCurrencyByValue(newItemCurrency)?.symbol ?? newItemCurrency}
                      </span>
                    </div>
                  )}
                  {splitMode === "percentage" && included && (
                    <div
                      className="flex shrink-0 items-center gap-1.5 pl-1"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={personPercents[person.id] || ""}
                        onChange={(e) =>
                          handlePersonPercentChange(person.id, e.target.value)
                        }
                        placeholder="0"
                        className="h-10 min-h-10 w-24 text-left text-sm tabular-nums"
                        onClick={(e) => e.stopPropagation()}
                        inputMode="decimal"
                        aria-label={`${person.name} share percent`}
                      />
                      <span
                        className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground"
                        aria-hidden
                      >
                        %
                      </span>
                    </div>
                  )}
                </div>
                );
              })}
              {people.length === 0 && (
                <span className="col-span-full text-base text-muted-foreground">
                  Add people first
                </span>
              )}
            </div>
          </div>

          <div
            ref={inlineActionsRef}
            className="!mt-6 min-h-12"
            data-bill-actions="inline"
          >
            <div
              className={cn(
                "transition-[opacity,transform] duration-300 motion-reduce:transition-none",
                inlineActionsVisible
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-1 scale-[0.99] opacity-0",
              )}
              aria-hidden={!inlineActionsVisible}
              style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
            >
              {renderBillActions("inline", inlineActionsVisible)}
            </div>
          </div>

          <TripFloatingActionBar>
            <div
              className={cn(
                "flex w-full justify-center transition-[opacity,transform] duration-300 motion-reduce:transition-none",
                inlineActionsVisible
                  ? "translate-y-1 scale-[0.99] opacity-0"
                  : "translate-y-0 scale-100 opacity-100",
              )}
              data-bill-actions="floating"
              aria-hidden={inlineActionsVisible}
              style={{
                pointerEvents: inlineActionsVisible ? "none" : "auto",
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {renderBillActions("floating", !inlineActionsVisible)}
            </div>
          </TripFloatingActionBar>
    </div>
  );
}
