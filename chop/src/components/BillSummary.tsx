import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmBottomSheet } from "@/components/ConfirmBottomSheet";
import { IconSettleCheck } from "@/components/icons/settle-check-icon";
import { BillItem, Person } from "@/types";
import { toast } from "@/lib/app-toast";
import { IndividualSettlement } from "@/services/database";
import { formatCurrencyAmount } from "@/lib/format-amount";
import {
  REMOVED_PARTICIPANT_AVATAR_SEED,
  REMOVED_PARTICIPANT_LABEL,
} from "@/lib/participant-avatar";
import { calculateDebtGroups } from "@/lib/calculate-debt-groups";
import PersonAvatar from "./PersonAvatar";

interface BillSummaryProps {
  billItems: BillItem[];
  people: Person[];
  settlements: IndividualSettlement[];
  onSettleIndividual?: (
    fromPersonId: string,
    toPersonId: string,
    currency: string,
    amount: number,
  ) => Promise<IndividualSettlement>;
  onRemoveSettlement?: (settlementId: string) => Promise<void>;
  /** True when there is at least one debtor→creditor line to show (drives trip header title). */
  onDebtSplitsChange?: (hasDebts: boolean) => void;
}

export default function BillSummary({
  billItems,
  people,
  settlements,
  onSettleIndividual,
  onRemoveSettlement,
  onDebtSplitsChange,
}: BillSummaryProps) {
  const [settlingItems, setSettlingItems] = useState<Set<string>>(new Set());
  const [settlementToConfirm, setSettlementToConfirm] = useState<{
    fromPersonId: string;
    toPersonId: string;
    currency: string;
    amount: number;
  } | null>(null);
  const debtsByPersonPair = useMemo(
    () => calculateDebtGroups({ billItems, people, settlements }),
    [billItems, people, settlements],
  );

  const settlementsNewestFirst = useMemo(
    () =>
      [...settlements].sort(
        (a, b) =>
          new Date(b.settled_at).getTime() - new Date(a.settled_at).getTime()
      ),
    [settlements]
  );

  useEffect(() => {
    const hasDebts = billItems.length > 0 && debtsByPersonPair.length > 0;
    onDebtSplitsChange?.(hasDebts);
  }, [billItems.length, debtsByPersonPair.length, onDebtSplitsChange]);

  const getPersonById = (id: string) => {
    return people.find(p => p.id === id);
  };
  const handleIndividualSettle = async (fromPersonId: string, toPersonId: string, currency: string, amount: number) => {
    const settleKey = `${fromPersonId}-${toPersonId}-${currency}`;
    if (settlingItems.has(settleKey)) return;
    setSettlingItems(prev => new Set(prev).add(settleKey));
    try {
      if (!onSettleIndividual) return;
      const settlement = await onSettleIndividual(
        fromPersonId,
        toPersonId,
        currency,
        amount,
      );
      toast.success("Settlement recorded", {
        id: settleKey,
        duration: 5000,
        description: "The balance has been moved to Settled.",
        action: onRemoveSettlement
          ? {
              label: "Undo",
              onClick: () => {
                void onRemoveSettlement(settlement.id)
                  .then(() =>
                    toast.success("Settlement undone", { id: settleKey })
                  )
                  .catch(() => undefined);
              },
            }
          : undefined,
      });
    } catch (error) {
      console.error("Error settling individual debt:", error);
      toast.error("Failed to record settlement", { id: settleKey });
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
          src={`${import.meta.env.BASE_URL}summary-empty.png`}
          alt=""
          width={240}
          height={134}
          className="mb-4 h-auto w-[240px] max-w-full object-contain"
          decoding="async"
          loading="lazy"
        />
        <p className="text-muted-foreground">
          Your summary will appear after you add your first bill.
        </p>
      </div>
    );
  }

  const showAllSettledState =
    debtsByPersonPair.length === 0 &&
    (billItems.length > 0 || settlements.length > 0);

  const summarySectionTitleClass =
    "text-lg font-semibold tracking-tight text-foreground sm:text-xl";

  return (
    <div className="space-y-6">
      {debtsByPersonPair.length > 0 ? (
        <section
          className="space-y-3"
          {...(settlements.length > 0
            ? { "aria-labelledby": "summary-pending-heading" }
            : {})}
        >
          {settlements.length > 0 ? (
            <h2 id="summary-pending-heading" className={summarySectionTitleClass}>
              Pending
            </h2>
          ) : null}
          <div className="flex flex-col gap-3">
            {debtsByPersonPair.map((split) => {
              const fromPerson = getPersonById(split.fromPerson);
              const toPerson = getPersonById(split.toPerson);
              return (
                <Card
                  key={`${split.fromPerson}-${split.toPerson}`}
                  className="p-4"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <PersonAvatar
                          name={fromPerson?.name || REMOVED_PARTICIPANT_LABEL}
                          seed={
                            fromPerson?.avatarSeed ||
                            REMOVED_PARTICIPANT_AVATAR_SEED
                          }
                          size="sm"
                        />
                        <span className="truncate text-sm font-medium text-foreground">
                          {fromPerson?.name ?? REMOVED_PARTICIPANT_LABEL}
                        </span>
                      </div>
                      <ArrowRight
                        className="shrink-0 text-primary"
                        size={18}
                        aria-hidden
                      />
                      <div className="flex min-w-0 items-center gap-2">
                        <PersonAvatar
                          name={toPerson?.name || REMOVED_PARTICIPANT_LABEL}
                          seed={
                            toPerson?.avatarSeed ||
                            REMOVED_PARTICIPANT_AVATAR_SEED
                          }
                          size="sm"
                        />
                        <span className="text-sm font-medium text-foreground">
                          {toPerson?.name ?? REMOVED_PARTICIPANT_LABEL}
                        </span>
                      </div>
                    </div>

                    <div>
                      {split.amounts.map((amount, amountIndex) => {
                        const settleKey = `${split.fromPerson}-${split.toPerson}-${amount.currency}`;
                        const isSettling = settlingItems.has(settleKey);
                        return (
                          <div
                            key={settleKey}
                            className={`flex w-full items-center justify-between gap-4 ${
                              amountIndex > 0
                                ? "mt-4 border-t border-border pt-4"
                                : ""
                            }`}
                          >
                            <div className="text-lg font-bold text-foreground">
                              {amount.currency} {formatCurrencyAmount(amount.amount, amount.currency)}
                            </div>
                            <Button
                              onClick={() =>
                                setSettlementToConfirm({
                                  fromPersonId: split.fromPerson,
                                  toPersonId: split.toPerson,
                                  currency: amount.currency,
                                  amount: amount.amount,
                                })
                              }
                              disabled={isSettling}
                              size="sm"
                              className="shrink-0 gap-1.5"
                            >
                              <IconSettleCheck className="size-4" />
                              {isSettling ? "Settling..." : "Settle"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ) : showAllSettledState ? (
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
          <h2 id="summary-settled-heading" className={summarySectionTitleClass}>
            Settled
          </h2>
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
                            {fromPerson?.name ?? REMOVED_PARTICIPANT_LABEL}
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
                            {toPerson?.name ?? REMOVED_PARTICIPANT_LABEL}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 text-base font-semibold tabular-nums text-foreground">
                        {s.currency} {formatCurrencyAmount(s.amount, s.currency)}
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

      <ConfirmBottomSheet
        open={settlementToConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setSettlementToConfirm(null);
        }}
        title="Settle this balance?"
        description={
          settlementToConfirm ? (
            <>
              Record that{" "}
              <span className="font-medium text-foreground">
                {getPersonById(settlementToConfirm.fromPersonId)?.name ??
                  REMOVED_PARTICIPANT_LABEL}
              </span>{" "}
              paid{" "}
              <span className="font-medium text-foreground">
                {getPersonById(settlementToConfirm.toPersonId)?.name ??
                  REMOVED_PARTICIPANT_LABEL}
              </span>{" "}
              {settlementToConfirm.currency}{" "}
              {formatCurrencyAmount(
                settlementToConfirm.amount,
                settlementToConfirm.currency,
              )}. You can undo this from History.
            </>
          ) : null
        }
        confirmLabel="Settle balance"
        confirmVariant="default"
        onConfirm={async () => {
          if (!settlementToConfirm) return;
          await handleIndividualSettle(
            settlementToConfirm.fromPersonId,
            settlementToConfirm.toPersonId,
            settlementToConfirm.currency,
            settlementToConfirm.amount,
          );
        }}
      />
    </div>
  );
}
