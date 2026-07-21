import { useCallback, useEffect, useRef, useState } from "react";
import type { BillItem, Person } from "@/types";
import { removeParticipantFromBillItem } from "@/lib/remove-participant-references";
import {
  addIndividualSettlement,
  addParticipant,
  addBillItem as createBillItem,
  deleteEvent,
  getBillItems,
  getEvent,
  getIndividualSettlements,
  getParticipants,
  type IndividualSettlement,
  removeBillItem as deleteBillItem,
  removeIndividualSettlement,
  removeParticipant,
  TripNotFoundError,
  updateBillItem,
  updateParticipant,
} from "@/services/database";

type TripLoadStatus = "loading" | "ready" | "error";
type TripLoadError = "not-found" | "unavailable" | null;

export function useTripWorkspace(eventId: string | undefined) {
  const [people, setPeople] = useState<Person[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [settlements, setSettlements] = useState<IndividualSettlement[]>([]);
  const [eventName, setEventName] = useState("");
  const [loadStatus, setLoadStatus] = useState<TripLoadStatus>("loading");
  const [loadError, setLoadError] = useState<TripLoadError>(null);
  const requestVersionRef = useRef(0);

  const loadTrip = useCallback(async () => {
    const requestVersion = ++requestVersionRef.current;
    setLoadStatus("loading");
    setLoadError(null);

    if (!eventId) {
      setLoadError("not-found");
      setLoadStatus("error");
      return;
    }

    try {
      const event = await getEvent(eventId);
      const [nextPeople, nextBillItems, nextSettlements] = await Promise.all([
        getParticipants(eventId),
        getBillItems(eventId),
        getIndividualSettlements(eventId),
      ]);

      if (requestVersion !== requestVersionRef.current) return;
      setEventName(event.name);
      setPeople(nextPeople);
      setBillItems(nextBillItems);
      setSettlements(nextSettlements);
      setLoadStatus("ready");
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) return;
      console.error("Error loading trip data:", error);
      setLoadError(error instanceof TripNotFoundError ? "not-found" : "unavailable");
      setLoadStatus("error");
    }
  }, [eventId]);

  useEffect(() => {
    void loadTrip();
    return () => {
      requestVersionRef.current += 1;
    };
  }, [loadTrip]);

  const addPerson = useCallback(
    async (person: Person) => {
      if (!eventId) throw new Error("Missing event");
      await addParticipant(eventId, person);
      setPeople((current) => [...current, person]);
    },
    [eventId],
  );

  const saveInitialParticipants = useCallback(
    async (participants: Person[]) => {
      if (!eventId) throw new Error("Missing event");
      const savedParticipantIds: string[] = [];
      try {
        for (const person of participants) {
          await addParticipant(eventId, person);
          savedParticipantIds.push(person.id);
        }
        setPeople(participants);
      } catch (error) {
        await Promise.allSettled(
          savedParticipantIds.map((personId) =>
            removeParticipant(eventId, personId),
          ),
        );
        try {
          setPeople(await getParticipants(eventId));
        } catch {
          // Preserve the original save error.
        }
        throw error;
      }
    },
    [eventId],
  );

  const removePerson = useCallback(
    async (personId: string) => {
      if (!eventId) throw new Error("Missing event");
      await removeParticipant(eventId, personId);
      setPeople((current) => current.filter((person) => person.id !== personId));
      setBillItems((current) =>
        current.map((item) => removeParticipantFromBillItem(item, personId)),
      );
      setSettlements((current) =>
        current.filter(
          (settlement) =>
            settlement.from_person_id !== personId &&
            settlement.to_person_id !== personId,
        ),
      );
    },
    [eventId],
  );

  const updatePerson = useCallback(async (person: Person) => {
    await updateParticipant(person);
    setPeople((current) =>
      current.map((existing) => (existing.id === person.id ? person : existing)),
    );
  }, []);

  const deleteTrip = useCallback(async () => {
    if (!eventId) throw new Error("Missing event");
    await deleteEvent(eventId);
  }, [eventId]);

  const addBill = useCallback(
    async (item: BillItem) => {
      if (!eventId) throw new Error("Missing event");
      await createBillItem(eventId, item);
      setBillItems((current) => [...current, item]);
    },
    [eventId],
  );

  const removeBill = useCallback(async (itemId: string) => {
    await deleteBillItem(itemId);
    setBillItems((current) => current.filter((item) => item.id !== itemId));
  }, []);

  const updateBill = useCallback(
    async (item: BillItem) => {
      if (!eventId) throw new Error("Missing event");
      await updateBillItem(eventId, item);
      setBillItems((current) =>
        current.map((existing) => (existing.id === item.id ? item : existing)),
      );
    },
    [eventId],
  );

  const settleDebt = useCallback(
    async (
      fromPersonId: string,
      toPersonId: string,
      currency: string,
      amount: number,
    ) => {
      if (!eventId) throw new Error("Missing event");
      const settlement = await addIndividualSettlement(
        eventId,
        fromPersonId,
        toPersonId,
        currency,
        amount,
      );
      setSettlements((current) => [...current, settlement]);
      return settlement;
    },
    [eventId],
  );

  const removeSettlement = useCallback(async (settlementId: string) => {
    await removeIndividualSettlement(settlementId);
    setSettlements((current) =>
      current.filter((settlement) => settlement.id !== settlementId),
    );
  }, []);

  return {
    people,
    billItems,
    settlements,
    eventName,
    setEventName,
    loadStatus,
    loadError,
    reload: loadTrip,
    addPerson,
    saveInitialParticipants,
    removePerson,
    updatePerson,
    deleteTrip,
    addBill,
    updateBill,
    removeBill,
    settleDebt,
    removeSettlement,
  };
}
