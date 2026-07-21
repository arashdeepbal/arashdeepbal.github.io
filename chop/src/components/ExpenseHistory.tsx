import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowRight, Search, SlidersHorizontal, Undo2 } from "lucide-react";
import { BillItem, Person } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { ConfirmBottomSheet } from "@/components/ConfirmBottomSheet";
import { IconBin, IconEdit } from "@/components/icons/app-icons";
import { IndividualSettlement } from "@/services/database";
import {
  formatCurrencyAmount,
  getCurrencyFractionDigits,
} from "@/lib/format-amount";
import { getCurrencyByValue } from "@/lib/currencies";
import { amountsEqually } from "@/lib/split-total-by-percents";
import { getLocalDateKey } from "@/lib/local-date-key";
import { ParticipantIdentity } from "@/components/ParticipantIdentity";
import { SectionHeading } from "@/components/section-heading";
import { toast } from "@/lib/app-toast";
import { REMOVED_PARTICIPANT_LABEL } from "@/lib/participant-avatar";
import { cn } from "@/lib/utils";
import { waitForMotion } from "@/lib/motion";
import { IllustratedState } from "@/components/IllustratedState";

interface ExpenseHistoryProps {
  billItems: BillItem[];
  people: Person[];
  settlements: IndividualSettlement[];
  onRemoveItem?: (id: string) => void | Promise<void>;
  onRemoveSettlement?: (id: string) => void | Promise<void>;
  onEditItem?: (item: BillItem) => void;
}

type HistoryTypeFilter = "all" | "expense" | "settlement";

interface HistoryDateFilterProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * iOS Safari leaves an empty native date input visually blank instead of
 * rendering a format hint. Keep the native picker, but provide our own hint
 * until the user chooses a date.
 */
function HistoryDateFilter({
  id,
  label,
  value,
  onChange,
}: HistoryDateFilterProps) {
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative min-w-0">
        <Input
          id={id}
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "peer min-w-0",
            !value && "text-transparent focus:text-foreground",
          )}
        />
        {!value ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-base text-muted-foreground transition-opacity peer-focus:opacity-0"
          >
            dd/mm/yyyy
          </span>
        ) : null}
      </div>
    </div>
  );
}

interface HistoryItem {
  id: string;
  type: "expense" | "settlement";
  date: string;
  description: string;
  amount: number;
  currency: string;
  paidBy?: string | null;
  sharedWith?: string[];
  fromPerson?: string;
  toPerson?: string;
  personSplits?: Array<{
    personId: string;
    amount: number;
  }>;
  billItem?: BillItem;
  settlement?: IndividualSettlement;
}

const INITIAL_VISIBLE_DATE_GROUPS = 4;

/** Prefer stored splits; otherwise allocate the total with currency precision. */
function getDisplayPersonSplits(item: HistoryItem) {
  if (item.personSplits?.length) return item.personSplits;
  if (!item.sharedWith?.length) return null;
  return amountsEqually(
    item.amount,
    item.sharedWith,
    getCurrencyFractionDigits(item.currency),
  );
}

export default function ExpenseHistory({
  billItems,
  people,
  settlements,
  onRemoveItem,
  onRemoveSettlement,
  onEditItem,
}: ExpenseHistoryProps) {
  const [expenseToDelete, setExpenseToDelete] = useState<HistoryItem | null>(null);
  const [settlementToUndo, setSettlementToUndo] = useState<HistoryItem | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<HistoryTypeFilter>("all");
  const [personFilter, setPersonFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [visibleDateGroups, setVisibleDateGroups] = useState(
    INITIAL_VISIBLE_DATE_GROUPS,
  );

  const getPersonNameById = useCallback(
    (id: string) =>
      people.find((person) => person.id === id)?.name ??
      REMOVED_PARTICIPANT_LABEL,
    [people],
  );

  const sortedItems = useMemo(() => {
    const items: HistoryItem[] = [
      ...billItems.map((item) => ({
        id: item.id,
        type: "expense" as const,
        date: item.date,
        description: item.description,
        amount: item.amount,
        currency: item.currency,
        paidBy: item.paidBy,
        sharedWith: item.sharedWith,
        personSplits: item.personSplits,
        billItem: item,
      })),
      ...settlements.map((settlement) => ({
        id: settlement.id,
        type: "settlement" as const,
        date: settlement.settled_at,
        description: `${getPersonNameById(settlement.from_person_id)} paid ${getPersonNameById(settlement.to_person_id)}`,
        amount: settlement.amount,
        currency: settlement.currency,
        fromPerson: settlement.from_person_id,
        toPerson: settlement.to_person_id,
        settlement,
      })),
    ];
    return items.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [billItems, getPersonNameById, settlements]);

  const availableCurrencies = useMemo(
    () => [...new Set(sortedItems.map((item) => item.currency))],
    [sortedItems],
  );
  const showHistoryTools = sortedItems.length >= 6;

  const filteredItems = useMemo(() => {
    if (!showHistoryTools) return sortedItems;
    const normalizedQuery = query.trim().toLowerCase();
    return sortedItems.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (currencyFilter !== "all" && item.currency !== currencyFilter) return false;
      const date = getLocalDateKey(item.date);
      if (fromDate && date < fromDate) return false;
      if (toDate && date > toDate) return false;

      const involvedPeople =
        item.type === "settlement"
          ? [item.fromPerson, item.toPerson]
          : [item.paidBy, ...(item.sharedWith ?? []), ...(item.personSplits ?? []).map((split) => split.personId)];
      if (
        personFilter !== "all" &&
        !involvedPeople.some((personId) => personId === personFilter)
      ) {
        return false;
      }

      if (!normalizedQuery) return true;
      const searchableText = [
        item.description,
        item.currency,
        getCurrencyByValue(item.currency)?.iso,
        ...involvedPeople
          .filter((personId): personId is string => Boolean(personId))
          .map(getPersonNameById),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchableText.includes(normalizedQuery);
    });
  }, [
    currencyFilter,
    fromDate,
    getPersonNameById,
    personFilter,
    query,
    showHistoryTools,
    sortedItems,
    toDate,
    typeFilter,
  ]);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, HistoryItem[]>();
    for (const item of filteredItems) {
      const date = getLocalDateKey(item.date);
      const dateItems = groups.get(date) ?? [];
      dateItems.push(item);
      groups.set(date, dateItems);
    }
    return [...groups.entries()];
  }, [filteredItems]);

  useEffect(() => {
    setVisibleDateGroups(INITIAL_VISIBLE_DATE_GROUPS);
  }, [currencyFilter, fromDate, personFilter, query, toDate, typeFilter]);

  if (billItems.length === 0 && settlements.length === 0) {
    return (
      <IllustratedState
        className="gap-4 py-10"
        illustration={
          <img
            src={`${import.meta.env.BASE_URL}trip-not-found.jpg`}
            alt=""
            width={180}
            height={180}
            className="empty-state-illustration"
            decoding="async"
          />
        }
        description="Your trip history will appear after you add your first bill."
      />
    );
  }

  const hasActiveFilters =
    Boolean(query || fromDate || toDate) ||
    typeFilter !== "all" ||
    personFilter !== "all" ||
    currencyFilter !== "all";
  const visibleGroups = groupedItems.slice(0, visibleDateGroups);

  return (
    <div className="space-y-6">
      {showHistoryTools ? (
        <section className="space-y-3" aria-labelledby="history-tools-heading">
          <h2 id="history-tools-heading" className="sr-only">
            Search and filter history
          </h2>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search expenses, people, or currency"
              aria-label="Search history"
              className="pl-10"
            />
          </div>

          <Card asChild>
            <details>
            <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 py-3 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden />
              Filters
              {hasActiveFilters ? (
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  Active
                </span>
              ) : null}
            </summary>
            <div className="grid gap-4 border-t border-border p-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="history-type-filter">Entry type</Label>
              <NativeSelect
                id="history-type-filter"
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as HistoryTypeFilter)
                }
              >
                <option value="all">All entries</option>
                <option value="expense">Expenses</option>
                <option value="settlement">Settlements</option>
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="history-person-filter">Participant</Label>
              <NativeSelect
                id="history-person-filter"
                value={personFilter}
                onChange={(event) => setPersonFilter(event.target.value)}
              >
                <option value="all">Everyone</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="history-currency-filter">Currency</Label>
              <NativeSelect
                id="history-currency-filter"
                value={currencyFilter}
                onChange={(event) => setCurrencyFilter(event.target.value)}
              >
                <option value="all">All currencies</option>
                {availableCurrencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {getCurrencyByValue(currency)?.iso ?? currency}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <HistoryDateFilter
                id="history-from-date"
                label="From"
                value={fromDate}
                onChange={setFromDate}
              />
              <HistoryDateFilter
                id="history-to-date"
                label="To"
                value={toDate}
                onChange={setToDate}
              />
            </div>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                className="sm:col-span-2"
                onClick={() => {
                  setQuery("");
                  setTypeFilter("all");
                  setPersonFilter("all");
                  setCurrencyFilter("all");
                  setFromDate("");
                  setToDate("");
                }}
              >
                Clear filters
              </Button>
            ) : null}
            </div>
            </details>
          </Card>
        </section>
      ) : null}

      {visibleGroups.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
          <p className="font-medium text-foreground">No matching history</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search or clear the filters.
          </p>
        </div>
      ) : null}

      {visibleGroups.map(([date, items]) => (
        <section key={date} className="space-y-3" aria-labelledby={`history-${date}`}>
          <SectionHeading
            id={`history-${date}`}
            className="sm:text-lg"
          >
            {format(new Date(`${date}T00:00:00`), "MMMM d, yyyy")}
          </SectionHeading>
          <div className="flex flex-col gap-3">
            {items.map((item, itemIndex) => {
              if (item.type === "settlement") {
                const fromPerson = people.find((person) => person.id === item.fromPerson);
                const toPerson = people.find((person) => person.id === item.toPerson);
                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "motion-list-enter motion-removable overflow-hidden p-0",
                    )}
                    data-removing={removingItemId === item.id ? "true" : "false"}
                    style={{ animationDelay: `${Math.min(itemIndex, 5) * 40}ms` }}
                  >
                    <div className="space-y-2 px-4 py-4">
                      <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        Settlement
                      </span>
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                          <ParticipantIdentity
                            person={fromPerson}
                            fallbackName={getPersonNameById(item.fromPerson ?? "")}
                            size="sm"
                            nameClassName="text-sm"
                          />
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                          <ParticipantIdentity
                            person={toPerson}
                            fallbackName={getPersonNameById(item.toPerson ?? "")}
                            size="sm"
                            nameClassName="text-sm"
                          />
                        </div>
                        <span className="shrink-0 text-base font-semibold tabular-nums text-foreground">
                          {item.currency} {formatCurrencyAmount(item.amount, item.currency)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Settled on{" "}
                        <time dateTime={item.date} className="tabular-nums">
                          {format(new Date(item.date), "MMM d, yyyy · h:mm a")}
                        </time>
                      </p>
                    </div>
                    {onRemoveSettlement ? (
                      <div className="bg-muted/15 px-4 pb-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full gap-2 font-medium"
                          onClick={() => setSettlementToUndo(item)}
                        >
                          <Undo2 className="h-4 w-4" aria-hidden />
                          Undo settlement
                        </Button>
                      </div>
                    ) : null}
                  </Card>
                );
              }

              const paidByPerson = people.find((person) => person.id === item.paidBy);
              const displaySplits = getDisplayPersonSplits(item);

              return (
                <Card
                  key={item.id}
                  className="motion-list-enter motion-removable overflow-hidden p-0"
                  data-removing={removingItemId === item.id ? "true" : "false"}
                  style={{ animationDelay: `${Math.min(itemIndex, 5) * 40}ms` }}
                >
                  <div className="space-y-4 px-4 pb-2 pt-4">
                    <div>
                      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                        Expense
                      </span>
                      <div className="mt-2 flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                        <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight text-foreground">
                          {item.description}
                        </h3>
                        <span className="shrink-0 text-base font-semibold tabular-nums text-foreground">
                          {item.currency} {formatCurrencyAmount(item.amount, item.currency)}
                        </span>
                      </div>
                    </div>

                    <dl className="grid gap-3 text-sm">
                      <div>
                        <dt className="sr-only">Paid by</dt>
                        <dd className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-muted-foreground">Paid by</span>
                          <ParticipantIdentity
                            person={paidByPerson}
                            fallbackName={getPersonNameById(item.paidBy ?? "")}
                            size="sm"
                            nameClassName="text-sm"
                          />
                        </dd>
                      </div>
                    </dl>

                    {displaySplits?.length ? (
                      <div className="rounded-lg border border-border/80 bg-muted/25 px-3 py-2.5">
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                          Amount per person
                        </p>
                        <ul className="space-y-2">
                          {displaySplits.map((split) => {
                            const person = people.find((candidate) => candidate.id === split.personId);
                            return (
                              <li key={split.personId} className="flex items-center justify-between gap-3 text-sm">
                                <ParticipantIdentity
                                  person={person}
                                  size="sm"
                                  nameClassName="text-sm"
                                />
                                <span className="shrink-0 font-medium tabular-nums text-foreground">
                                  {item.currency} {formatCurrencyAmount(split.amount, item.currency)}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : null}
                  </div>

                  {onEditItem || onRemoveItem ? (
                    <div className="flex gap-3 bg-muted/15 px-4 pb-3 pt-2">
                      {onEditItem && item.billItem ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 gap-2 font-medium"
                          onClick={() => onEditItem(item.billItem!)}
                        >
                          <IconEdit className="h-4 w-4" />
                          Edit
                        </Button>
                      ) : null}
                      {onRemoveItem ? (
                        <Button
                          type="button"
                          variant="deleteOutline"
                          className="flex-1 gap-2 font-medium"
                          onClick={() => setExpenseToDelete(item)}
                        >
                          <IconBin className="h-4 w-4" />
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      {groupedItems.length > visibleDateGroups ? (
        <Button
          type="button"
          variant="secondary"
          className="h-12 w-full"
          onClick={() =>
            setVisibleDateGroups((current) => current + INITIAL_VISIBLE_DATE_GROUPS)
          }
        >
          Load older entries
        </Button>
      ) : null}

      <ConfirmBottomSheet
        open={expenseToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setExpenseToDelete(null);
        }}
        visual="delete"
        title="Delete this expense?"
        description="This removes it from the trip. You can’t undo this."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!expenseToDelete || !onRemoveItem) return;
          const label = expenseToDelete.description.trim() || "Expense";
          setRemovingItemId(expenseToDelete.id);
          try {
            await waitForMotion(200);
            await onRemoveItem(expenseToDelete.id);
            toast.success("Expense deleted", {
              description: `“${label}” was removed from this trip.`,
            });
          } finally {
            setRemovingItemId(null);
          }
        }}
      />

      <ConfirmBottomSheet
        open={settlementToUndo !== null}
        onOpenChange={(open) => {
          if (!open) setSettlementToUndo(null);
        }}
        title="Undo this settlement?"
        description="This moves the balance back to Pending so it can be settled again."
        confirmLabel="Undo settlement"
        confirmVariant="default"
        onConfirm={async () => {
          if (!settlementToUndo || !onRemoveSettlement) return;
          setRemovingItemId(settlementToUndo.id);
          try {
            await waitForMotion(200);
            await onRemoveSettlement(settlementToUndo.id);
            toast.success("Settlement undone");
          } finally {
            setRemovingItemId(null);
          }
        }}
      />
    </div>
  );
}
