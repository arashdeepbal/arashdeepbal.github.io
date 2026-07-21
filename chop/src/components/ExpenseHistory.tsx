import { useMemo, useState } from "react";
import { format } from "date-fns";
import { BillItem, Person } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmBottomSheet } from "@/components/ConfirmBottomSheet";
import { ArrowRight } from "lucide-react";
import { IconBin } from "@/components/icons/app-icons";
import { IndividualSettlement } from "@/services/database";
import PersonAvatar from "./PersonAvatar";
import { toast } from "sonner";

interface ExpenseHistoryProps {
  billItems: BillItem[];
  people: Person[];
  settlements: IndividualSettlement[];
  onRemoveItem?: (id: string) => void;
}

interface HistoryItem {
  id: string;
  type: "expense" | "settlement";
  date: string;
  description: string;
  amount?: number;
  currency?: string;
  paidBy?: string;
  sharedWith?: string[];
  fromPerson?: string;
  toPerson?: string;
  personSplits?: Array<{
    personId: string;
    amount: number;
  }>;
}

/** Prefer stored splits; otherwise equal split from total and sharedWith for display. */
function getDisplayPersonSplits(item: {
  amount?: number;
  sharedWith?: string[];
  personSplits?: Array<{ personId: string; amount: number }>;
}): Array<{ personId: string; amount: number }> | null {
  if (item.personSplits && item.personSplits.length > 0) {
    return item.personSplits;
  }
  if (
    item.amount == null ||
    !item.sharedWith ||
    item.sharedWith.length === 0
  ) {
    return null;
  }
  const per = item.amount / item.sharedWith.length;
  return item.sharedWith.map((personId) => ({ personId, amount: per }));
}

export default function ExpenseHistory({ billItems, people, settlements, onRemoveItem }: ExpenseHistoryProps) {
  const [expenseToDelete, setExpenseToDelete] = useState<HistoryItem | null>(null);

  const getPersonNameById = (id: string) => {
    return people.find(p => p.id === id)?.name || "Unknown";
  };

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
      })),
      ...settlements.map(settlement => ({
        id: settlement.id,
        type: 'settlement' as const,
        date: settlement.settled_at,
        description: `Settlement: ${getPersonNameById(settlement.from_person_id)} → ${getPersonNameById(settlement.to_person_id)}`,
        amount: settlement.amount,
        currency: settlement.currency,
        fromPerson: settlement.from_person_id,
        toPerson: settlement.to_person_id
      }))
    ];

    return items.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [billItems, settlements, people]);

  if (billItems.length === 0 && settlements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <img
          src={`${import.meta.env.BASE_URL}history-empty.webp`}
          alt=""
          width={180}
          height={180}
          className="empty-state-illustration mb-4"
          decoding="async"
          loading="lazy"
        />
        <p className="text-muted-foreground">
          No expense history yet. Add some items to the bill first.
        </p>
      </div>
    );
  }

  // Group items by date
  const itemsByDate = sortedItems.reduce((groups, item) => {
    const date = item.date.split('T')[0]; // Get YYYY-MM-DD part
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, HistoryItem[]>);

  return (
    <div className="space-y-6">
      {Object.entries(itemsByDate).map(([date, items]) => (
        <div key={date} className="space-y-3">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {format(new Date(date), "MMMM d, yyyy")}
          </h3>
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              if (item.type === "settlement") {
                const fromPerson = people.find((p) => p.id === item.fromPerson);
                const toPerson = people.find((p) => p.id === item.toPerson);
                return (
                  <Card
                    key={item.id}
                    className="p-4 shadow-sm"
                  >
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                          <div className="flex min-w-0 items-center gap-2">
                            {fromPerson && (
                              <PersonAvatar name={fromPerson.name} seed={fromPerson.avatarSeed} size="sm" />
                            )}
                            <span className="truncate">
                              {getPersonNameById(item.fromPerson ?? "")}
                            </span>
                          </div>
                          <ArrowRight
                            className="h-4 w-4 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                          <div className="flex min-w-0 items-center gap-2">
                            {toPerson && (
                              <PersonAvatar name={toPerson.name} seed={toPerson.avatarSeed} size="sm" />
                            )}
                            <span className="truncate">
                              {getPersonNameById(item.toPerson ?? "")}
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 text-base font-semibold tabular-nums text-foreground">
                          {item.currency} {item.amount?.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Settled on{" "}
                        <time dateTime={item.date} className="tabular-nums">
                          {format(new Date(item.date), "MMM d, yyyy · h:mm a")}
                        </time>
                      </p>
                    </div>
                  </Card>
                );
              }

              const paidByPerson = people.find((p) => p.id === item.paidBy);

              return (
                <Card key={item.id} className="overflow-hidden p-0 shadow-sm">
                  <div className="space-y-4 px-4 pt-4 pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                      <h4 className="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight text-foreground">
                        {item.description}
                      </h4>
                      <span className="shrink-0 text-base font-semibold tabular-nums text-foreground">
                        {item.currency} {item.amount?.toFixed(2)}
                      </span>
                    </div>

                    <dl className="grid gap-3 text-sm">
                      <div>
                        <dt className="sr-only">Paid by</dt>
                        <dd className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Paid by
                          </span>
                          <span className="inline-flex items-center gap-2">
                            {paidByPerson ? (
                              <PersonAvatar
                                name={paidByPerson.name}
                                seed={paidByPerson.avatarSeed}
                                size="sm"
                              />
                            ) : null}
                            <span className="font-medium text-foreground">
                              {getPersonNameById(item.paidBy || "")}
                            </span>
                          </span>
                        </dd>
                      </div>
                    </dl>

                    {(() => {
                      const displaySplits = getDisplayPersonSplits(item);
                      if (!displaySplits?.length) return null;
                      return (
                        <div className="rounded-lg border border-border/80 bg-muted/25 px-3 py-2.5">
                          <p className="mb-2 text-sm font-medium text-muted-foreground">
                            Amount per person
                          </p>
                          <ul className="space-y-2">
                            {displaySplits.map((split) => {
                              const person = people.find(
                                (p) => p.id === split.personId
                              );
                              return (
                                <li
                                  key={split.personId}
                                  className="flex items-center justify-between gap-3 text-sm"
                                >
                                  <span className="flex min-w-0 items-center gap-2">
                                    <PersonAvatar
                                      name={person?.name || ""}
                                      seed={person?.avatarSeed || ""}
                                      size="sm"
                                    />
                                    <span className="truncate font-medium text-foreground">
                                      {person?.name}
                                    </span>
                                  </span>
                                  <span className="shrink-0 font-medium tabular-nums text-foreground">
                                    {item.currency} {split.amount.toFixed(2)}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })()}
                  </div>

                  {onRemoveItem ? (
                    <div className="bg-muted/15 px-4 pt-2 pb-3">
                      <Button
                        type="button"
                        variant="deleteOutline"
                        className="w-full gap-2 font-medium"
                        onClick={() => setExpenseToDelete(item)}
                      >
                        <IconBin className="h-4 w-4 shrink-0" />
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      <ConfirmBottomSheet
        open={expenseToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setExpenseToDelete(null);
        }}
        visual="delete"
        title="Delete this expense?"
        description="This removes it from the trip. You can&apos;t undo this."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!expenseToDelete || !onRemoveItem) return;
          const label = expenseToDelete.description.trim() || "Expense";
          await onRemoveItem(expenseToDelete.id);
          toast.success("Expense deleted", {
            description: `"${label}" was removed from this trip.`,
          });
        }}
      />
    </div>
  );
}
