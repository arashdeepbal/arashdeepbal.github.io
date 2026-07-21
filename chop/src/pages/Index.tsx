import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPlus } from "@/components/icons/app-icons";
import { toast } from "sonner";
import { Person, BillItem } from "@/types";
import { ParticipantFormSheet } from "@/components/ParticipantFormSheet";
import {
  createParticipantDraft,
  ParticipantOnboardingForm,
} from "@/components/ParticipantOnboardingForm";
import { TripEditSheet } from "@/components/TripEditSheet";
import { TripAccessOnboarding } from "@/components/TripAccessOnboarding";
import ParticipantsManager from "@/components/ParticipantsManager";
import BillItemsManager from "@/components/BillItemsManager";
import BillSummary from "@/components/BillSummary";
import ExpenseHistory from "@/components/ExpenseHistory";
import MoreTabPanel from "@/components/MoreTabPanel";
import TripBottomNav, { type TripNavSection } from "@/components/TripBottomNav";

import {
  getEvent,
  deleteEvent,
  getParticipants,
  addParticipant,
  updateParticipant,
  removeParticipant,
  getBillItems,
  addBillItem,
  removeBillItem,
  updateBillItem,
  getIndividualSettlements,
  addIndividualSettlement,
  IndividualSettlement
} from "@/services/database";

const TRIP_PAGE_TITLES: Record<Exclude<TripNavSection, "participants">, string> = {
  bill: "Add a bill",
  summary: "Summary",
  history: "History",
  more: "Your trip",
};

export default function Index() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [people, setPeople] = useState<Person[]>([]);
  /** Local-only list before "Create trip" is pressed when the trip has no saved participants */
  const [pendingPeople, setPendingPeople] = useState<Person[]>(() => [
    createParticipantDraft(),
  ]);
  const [savingPendingParticipants, setSavingPendingParticipants] = useState(false);
  const [showTripAccessOnboarding, setShowTripAccessOnboarding] = useState(false);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [settlements, setSettlements] = useState<IndividualSettlement[]>([]);
  /** Default for new line items: stored `value` in `BILL_CURRENCIES` (e.g. `$` for USD). */
  const activeCurrency = "$";
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(true);
  const [navSection, setNavSection] = useState<TripNavSection>("bill");
  /** Summary tab: at least one debtor line (for page title "Who owes who"). */
  const [summaryHasDebtEntries, setSummaryHasDebtEntries] = useState(false);
  /** Add-participant "sub-page" on Participants tab */
  const [participantsAddView, setParticipantsAddView] = useState(false);
  /** Edit-participant sub-page (trip participants tab) */
  const [participantsEditParticipantId, setParticipantsEditParticipantId] = useState<
    string | null
  >(null);
  const [tripEditSheetOpen, setTripEditSheetOpen] = useState(false);

  const showParticipantOnboarding = !loading && people.length === 0;

  const tripPersonToEdit = participantsEditParticipantId
    ? people.find((p) => p.id === participantsEditParticipantId)
    : undefined;

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  useEffect(() => {
    if (people.length > 0) {
      setPendingPeople([]);
    }
  }, [people.length]);

  useEffect(() => {
    if (showParticipantOnboarding && pendingPeople.length === 0) {
      setPendingPeople([createParticipantDraft()]);
    }
  }, [showParticipantOnboarding, pendingPeople.length]);

  useEffect(() => {
    if (navSection !== "participants") {
      setParticipantsAddView(false);
      setParticipantsEditParticipantId(null);
    }
    if (navSection !== "summary") {
      setSummaryHasDebtEntries(false);
    }
    if (navSection !== "more") {
      setTripEditSheetOpen(false);
    }
  }, [navSection]);

  useEffect(() => {
    if (
      participantsEditParticipantId &&
      !people.some((p) => p.id === participantsEditParticipantId)
    ) {
      setParticipantsEditParticipantId(null);
    }
  }, [people, participantsEditParticipantId]);

  const loadEventData = async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      
      // Load event details
      const event = await getEvent(eventId);
      setEventName(event.name);
      
      // Load participants
      const participantsData = await getParticipants(eventId);
      setPeople(participantsData);
      
      // Load bill items
      const billItemsData = await getBillItems(eventId);
      setBillItems(billItemsData);
      
      // Load settlements
      const settlementsData = await getIndividualSettlements(eventId);
      setSettlements(settlementsData);
      
    } catch (error) {
      console.error('Error loading event data:', error);
      toast.error("Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPerson = async (person: Person) => {
    if (!eventId) {
      throw new Error("Missing event");
    }

    try {
      await addParticipant(eventId, person);
      setPeople((prev) => [...prev, person]);
    } catch (error) {
      console.error("Error adding participant:", error);
      toast.error("Failed to add participant");
      throw error;
    }
  };

  const handleRemovePerson = async (personId: string) => {
    const isLastParticipant =
      people.length === 1 && people[0]?.id === personId;

    try {
      if (isLastParticipant) {
        if (!eventId) throw new Error("Missing event");
        await deleteEvent(eventId);
        toast.success("Trip deleted");
        navigate("/", { replace: true });
        return;
      }

      await removeParticipant(personId);
      setPeople((prev) => prev.filter((p) => p.id !== personId));
    } catch (error) {
      console.error(
        isLastParticipant ? "Error deleting trip:" : "Error removing participant:",
        error
      );
      toast.error(
        isLastParticipant ? "Failed to delete trip" : "Failed to remove participant"
      );
      throw error;
    }
  };

  const handleUpdatePerson = async (person: Person) => {
    if (people.length === 0) {
      setPendingPeople((prev) => prev.map((p) => (p.id === person.id ? person : p)));
      toast.success("Participant updated");
      return;
    }
    if (!eventId) return;
    try {
      await updateParticipant(person);
      setPeople((prev) => prev.map((p) => (p.id === person.id ? person : p)));
      toast.success("Participant updated");
    } catch (error) {
      console.error("Error updating participant:", error);
      toast.error("Failed to update participant");
      throw error;
    }
  };

  const handleOnboardingCreateTrip = async (confirmedPeople: Person[]) => {
    if (!eventId) return;
    const participantsToSave = confirmedPeople
      .map((person) => ({ ...person, name: person.name.trim() }))
      .filter((person) => person.name.length > 0);

    if (participantsToSave.length === 0) {
      toast.error("Add at least one participant to continue");
      return;
    }
    const normalizedNames = participantsToSave.map((person) =>
      person.name.toLowerCase(),
    );
    if (new Set(normalizedNames).size !== normalizedNames.length) {
      toast.error("Each participant needs a unique name");
      return;
    }

    setSavingPendingParticipants(true);
    try {
      for (const person of participantsToSave) {
        await addParticipant(eventId, person);
      }
      setPeople(participantsToSave);
      setPendingPeople([]);
      setShowTripAccessOnboarding(true);
      toast.success("Participants saved.");
    } catch (error) {
      console.error("Error saving participants:", error);
      toast.error("Failed to save participants. Please try again.");
      try {
        const participantsData = await getParticipants(eventId);
        setPeople(participantsData);
        setPendingPeople([]);
      } catch {
        // ignore
      }
    } finally {
      setSavingPendingParticipants(false);
    }
  };

  const handleAddBillItem = async (item: BillItem) => {
    if (!eventId) return;
    
    try {
      await addBillItem(eventId, item);
      setBillItems(prev => [...prev, item]);
    } catch (error) {
      console.error('Error adding bill item:', error);
      toast.error("Failed to add bill item");
    }
  };

  const handleUpdateBillItem = async (item: BillItem) => {
    try {
      await updateBillItem(item);
      setBillItems(prev => prev.map(bi => bi.id === item.id ? item : bi));
    } catch (error) {
      console.error('Error updating bill item:', error);
      toast.error("Failed to update bill item");
    }
  };

  const handleRemoveBillItem = async (itemId: string) => {
    try {
      await removeBillItem(itemId);
      setBillItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error removing bill item:", error);
      toast.error("Failed to remove bill item");
      throw error;
    }
  };

  const handleSettleIndividual = async (fromPersonId: string, toPersonId: string, currency: string, amount: number) => {
    if (!eventId) return;
    
    try {
      await addIndividualSettlement(eventId, fromPersonId, toPersonId, currency, amount);
      
      // Reload settlements to get the latest data
      const settlementsData = await getIndividualSettlements(eventId);
      setSettlements(settlementsData);
      
    } catch (error) {
      console.error('Error settling individual debt:', error);
      throw error; // Re-throw to let the calling component handle the error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="app-page">
          <div className="flex flex-col items-center mb-8 py-4 space-y-3">
            <Skeleton className="h-9 w-48" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="app-page">
        {showParticipantOnboarding ? (
          <>
            <div className="w-full space-y-6">
              <div className="space-y-3 text-center">
                <img
                  src={`${import.meta.env.BASE_URL}participants-illustration.webp`}
                  alt="Smiling man and woman standing together, representing a group of participants."
                  width={180}
                  height={180}
                  className="empty-state-illustration mx-auto block"
                  decoding="async"
                />
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Add participants
                </h1>
              </div>
              <ParticipantOnboardingForm
                people={pendingPeople}
                onPeopleChange={setPendingPeople}
                onCreateTrip={handleOnboardingCreateTrip}
                saving={savingPendingParticipants}
              />
            </div>
          </>
        ) : showTripAccessOnboarding && eventId ? (
          <TripAccessOnboarding
            eventId={eventId}
            onContinue={() => setShowTripAccessOnboarding(false)}
          />
        ) : (
          <>
            {eventId && (
              <div className="relative left-1/2 z-0 mb-6 w-screen min-w-0 -translate-x-1/2 border-b border-border bg-white">
                <header className="mx-auto w-full max-w-app px-4 pb-4">
                  {navSection === "participants" && (
                    <h1 className="min-w-0 truncate text-2xl font-bold tracking-tight text-foreground">
                      Participants ({people.length})
                    </h1>
                  )}
                  {navSection !== "participants" && (
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      {navSection === "summary" && summaryHasDebtEntries
                        ? "Who owes who"
                        : TRIP_PAGE_TITLES[navSection]}
                    </h1>
                  )}
                </header>
              </div>
            )}
            <div
              className={
                navSection === "participants"
                  ? "pb-[calc(3.5rem+7.5rem+var(--bottom-nav-safe-area))]"
                  : "pb-[calc(3.5rem+var(--bottom-nav-safe-area))]"
              }
            >
              {eventId && navSection === "bill" && (
                <div className="space-y-6">
                  <BillItemsManager
                    people={people}
                    billItems={billItems}
                    activeCurrency={activeCurrency}
                    onAddItem={handleAddBillItem}
                    onUpdateItem={handleUpdateBillItem}
                    onRemoveItem={handleRemoveBillItem}
                  />
                </div>
              )}

              {eventId && navSection === "summary" && (
                <div className="space-y-6">
                  <BillSummary
                    billItems={billItems}
                    people={people}
                    settlements={settlements}
                    onSettleIndividual={handleSettleIndividual}
                    onDebtSplitsChange={setSummaryHasDebtEntries}
                  />
                </div>
              )}

              {eventId && navSection === "participants" && (
                <div className="space-y-6">
                  <ParticipantsManager
                    mode="list"
                    people={people}
                    onAddPerson={handleAddPerson}
                    onRemovePerson={handleRemovePerson}
                    onEditPerson={(p) => {
                      setParticipantsEditParticipantId(p.id);
                      setParticipantsAddView(false);
                    }}
                    emptyStateText="No one yet. Tap Add participant to get started."
                  />
                </div>
              )}

              {eventId && navSection === "history" && (
                <div className="space-y-6">
                  <ExpenseHistory
                    billItems={billItems}
                    people={people}
                    settlements={settlements}
                    onRemoveItem={handleRemoveBillItem}
                  />
                </div>
              )}

              {eventId && navSection === "more" && (
                <MoreTabPanel
                  eventId={eventId}
                  tripName={eventName}
                  onEditTrip={() => setTripEditSheetOpen(true)}
                />
              )}
            </div>

            {eventId && navSection === "participants" && (
              <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[60]">
                <div className="mx-auto flex w-full max-w-app justify-center px-4 pb-[calc(0.25rem+3.5rem+2rem+var(--bottom-nav-safe-area))]">
                  <Button
                    type="button"
                    className="pointer-events-auto h-12 min-h-12 min-w-0 gap-2 rounded-full px-5 text-base font-medium shadow-[0_10px_40px_-8px_rgba(0,0,0,0.22),0_4px_16px_-4px_rgba(0,0,0,0.12)] ring-1 ring-foreground/10"
                    onClick={() => {
                      setParticipantsAddView(true);
                      setParticipantsEditParticipantId(null);
                    }}
                  >
                    <IconPlus className="h-5 w-5 shrink-0" />
                    Add participant
                  </Button>
                </div>
              </div>
            )}

            {eventId && navSection === "participants" && (
              <>
                <ParticipantFormSheet
                  open={participantsAddView}
                  onOpenChange={setParticipantsAddView}
                  variant="add"
                  people={people}
                  onAddPerson={handleAddPerson}
                  notifyOnAdd
                />
                <ParticipantFormSheet
                  open={Boolean(participantsEditParticipantId && tripPersonToEdit)}
                  onOpenChange={(o) => {
                    if (!o) setParticipantsEditParticipantId(null);
                  }}
                  variant="edit"
                  people={people}
                  personToEdit={tripPersonToEdit ?? undefined}
                  onUpdatePerson={handleUpdatePerson}
                />
              </>
            )}

            {eventId && (
              <TripEditSheet
                open={tripEditSheetOpen}
                onOpenChange={setTripEditSheetOpen}
                eventId={eventId}
                tripName={eventName}
                onSaved={setEventName}
              />
            )}

            {eventId && (
              <TripBottomNav active={navSection} onChange={setNavSection} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
