import { useState, useEffect, useMemo, useRef } from "react";
import { IconPlus } from "@/components/icons/app-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BillItem, Person, SplitMode, PersonSplit } from "@/types";
import { getCurrencyByValue } from "@/lib/currencies";
import { amountsFromPercents, equalSplitPercents } from "@/lib/split-total-by-percents";
import { CurrencyBottomSheet, PersonBottomSheet } from "@/components/form-bottom-sheets";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PersonAvatar from "./PersonAvatar";

interface BillItemsManagerProps {
  billItems: BillItem[];
  people: Person[];
  activeCurrency: string;
  onAddItem: (item: BillItem) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (item: BillItem) => void;
}

export default function BillItemsManager({
  billItems,
  people,
  activeCurrency,
  onAddItem,
  onRemoveItem,
  onUpdateItem
}: BillItemsManagerProps) {
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [newItemPaidBy, setNewItemPaidBy] = useState<string | null>(null);
  const [newItemSharedWith, setNewItemSharedWith] = useState<string[]>([]);
  const [newItemCurrency, setNewItemCurrency] = useState(activeCurrency);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [personAmounts, setPersonAmounts] = useState<Record<string, string>>({});
  const [personPercents, setPersonPercents] = useState<Record<string, string>>({});
  const lastPercentageSharedKeyRef = useRef<string>("");

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
    // Reset shared with when people change
    setNewItemSharedWith([]);
    setPersonAmounts({});
    setPersonPercents({});
    lastPercentageSharedKeyRef.current = "";
  }, [people]);

  useEffect(() => {
    // Set currency based on last used currency in bill items, or fallback to activeCurrency
    if (billItems.length > 0) {
      const lastBillItem = billItems[billItems.length - 1];
      setNewItemCurrency(lastBillItem.currency);
    } else {
      setNewItemCurrency(activeCurrency);
    }
  }, [billItems, activeCurrency]);

  useEffect(() => {
    // Reset amounts when shared participants change
    const newPersonAmounts: Record<string, string> = {};
    newItemSharedWith.forEach((personId) => {
      newPersonAmounts[personId] = personAmounts[personId] || "";
    });
    setPersonAmounts(newPersonAmounts);
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
    const totalAmount = parseFloat(newItemAmount);
    
    if (splitMode === "amount") {
      const totalAssigned = newItemSharedWith.reduce((sum, personId) => {
        const amount = parseFloat(personAmounts[personId] || "0");
        return sum + amount;
      }, 0);
      
      if (Math.abs(totalAssigned - totalAmount) > 0.01) {
        toast.error(
          `Amounts must sum to ${getCurrencyByValue(newItemCurrency)?.symbol ?? newItemCurrency} ${totalAmount.toFixed(2)}`
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

  const handleAddItem = () => {
    if (!newItemDescription.trim()) {
      toast.error("Please enter an item description");
      return;
    }
    if (!newItemAmount || parseFloat(newItemAmount) <= 0) {
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
    const totalAmount = parseFloat(newItemAmount);

    if (splitMode === "equal") {
      const equalAmount = totalAmount / newItemSharedWith.length;
      personSplits = newItemSharedWith.map(personId => ({
        personId,
        amount: equalAmount
      }));
    } else if (splitMode === "percentage") {
      personSplits = amountsFromPercents(
        totalAmount,
        newItemSharedWith.map((personId) => ({
          personId,
          percent: parseFloat(personPercents[personId] || "0"),
        }))
      );
    } else {
      personSplits = newItemSharedWith.map((personId) => ({
        personId,
        amount: parseFloat(personAmounts[personId] || "0"),
      }));
    }

    onAddItem({
      id: crypto.randomUUID(),
      description: newItemDescription.trim(),
      amount: parseFloat(newItemAmount),
      paidBy: newItemPaidBy,
      sharedWith: newItemSharedWith,
      currency: newItemCurrency,
      date: new Date().toISOString(),
      personSplits,
    });
    
    // Reset form
    setNewItemDescription("");
    setNewItemAmount("");
    setNewItemCurrency(activeCurrency);
    setSplitMode("equal");
    setPersonAmounts({});
    setPersonPercents({});
    lastPercentageSharedKeyRef.current = "";
    toast.success("Item added to the bill!");
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
    setPersonAmounts(prev => ({
      ...prev,
      [personId]: value
    }));
  };

  const handlePersonPercentChange = (personId: string, value: string) => {
    setPersonPercents((prev) => ({
      ...prev,
      [personId]: value,
    }));
  };

  return (
    <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
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
                type="number"
                min="0.01"
                step="0.01"
                value={newItemAmount}
                onChange={(e) => setNewItemAmount(e.target.value)}
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
              onValueChange={(value) => value && setSplitMode(value as SplitMode)}
              className="flex flex-wrap justify-start gap-2"
            >
              <ToggleGroupItem
                value="equal"
                className="text-sm rounded-full border border-input bg-white px-4 py-1.5 text-muted-foreground hover:bg-accent data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                Equally
              </ToggleGroupItem>
              <ToggleGroupItem
                value="amount"
                className="text-sm rounded-full border border-input bg-white px-4 py-1.5 text-muted-foreground hover:bg-accent data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                By amount
              </ToggleGroupItem>
              <ToggleGroupItem
                value="percentage"
                className="text-sm rounded-full border border-input bg-white px-4 py-1.5 text-muted-foreground hover:bg-accent data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
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
                        type="number"
                        min="0"
                        step="0.01"
                        value={personAmounts[person.id] || ""}
                        onChange={(e) =>
                          handlePersonAmountChange(person.id, e.target.value)
                        }
                        placeholder="0.00"
                        className="h-10 min-h-10 w-36 text-left text-sm tabular-nums"
                        onClick={(e) => e.stopPropagation()}
                        inputMode="decimal"
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

          <Button
            onClick={handleAddItem}
            disabled={people.length === 0}
            className="h-12 min-h-12 w-full gap-2 text-base font-medium"
          >
            <IconPlus className="h-5 w-5 shrink-0" />
            Add item to bill
          </Button>
    </div>
  );
}
