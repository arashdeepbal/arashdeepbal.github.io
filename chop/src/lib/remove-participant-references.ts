import type { BillItem, PersonSplit } from "@/types";
import { getCurrencyFractionDigits } from "@/lib/format-amount";
import { amountsFromWeights } from "@/lib/split-total-by-percents";

function removeParticipantFromPersonSplits(
  splits: PersonSplit[] | undefined,
  participantId: string,
): PersonSplit[] | undefined {
  const next = splits?.filter((split) => split.personId !== participantId);
  return next?.length ? next : undefined;
}

/** Mirror the database cleanup in local workspace state after participant removal. */
export function removeParticipantFromBillItem(
  item: BillItem,
  participantId: string,
): BillItem {
  const remainingSplits = removeParticipantFromPersonSplits(
    item.personSplits,
    participantId,
  );
  const reallocatedSplits = remainingSplits?.length
    ? amountsFromWeights(
        item.amount,
        remainingSplits.map((split) => ({
          personId: split.personId,
          weight: split.amount,
        })),
        getCurrencyFractionDigits(item.currency),
      )
    : undefined;

  return {
    ...item,
    paidBy: item.paidBy === participantId ? null : item.paidBy,
    sharedWith: item.sharedWith.filter((personId) => personId !== participantId),
    personSplits: reallocatedSplits,
  };
}
