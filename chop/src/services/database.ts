import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { removeParticipantFromBillItem } from "@/lib/remove-participant-references";
import type { BillItem, Person, PersonSplit } from "@/types";

interface DatabaseBillItem {
  id: string;
  event_id: string;
  description: string;
  amount: number;
  currency: string;
  paid_by: string | null;
  date: string;
  created_at: string;
  person_splits?: Json | null;
  bill_item_shares: { participant_id: string }[];
}

function parsePersonSplits(raw: Json | null | undefined): PersonSplit[] | undefined {
  if (raw == null) return undefined;
  if (!Array.isArray(raw)) return undefined;
  const out: PersonSplit[] = [];
  for (const el of raw) {
    if (!el || typeof el !== "object" || Array.isArray(el)) continue;
    const o = el as Record<string, unknown>;
    const personId = o.personId;
    const amount = o.amount;
    if (typeof personId !== "string" || typeof amount !== "number") continue;
    out.push({ personId, amount });
  }
  return out.length > 0 ? out : undefined;
}

function personSplitsAsJson(splits: PersonSplit[] | undefined): Json | null {
  if (!splits?.length) return null;
  const rows = splits.map((p) => ({
    personId: p.personId,
    amount: p.amount,
  }));
  return rows as unknown as Json;
}

function personSplitsToJson(item: BillItem): Json | null {
  return personSplitsAsJson(item.personSplits);
}

export interface IndividualSettlement {
  id: string;
  event_id: string;
  from_person_id: string;
  to_person_id: string;
  currency: string;
  amount: number;
  settled_at: string;
  created_at: string;
}

export class TripNotFoundError extends Error {
  constructor(eventId: string) {
    super(`Trip ${eventId} was not found`);
    this.name = "TripNotFoundError";
  }
}

// Event functions
export async function createEvent(eventId: string, name: string) {
  const { error } = await supabase
    .from("events")
    .insert([{ id: eventId, name }]);

  if (error) throw error;
}

export async function updateEvent(eventId: string, name: string) {
  const { error } = await supabase
    .from("events")
    .update({ name })
    .eq("id", eventId);

  if (error) throw error;
}

export async function deleteEvent(eventId: string) {
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId);

  if (error) throw error;
}

export async function getEvent(eventId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .maybeSingle();
  
  if (error) throw error;
  if (!data) throw new TripNotFoundError(eventId);
  return data;
}

export async function checkEventExists(eventId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .single();
  
  return !error && !!data;
}

export function generateEventCode(): string {
  // Use cryptographically secure RNG instead of Math.random()
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (100000 + (array[0] % 900000)).toString();
}

// Participants functions
export async function getParticipants(eventId: string): Promise<Person[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at');
  
  if (error) throw error;
  
  return data.map(p => ({
    id: p.id,
    name: p.name,
    avatarSeed: p.avatar_seed
  }));
}

export async function addParticipant(eventId: string, person: Person) {
  const { error } = await supabase
    .from('participants')
    .insert([{
      id: person.id,
      event_id: eventId,
      name: person.name,
      avatar_seed: person.avatarSeed
    }]);
  
  if (error) throw error;
}

export async function removeParticipant(eventId: string, participantId: string) {
  const { data: billItems, error: billItemsError } = await supabase
    .from("bill_items")
    .select("id, amount, currency, paid_by, person_splits")
    .eq("event_id", eventId);

  if (billItemsError) throw billItemsError;

  const affectedItems = billItems.flatMap((item) => {
    const previousSplits = parsePersonSplits(item.person_splits);
    const cleanedItem = removeParticipantFromBillItem(
      {
        id: item.id,
        description: "",
        amount: item.amount,
        currency: item.currency,
        paidBy: item.paid_by,
        sharedWith: [],
        date: "",
        personSplits: previousSplits,
      },
      participantId,
    );
    const nextSplits = cleanedItem.personSplits;
    const payerChanged = item.paid_by === participantId;
    const splitsChanged = previousSplits?.length !== nextSplits?.length;
    return payerChanged || splitsChanged
      ? [
          {
            id: item.id,
            previousPaidBy: item.paid_by,
            previousPersonSplits: item.person_splits,
            nextPaidBy: payerChanged ? null : item.paid_by,
            nextPersonSplits: personSplitsAsJson(nextSplits),
          },
        ]
      : [];
  });
  const updatedItemIds: string[] = [];

  const restoreUpdatedItems = async () => {
    await Promise.allSettled(
      affectedItems
        .filter((item) => updatedItemIds.includes(item.id))
        .map((item) =>
          supabase
            .from("bill_items")
            .update({
              paid_by: item.previousPaidBy,
              person_splits: item.previousPersonSplits,
            })
            .eq("id", item.id)
            .eq("event_id", eventId),
        ),
    );
  };

  try {
    for (const item of affectedItems) {
      const { error: updateError } = await supabase
        .from("bill_items")
        .update({
          paid_by: item.nextPaidBy,
          person_splits: item.nextPersonSplits,
        })
        .eq("id", item.id)
        .eq("event_id", eventId);
      if (updateError) throw updateError;
      updatedItemIds.push(item.id);
    }

    const { error: participantError } = await supabase
      .from("participants")
      .delete()
      .eq("id", participantId)
      .eq("event_id", eventId);

    if (participantError) throw participantError;
  } catch (error) {
    await restoreUpdatedItems();
    throw error;
  }
}

export async function updateParticipant(person: Person) {
  const { error } = await supabase
    .from("participants")
    .update({
      name: person.name,
      avatar_seed: person.avatarSeed,
    })
    .eq("id", person.id);

  if (error) throw error;
}

// Bill items functions
export async function getBillItems(eventId: string): Promise<BillItem[]> {
  const { data, error } = await supabase
    .from('bill_items')
    .select(`
      *,
      bill_item_shares (
        participant_id
      )
    `)
    .eq('event_id', eventId)
    .order('created_at');
  
  if (error) throw error;
  
  return data.map((item: DatabaseBillItem) => ({
    id: item.id,
    description: item.description,
    amount: item.amount,
    currency: item.currency,
    paidBy: item.paid_by,
    sharedWith: item.bill_item_shares.map((share) => share.participant_id),
    date: item.date,
    personSplits: parsePersonSplits(item.person_splits ?? null),
  }));
}

export async function addBillItem(eventId: string, item: BillItem) {
  // Insert bill item
  const { error: billItemError } = await supabase.from("bill_items").insert([
    {
      id: item.id,
      event_id: eventId,
      description: item.description,
      amount: item.amount,
      currency: item.currency,
      paid_by: item.paidBy,
      date: item.date,
      person_splits: personSplitsToJson(item),
    },
  ]);

  if (billItemError) throw billItemError;
  
  // Insert shares
  if (item.sharedWith.length > 0) {
    const shares = item.sharedWith.map(participantId => ({
      bill_item_id: item.id,
      participant_id: participantId
    }));
    
    const { error: sharesError } = await supabase
      .from('bill_item_shares')
      .insert(shares);
    
    if (sharesError) {
      await supabase.from('bill_items').delete().eq('id', item.id);
      throw sharesError;
    }
  }
}

export async function updateBillItem(eventId: string, item: BillItem) {
  const { data: previous, error: previousError } = await supabase
    .from("bill_items")
    .select("description, amount, currency, paid_by, date, person_splits, bill_item_shares(participant_id)")
    .eq("id", item.id)
    .eq("event_id", eventId)
    .single();

  if (previousError) throw previousError;

  const restorePrevious = async () => {
    await supabase
      .from("bill_items")
      .update({
        description: previous.description,
        amount: previous.amount,
        currency: previous.currency,
        paid_by: previous.paid_by,
        date: previous.date,
        person_splits: previous.person_splits,
      })
      .eq("id", item.id)
      .eq("event_id", eventId);
    await supabase
      .from("bill_item_shares")
      .delete()
      .eq("bill_item_id", item.id);
    if (previous.bill_item_shares.length > 0) {
      await supabase.from("bill_item_shares").insert(
        previous.bill_item_shares.map((share) => ({
          bill_item_id: item.id,
          participant_id: share.participant_id,
        })),
      );
    }
  };

  try {
    const { error: updateError } = await supabase
      .from("bill_items")
      .update({
        description: item.description,
        amount: item.amount,
        currency: item.currency,
        paid_by: item.paidBy,
        date: item.date,
        person_splits: personSplitsToJson(item),
      })
      .eq("id", item.id)
      .eq("event_id", eventId);
    if (updateError) throw updateError;

    const { error: deleteSharesError } = await supabase
      .from("bill_item_shares")
      .delete()
      .eq("bill_item_id", item.id);
    if (deleteSharesError) throw deleteSharesError;

    if (item.sharedWith.length > 0) {
      const { error: sharesError } = await supabase
        .from("bill_item_shares")
        .insert(
          item.sharedWith.map((participantId) => ({
            bill_item_id: item.id,
            participant_id: participantId,
          })),
        );
      if (sharesError) throw sharesError;
    }
  } catch (error) {
    await restorePrevious();
    throw error;
  }
}

export async function removeBillItem(billItemId: string) {
  const { error } = await supabase
    .from('bill_items')
    .delete()
    .eq('id', billItemId);
  
  if (error) throw error;
}

// Individual settlement functions
export async function getIndividualSettlements(eventId: string): Promise<IndividualSettlement[]> {
  const { data, error } = await supabase
    .from('individual_settlements')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at');
  
  if (error) throw error;
  return data || [];
}

export async function addIndividualSettlement(
  eventId: string,
  fromPersonId: string,
  toPersonId: string,
  currency: string,
  amount: number
) : Promise<IndividualSettlement> {
  const { data, error } = await supabase
    .from('individual_settlements')
    .insert([{
      event_id: eventId,
      from_person_id: fromPersonId,
      to_person_id: toPersonId,
      currency,
      amount
    }])
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
}

export async function removeIndividualSettlement(settlementId: string) {
  const { error } = await supabase
    .from("individual_settlements")
    .delete()
    .eq("id", settlementId);

  if (error) throw error;
}
