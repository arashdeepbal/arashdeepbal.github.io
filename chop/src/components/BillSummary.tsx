import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconCircleCheck } from "@/components/icons/circle-check-icon";
import { IconSettleCheck } from "@/components/icons/settle-check-icon";
import { BillItem, Person } from "@/types";
import { toast } from "sonner";
import { IndividualSettlement } from "@/services/database";
import PersonAvatar from "./PersonAvatar";

interface BillSummaryProps {
  billItems: BillItem[];
  people: Person[];
  settlements: IndividualSettlement[];
  onSettleIndividual?: (fromPersonId: string, toPersonId: string, currency: string, amount: number) => void;
  /** True when there is at least one debtor→creditor line to show (drives trip header title). */
  onDebtSplitsChange?: (hasDebts: boolean) => void;
}

interface CurrencySplit {
  fromPerson: string;
  toPerson: string;
  amounts: {
    currency: string;
    amount: number;
  }[];
}
export default function BillSummary({
  billItems,
  people,
  settlements,
  onSettleIndividual,
  onDebtSplitsChange,
}: BillSummaryProps) {
  const [settlingItems, setSettlingItems] = useState<Set<string>>(new Set());
  const splitsByCurrency = useMemo(() => {
    // Calculate what each person paid and owes by currency
    const personBalancesByCurrency: Record<string, Record<string, {
      paid: number;
      owes: number;
    }>> = {};

    // Get all currencies from bill items
    const currencies = [...new Set(billItems.map(item => item.currency))];

    // Initialize balances for each currency and person
    currencies.forEach(currency => {
      personBalancesByCurrency[currency] = {};
      people.forEach(person => {
        personBalancesByCurrency[currency][person.id] = {
          paid: 0,
          owes: 0
        };
      });
    });

    // Calculate balances from bill items
    billItems.forEach(item => {
      if (item.paidBy && item.sharedWith.length > 0) {
        const currency = item.currency;

        // Add to what they paid
        personBalancesByCurrency[currency][item.paidBy].paid += item.amount;

        // Split owed amounts: use persisted-style personSplits when present, else equal over sharedWith
        if (item.personSplits && item.personSplits.length > 0) {
          item.personSplits.forEach((ps) => {
            const row = personBalancesByCurrency[currency][ps.personId];
            if (row) row.owes += ps.amount;
          });
        } else {
          const shareAmount = item.amount / item.sharedWith.length;
          item.sharedWith.forEach((personId) => {
            personBalancesByCurrency[currency][personId].owes += shareAmount;
          });
        }
      }
    });

    // Subtract settled amounts
    settlements.forEach(settlement => {
      const currency = settlement.currency;
      if (personBalancesByCurrency[currency]) {
        // Reduce what the debtor owes
        if (personBalancesByCurrency[currency][settlement.from_person_id]) {
          personBalancesByCurrency[currency][settlement.from_person_id].owes -= settlement.amount;
        }
        // Reduce what the creditor is owed
        if (personBalancesByCurrency[currency][settlement.to_person_id]) {
          personBalancesByCurrency[currency][settlement.to_person_id].paid -= settlement.amount;
        }
      }
    });

    // Calculate net balances and create transfers for each currency
    const splitsByCurrency: CurrencySplit[] = [];
    currencies.forEach(currency => {
      const netBalances: Record<string, number> = {};
      people.forEach(person => {
        const balance = personBalancesByCurrency[currency][person.id];
        netBalances[person.id] = balance.paid - balance.owes;
      });

      // Find debtors and creditors for this currency
      const debtors = people.filter(p => netBalances[p.id] < -0.01);
      const creditors = people.filter(p => netBalances[p.id] > 0.01);

      // Create transfers
      debtors.forEach(debtor => {
        let remaining = Math.abs(netBalances[debtor.id]);
        creditors.forEach(creditor => {
          if (remaining > 0.01 && netBalances[creditor.id] > 0.01) {
            const transferAmount = Math.min(remaining, netBalances[creditor.id]);

            // Find existing split or create new one
            let existingSplit = splitsByCurrency.find(split => split.fromPerson === debtor.id && split.toPerson === creditor.id);
            if (!existingSplit) {
              existingSplit = {
                fromPerson: debtor.id,
                toPerson: creditor.id,
                amounts: []
              };
              splitsByCurrency.push(existingSplit);
            }
            existingSplit.amounts.push({
              currency,
              amount: parseFloat(transferAmount.toFixed(2))
            });
            netBalances[creditor.id] -= transferAmount;
            remaining -= transferAmount;
          }
        });
      });
    });
    return splitsByCurrency.filter(split => split.amounts.length > 0);
  }, [billItems, people, settlements]);

  const settlementsNewestFirst = useMemo(
    () =>
      [...settlements].sort(
        (a, b) =>
          new Date(b.settled_at).getTime() - new Date(a.settled_at).getTime()
      ),
    [settlements]
  );

  useEffect(() => {
    const hasDebts = billItems.length > 0 && splitsByCurrency.length > 0;
    onDebtSplitsChange?.(hasDebts);
  }, [billItems.length, splitsByCurrency.length, onDebtSplitsChange]);

  const getPersonById = (id: string) => {
    return people.find(p => p.id === id);
  };
  const handleIndividualSettle = async (fromPersonId: string, toPersonId: string, currency: string, amount: number) => {
    const settleKey = `${fromPersonId}-${toPersonId}-${currency}`;
    if (settlingItems.has(settleKey)) return;
    setSettlingItems(prev => new Set(prev).add(settleKey));
    try {
      if (onSettleIndividual) {
        await onSettleIndividual(fromPersonId, toPersonId, currency, amount);
      }
      toast.success("Settlement recorded!");
    } catch (error) {
      console.error("Error settling individual debt:", error);
      toast.error("Failed to record settlement");
    } finally {
      setSettlingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(settleKey);
        return newSet;
      });
    }
  };
  if (billItems.length === 0 && settlements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <img
          src={`${import.meta.env.BASE_URL}summary-empty.webp`}
          alt=""
          width={180}
          height={180}
          className="empty-state-illustration mb-4"
          decoding="async"
          loading="lazy"
        />
        <p className="text-muted-foreground">Add some items to the bill to see the summary.</p>
      </div>
    );
  }

  const showAllSettledHero =
    billItems.length > 0 &&
    splitsByCurrency.length === 0 &&
    settlements.length === 0;

  const summarySectionTitleClass =
    "text-lg font-semibold tracking-tight text-foreground sm:text-xl";

  return (
    <div className="space-y-6">
      {splitsByCurrency.length > 0 ? (
        <section
          className="space-y-3"
          {...(settlements.length > 0
            ? { "aria-labelledby": "summary-pending-heading" }
            : {})}
        >
          {settlements.length > 0 ? (
            <h3 id="summary-pending-heading" className={summarySectionTitleClass}>
              Pending
            </h3>
          ) : null}
          <div className="flex flex-col gap-3">
            {splitsByCurrency.map((split) => {
              const fromPerson = getPersonById(split.fromPerson);
              const toPerson = getPersonById(split.toPerson);
              return (
                <Card
                  key={`${split.fromPerson}-${split.toPerson}`}
                  className="p-4"
                >
                  <div className="flex flex-col gap-4">
                    {split.amounts.map((amount, amountIndex) => {
                      const settleKey = `${split.fromPerson}-${split.toPerson}-${amount.currency}`;
                      const isSettling = settlingItems.has(settleKey);
                      return (
                        <div
                          key={`${settleKey}-${amountIndex}`}
                          className="flex flex-col items-start gap-3"
                        >
                          <div className="flex min-w-0 max-w-full flex-1 flex-wrap items-center gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <PersonAvatar
                                name={fromPerson?.name || ""}
                                seed={fromPerson?.avatarSeed || ""}
                                size="sm"
                              />
                              <span className="truncate text-sm font-medium text-foreground">
                                {fromPerson?.name}
                              </span>
                            </div>
                            <ArrowRight
                              className="shrink-0 text-primary"
                              size={18}
                              aria-hidden
                            />
                            <div className="flex min-w-0 items-center gap-2">
                              <PersonAvatar
                                name={toPerson?.name || ""}
                                seed={toPerson?.avatarSeed || ""}
                                size="sm"
                              />
                              <span className="text-sm font-medium text-foreground">
                                {toPerson?.name}
                              </span>
                            </div>
                          </div>
                          <div className="flex w-full items-center justify-between gap-4">
                            <div className="text-lg font-bold text-foreground">
                              {amount.currency} {amount.amount.toFixed(2)}
                            </div>
                            <Button
                              onClick={() =>
                                handleIndividualSettle(
                                  split.fromPerson,
                                  split.toPerson,
                                  amount.currency,
                                  amount.amount
                                )
                              }
                              disabled={isSettling}
                              size="sm"
                              className="shrink-0 gap-1.5"
                            >
                              <IconSettleCheck className="size-4" />
                              {isSettling ? "Settling..." : "Settle"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ) : showAllSettledHero ? (
        <div className="py-8 text-center">
          <div className="space-y-2">
            <IconCircleCheck className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="text-lg font-semibold text-green-800">All settled up</h2>
            <p className="text-green-600">Everyone has paid their fair share.</p>
          </div>
        </div>
      ) : settlements.length > 0 && splitsByCurrency.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <img
            src={`${import.meta.env.BASE_URL}summary-all-settled-trip.webp`}
            alt=""
            width={180}
            height={180}
            className="empty-state-illustration mb-4 max-w-full object-contain"
            decoding="async"
            loading="lazy"
          />
          <p className="text-lg font-semibold tracking-tight text-foreground">
            All settled for this trip!
          </p>
        </div>
      ) : null}

      {settlements.length > 0 ? (
        <section className="space-y-3" aria-labelledby="summary-settled-heading">
          <h3 id="summary-settled-heading" className={summarySectionTitleClass}>
            Settled
          </h3>
          <div className="flex flex-col gap-3">
            {settlementsNewestFirst.map((s) => {
              const fromPerson = getPersonById(s.from_person_id);
              const toPerson = getPersonById(s.to_person_id);
              return (
                <Card
                  key={s.id}
                  className="p-4 shadow-sm"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                        <div className="flex min-w-0 items-center gap-2">
                          {fromPerson ? (
                            <PersonAvatar
                              name={fromPerson.name}
                              seed={fromPerson.avatarSeed}
                              size="sm"
                            />
                          ) : null}
                          <span className="truncate">
                            {fromPerson?.name ?? "Someone"}
                          </span>
                        </div>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        <div className="flex min-w-0 items-center gap-2">
                          {toPerson ? (
                            <PersonAvatar
                              name={toPerson.name}
                              seed={toPerson.avatarSeed}
                              size="sm"
                            />
                          ) : null}
                          <span className="truncate">
                            {toPerson?.name ?? "Someone"}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 text-base font-semibold tabular-nums text-foreground">
                        {s.currency} {s.amount.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Settled on{" "}
                      <time dateTime={s.settled_at} className="tabular-nums">
                        {format(new Date(s.settled_at), "MMM d, yyyy · h:mm a")}
                      </time>
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
