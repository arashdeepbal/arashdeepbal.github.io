
export type Person = {
  id: string;
  name: string;
  /** Stable per person in a trip; drives animal avatar (stored in DB as avatar_seed). */
  avatarSeed: string;
};

export type SplitMode = "equal" | "amount" | "percentage";

export type PersonSplit = {
  personId: string;
  amount: number;
};

export type BillItem = {
  id: string;
  description: string;
  amount: number;
  paidBy: string | null;
  sharedWith: string[];
  currency: string;
  date: string; // ISO string format
  personSplits?: PersonSplit[];
};
