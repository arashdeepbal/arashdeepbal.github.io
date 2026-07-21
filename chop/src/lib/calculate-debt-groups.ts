import { amountsEqually, amountsFromWeights } from "@/lib/split-total-by-percents";
import { getCurrencyFractionDigits } from "@/lib/format-amount";
import type { BillItem, Person } from "@/types";

interface SettlementRecord {
  from_person_id: string;
  to_person_id: string;
  currency: string;
  amount: number;
}

interface DebtGroup {
  fromPerson: string;
  toPerson: string;
  amounts: Array<{
    currency: string;
    amount: number;
  }>;
}

interface Balance {
  paid: number;
  owes: number;
}

const toUnits = (amount: number, fractionDigits: number) =>
  Math.round(amount * 10 ** fractionDigits);

export function calculateDebtGroups({
  billItems,
  people,
  settlements,
}: {
  billItems: BillItem[];
  people: Person[];
  settlements: SettlementRecord[];
}): DebtGroup[] {
  const balancesByCurrency = new Map<string, Map<string, Balance>>();
  const settledCurrencies = new Set(
    settlements.map((settlement) => settlement.currency),
  );
  const personOrder = new Map<string, number>();

  const registerPerson = (personId: string) => {
    if (!personOrder.has(personId)) {
      personOrder.set(personId, personOrder.size);
    }
  };

  people.forEach((person) => registerPerson(person.id));

  const getBalance = (currency: string, personId: string) => {
    registerPerson(personId);
    let currencyBalances = balancesByCurrency.get(currency);
    if (!currencyBalances) {
      currencyBalances = new Map();
      balancesByCurrency.set(currency, currencyBalances);
    }
    let balance = currencyBalances.get(personId);
    if (!balance) {
      balance = { paid: 0, owes: 0 };
      currencyBalances.set(personId, balance);
    }
    return balance;
  };

  for (const item of billItems) {
    const fractionDigits = getCurrencyFractionDigits(item.currency);
    const storedSplits = item.personSplits?.filter(
      (split) => Number.isFinite(split.amount) && split.amount >= 0,
    );
    if (
      !item.paidBy ||
      ((!storedSplits || storedSplits.length === 0) &&
        item.sharedWith.length === 0)
    ) {
      continue;
    }

    getBalance(item.currency, item.paidBy).paid += toUnits(
      item.amount,
      fractionDigits,
    );

    const normalizedSplits =
      storedSplits && storedSplits.some((split) => split.amount > 0)
        ? amountsFromWeights(
            item.amount,
            storedSplits.map((split) => ({
              personId: split.personId,
              weight: split.amount,
            })),
            fractionDigits,
          )
        : amountsEqually(item.amount, item.sharedWith, fractionDigits);

    for (const split of normalizedSplits) {
      getBalance(item.currency, split.personId).owes += toUnits(
        split.amount,
        fractionDigits,
      );
    }
  }

  for (const settlement of settlements) {
    const currencyBalances = balancesByCurrency.get(settlement.currency);
    if (!currencyBalances) continue;
    const settledUnits = toUnits(
      settlement.amount,
      getCurrencyFractionDigits(settlement.currency),
    );
    getBalance(settlement.currency, settlement.from_person_id).owes -=
      settledUnits;
    getBalance(settlement.currency, settlement.to_person_id).paid -=
      settledUnits;
  }

  const groupsByPersonPair = new Map<string, DebtGroup>();

  for (const [currency, balances] of balancesByCurrency) {
    const fractionDigits = getCurrencyFractionDigits(currency);
    const factor = 10 ** fractionDigits;
    const negligibleUnits = settledCurrencies.has(currency) ? 5 : 0;
    const netBalances = new Map<string, number>();
    for (const [personId, balance] of balances) {
      netBalances.set(personId, balance.paid - balance.owes);
    }

    const byPersonOrder = (a: string, b: string) =>
      (personOrder.get(a) ?? 0) - (personOrder.get(b) ?? 0);
    const debtors = [...netBalances.keys()]
      .filter(
        (personId) => (netBalances.get(personId) ?? 0) < -negligibleUnits,
      )
      .sort(byPersonOrder);
    const creditors = [...netBalances.keys()]
      .filter(
        (personId) => (netBalances.get(personId) ?? 0) > negligibleUnits,
      )
      .sort(byPersonOrder);

    for (const debtorId of debtors) {
      let remaining = Math.abs(netBalances.get(debtorId) ?? 0);
      for (const creditorId of creditors) {
        const creditorBalance = netBalances.get(creditorId) ?? 0;
        if (remaining <= 0 || creditorBalance <= 0) continue;

        const transferUnits = Math.min(remaining, creditorBalance);
        if (transferUnits <= negligibleUnits) continue;
        const personPairKey = JSON.stringify([debtorId, creditorId]);
        let group = groupsByPersonPair.get(personPairKey);
        if (!group) {
          group = {
            fromPerson: debtorId,
            toPerson: creditorId,
            amounts: [],
          };
          groupsByPersonPair.set(personPairKey, group);
        }
        group.amounts.push({ currency, amount: transferUnits / factor });
        netBalances.set(creditorId, creditorBalance - transferUnits);
        remaining -= transferUnits;
      }
    }
  }

  return [...groupsByPersonPair.values()];
}
