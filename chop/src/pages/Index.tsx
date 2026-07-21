import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPlus } from "@/components/icons/app-icons";
import { toast } from "@/lib/app-toast";
import { Person, BillItem } from "@/types";
import { ParticipantFormSheet } from "@/components/ParticipantFormSheet";
import { ParticipantOnboardingForm } from "@/components/ParticipantOnboardingForm";
import { createParticipantDraft } from "@/lib/participant-draft";
import { TripEditSheet } from "@/components/TripEditSheet";
import { TripAccessOnboarding } from "@/components/TripAccessOnboarding";
import ParticipantsManager from "@/components/ParticipantsManager";
import BillItemsManager from "@/components/BillItemsManager";
import BillSummary from "@/components/BillSummary";
import ExpenseHistory from "@/components/ExpenseHistory";
import MoreTabPanel from "@/components/MoreTabPanel";
import TripBottomNav, { type TripNavSection } from "@/components/TripBottomNav";
import { useTripWorkspace } from "@/hooks/use-trip-workspace";
import {
  forgetRecentTrip,
  rememberRecentTrip,
} from "@/lib/recent-trips";
import { forgetBillFormPreferences } from "@/lib/bill-form-preferences";

const TRIP_PAGE_TITLES: Record<Exclude<TripNavSection, "participants">, string> = {
  bill: "Add a bill",
  summary: "Summary",
  history: "History",
  more: "Your trip",
};

export default function Index() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const {
    people,
    billItems,
    settlements,
    eventName,
    setEventName,
    loadStatus,
    loadError,
    reload,
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
  } = useTripWorkspace(eventId);
  /** Local-only list before setup is finished when the trip has no saved participants. */
  const [pendingPeople, setPendingPeople] = useState<Person[]>(() => [
    createParticipantDraft(),
  ]);
  const [savingPendingParticipants, setSavingPendingParticipants] = useState(false);
  const [showTripAccessOnboarding, setShowTripAccessOnboarding] = useState(false);
  /** Default for new line items: stored `value` in `BILL_CURRENCIES` (e.g. `$` for USD). */
  const activeCurrency = "$";
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
  const [editingBillItemId, setEditingBillItemId] = useState<string | null>(null);

  const showParticipantOnboarding = loadStatus === "ready" && people.length === 0;
  const showEmptyBillAction =
    billItems.length === 0 &&
    settlements.length === 0 &&
    (navSection === "summary" || navSection === "history");

  const tripPersonToEdit = participantsEditParticipantId
    ? people.find((p) => p.id === participantsEditParticipantId)
    : undefined;

  useEffect(() => {
    if (people.length > 0) {
      setPendingPeople([]);
    }
  }, [people.length]);

  useEffect(() => {
    if (loadStatus !== "ready" || !eventId || !eventName.trim()) return;
    rememberRecentTrip(eventId, eventName);
    document.title = `${eventName} · Chop Chop!`;
    return () => {
      document.title = "Chop Chop! - Split Your Bills Easily";
    };
  }, [eventId, eventName, loadStatus]);

  useEffect(() => {
    if (loadStatus === "error" && loadError === "not-found" && eventId) {
      forgetRecentTrip(eventId);
    }
  }, [eventId, loadError, loadStatus]);

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
    if (navSection !== "bill") {
      setEditingBillItemId(null);
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

  const handleAddPerson = async (person: Person) => {
    try {
      await addPerson(person);
    } catch (error) {
      console.error("Error adding participant:", error);
      toast.error("Failed to add participant", { id: "participant-add" });
      throw error;
    }
  };

  const handleRemovePerson = async (personId: string) => {
    const isLastParticipant =
      people.length === 1 && people[0]?.id === personId;

    try {
      if (isLastParticipant) {
        await deleteTrip();
        if (eventId) {
          forgetRecentTrip(eventId);
          forgetBillFormPreferences(eventId);
        }
        toast.success("Trip deleted");
        navigate("/", { replace: true });
        return;
      }

      await removePerson(personId);
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
      toast.success("Participant updated", { id: "participant-update" });
      return;
    }
    try {
      await updatePerson(person);
      toast.success("Participant updated", { id: "participant-update" });
    } catch (error) {
      console.error("Error updating participant:", error);
      toast.error("Failed to update participant", { id: "participant-update" });
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
      await saveInitialParticipants(participantsToSave);
      setPendingPeople([]);
      setShowTripAccessOnboarding(true);
      toast.success("Participants saved.", { id: "participants-save" });
    } catch (error) {
      console.error("Error saving participants:", error);
      toast.error("Failed to save participants. Please try again.", {
        id: "participants-save",
      });
    } finally {
      setSavingPendingParticipants(false);
    }
  };

  const handleAddBillItem = async (item: BillItem) => {
    try {
      await addBill(item);
    } catch (error) {
      console.error('Error adding bill item:', error);
      toast.error("Failed to add bill item", { id: "bill-save" });
      throw error;
    }
  };

  const handleRemoveBillItem = async (itemId: string) => {
    try {
      await removeBill(itemId);
    } catch (error) {
      console.error("Error removing bill item:", error);
      toast.error("Failed to remove bill item");
      throw error;
    }
  };

  const handleUpdateBillItem = async (item: BillItem) => {
    try {
      await updateBill(item);
      setEditingBillItemId(null);
      toast.success("Expense updated", { id: "expense-update" });
    } catch (error) {
      console.error("Error updating bill item:", error);
      toast.error("Failed to update expense", { id: "expense-update" });
      throw error;
    }
  };

  const handleSettleIndividual = async (fromPersonId: string, toPersonId: string, currency: string, amount: number) => {
    try {
      return await settleDebt(fromPersonId, toPersonId, currency, amount);
    } catch (error) {
      console.error('Error settling individual debt:', error);
      throw error; // Re-throw to let the calling component handle the error
    }
  };

  const handleRemoveSettlement = async (settlementId: string) => {
    try {
      await removeSettlement(settlementId);
    } catch (error) {
      console.error("Error removing settlement:", error);
      toast.error("Failed to undo settlement");
      throw error;
    }
  };

  if (loadStatus === "loading") {
    return (
      <div className="min-h-screen bg-white">
        <main className="app-page">
          <div className="flex flex-col items-center mb-8 py-4 space-y-3">
            <Skeleton className="h-9 w-48" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (loadStatus === "error") {
    const tripWasNotFound = loadError === "not-found";
    return (
      <div className="min-h-screen bg-white">
        <main className="app-page flex flex-col items-center justify-center text-center">
          <div className="max-w-sm space-y-4">
            {tripWasNotFound ? (
              <img
                src={`${import.meta.env.BASE_URL}trip-not-found.jpg`}
                alt=""
                width={180}
                height={180}
                className="empty-state-illustration mx-auto block"
                decoding="async"
              />
            ) : null}
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {tripWasNotFound ? "Trip not found" : "Couldn’t load this trip"}
            </h1>
            <p className="text-muted-foreground">
              {tripWasNotFound
                ? "This trip may have been deleted, or the link or access code may be incorrect."
                : "Check your connection and try again. No trip information was changed."}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button type="button" onClick={() => navigate("/", { replace: true })}>
                Go to home
              </Button>
              <Button type="button" variant="outline" onClick={() => void reload()}>
                Try again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main
        className={
          showParticipantOnboarding || showTripAccessOnboarding
            ? "app-page"
            : "app-page pt-4"
        }
      >
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
            tripName={eventName}
            onContinue={() => setShowTripAccessOnboarding(false)}
          />
        ) : (
          <>
            {eventId && (
              <div className="relative left-1/2 z-0 mb-4 w-screen min-w-0 -translate-x-1/2 border-b border-border bg-white">
                <header className="mx-auto w-full max-w-app px-4 pb-4">
                  <p className="mb-1 truncate text-sm font-medium text-muted-foreground">
                    {eventName.trim() || "Trip"}
                  </p>
                  {navSection === "participants" && (
                    <h1 className="min-w-0 truncate text-2xl font-bold tracking-tight text-foreground">
                      Participants ({people.length})
                    </h1>
                  )}
                  {navSection !== "participants" && (
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      {navSection === "bill" && editingBillItemId
                        ? "Edit expense"
                        : navSection === "summary" && summaryHasDebtEntries
                          ? "Who owes who"
                          : TRIP_PAGE_TITLES[navSection]}
                    </h1>
                  )}
                </header>
              </div>
            )}
            <div
              className={
                navSection === "participants" ||
                navSection === "bill" ||
                showEmptyBillAction
                  ? "pb-[calc(3.5rem+6.5rem+var(--bottom-nav-safe-area))]"
                  : "pb-[calc(3.5rem+var(--bottom-nav-safe-area))]"
              }
            >
              {eventId && navSection === "bill" && (
                <div className="space-y-6">
                  <BillItemsManager
                    people={people}
                    billItems={billItems}
                    tripId={eventId}
                    activeCurrency={activeCurrency}
                    onAddItem={handleAddBillItem}
                    editingItem={
                      editingBillItemId
                        ? billItems.find((item) => item.id === editingBillItemId) ?? null
                        : null
                    }
                    onUpdateItem={handleUpdateBillItem}
                    onCancelEdit={() => setEditingBillItemId(null)}
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
                    onRemoveSettlement={handleRemoveSettlement}
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
                    onRemoveSettlement={handleRemoveSettlement}
                    onEditItem={(item) => {
                      setEditingBillItemId(item.id);
                      setNavSection("bill");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </div>
              )}

              {eventId && navSection === "more" && (
                <MoreTabPanel
                  eventId={eventId}
                  tripName={eventName}
                  onEditTrip={() => setTripEditSheetOpen(true)}
                  onExitTrip={() => navigate("/")}
                />
              )}
            </div>

            {eventId &&
              (navSection === "participants" || showEmptyBillAction) && (
              <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[60]">
                <div className="mx-auto flex w-full max-w-app justify-center px-4 pb-[calc(0.25rem+3.5rem+1rem+var(--bottom-nav-safe-area))]">
                  <Button
                    type="button"
                    className="pointer-events-auto h-12 min-h-12 min-w-0 gap-2 rounded-full px-5 text-base font-medium shadow-[0_10px_40px_-8px_rgba(0,0,0,0.22),0_4px_16px_-4px_rgba(0,0,0,0.12)] ring-1 ring-foreground/10"
                    onClick={() => {
                      if (navSection === "participants") {
                        setParticipantsAddView(true);
                        setParticipantsEditParticipantId(null);
                        return;
                      }
                      setNavSection("bill");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <IconPlus className="h-5 w-5 shrink-0" />
                    {navSection === "participants"
                      ? "Add participant"
                      : "Add your first bill"}
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
      </main>
    </div>
  );
}
