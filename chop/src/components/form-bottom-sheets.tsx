import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  BILL_CURRENCIES,
  currencyMatchesQuery,
  getCurrencyByValue,
  type BillCurrency,
} from "@/lib/currencies";
import type { Person } from "@/types";
import PersonAvatar from "@/components/PersonAvatar";

interface CurrencyBottomSheetProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  /** Stored `value` fields from bill line items, first-seen order (may include unknown codes). */
  usedCurrencyValues?: string[];
}

function CurrencyRow({
  c,
  selected,
  onSelect,
}: {
  c: BillCurrency;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-4 border-b border-border py-4 pl-4 pr-4 text-left transition-colors",
        "hover:bg-muted/50",
        selected && "bg-primary/5"
      )}
      onClick={onSelect}
    >
      <span className="shrink-0 text-2xl leading-none" aria-hidden>
        {c.flag}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-foreground">{c.iso}</p>
        <p className="text-sm text-muted-foreground">{c.fullName}</p>
      </div>
      <span className="shrink-0 text-sm font-medium text-muted-foreground">{c.symbol}</span>
    </button>
  );
}

export function CurrencyBottomSheet({
  id,
  value,
  onValueChange,
  label,
  usedCurrencyValues = [],
}: CurrencyBottomSheetProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const current = getCurrencyByValue(value);

  const usedInTrip = useMemo((): BillCurrency[] => {
    const list: BillCurrency[] = [];
    const seen = new Set<string>();
    for (const v of usedCurrencyValues) {
      const c = getCurrencyByValue(v);
      if (c && !seen.has(c.value)) {
        seen.add(c.value);
        list.push(c);
      }
    }
    return list;
  }, [usedCurrencyValues]);

  const allExceptUsed = useMemo(() => {
    const used = new Set(usedInTrip.map((c) => c.value));
    return BILL_CURRENCIES.filter((c) => !used.has(c.value));
  }, [usedInTrip]);

  const { usedFiltered, otherFiltered } = useMemo(() => {
    const u = usedInTrip.filter((c) => currencyMatchesQuery(c, search));
    const o = allExceptUsed.filter((c) => currencyMatchesQuery(c, search));
    return { usedFiltered: u, otherFiltered: o };
  }, [usedInTrip, allExceptUsed, search]);

  const hasSearch = search.trim().length > 0;
  const noResults = hasSearch && usedFiltered.length === 0 && otherFiltered.length === 0;

  useEffect(() => {
    if (open) {
      setSearch("");
      const t = requestAnimationFrame(() => searchInputRef.current?.focus());
      return () => cancelAnimationFrame(t);
    }
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearch("");
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Button
        id={id}
        type="button"
        variant="outline"
        className="h-auto min-h-12 w-full justify-between gap-2 px-3 py-2.5 text-left font-normal"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          {current ? (
            <>
              <span className="shrink-0 text-2xl leading-none" aria-hidden>
                {current.flag}
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-base font-semibold text-foreground">
                  {current.iso}
                </span>
                <span className="line-clamp-1 text-sm text-muted-foreground">
                  {current.fullName}
                </span>
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">{value || "Select currency"}</span>
          )}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
      </Button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="bottom"
          className="flex max-h-[min(94dvh,800px)] flex-col gap-0 rounded-t-2xl border-border p-0"
        >
          <div className="w-full shrink-0 border-b border-border">
            <SheetHeader className="space-y-3 px-4 py-4 text-left">
              <SheetTitle className="text-left">Select currency</SheetTitle>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  ref={searchInputRef}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or code"
                  className="h-10 pl-9"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="search"
                />
              </div>
            </SheetHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {noResults && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No matching currencies</p>
            )}

            {!noResults && !hasSearch && usedFiltered.length > 0 && (
              <div>
                <p className="bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  In this trip
                </p>
                {usedFiltered.map((c) => (
                  <CurrencyRow
                    key={`trip-${c.value}`}
                    c={c}
                    selected={value === c.value}
                    onSelect={() => {
                      onValueChange(c.value);
                      handleOpenChange(false);
                    }}
                  />
                ))}
              </div>
            )}

            {!noResults && !hasSearch && otherFiltered.length > 0 && (
              <div>
                {usedInTrip.length > 0 && (
                  <p className="bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    All currencies
                  </p>
                )}
                {otherFiltered.map((c) => (
                  <CurrencyRow
                    key={c.value}
                    c={c}
                    selected={value === c.value}
                    onSelect={() => {
                      onValueChange(c.value);
                      handleOpenChange(false);
                    }}
                  />
                ))}
              </div>
            )}

            {hasSearch && !noResults && (
              <div>
                {usedFiltered.length > 0 && (
                  <div>
                    <p className="bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      In this trip
                    </p>
                    {usedFiltered.map((c) => (
                      <CurrencyRow
                        key={`s-trip-${c.value}`}
                        c={c}
                        selected={value === c.value}
                        onSelect={() => {
                          onValueChange(c.value);
                          handleOpenChange(false);
                        }}
                      />
                    ))}
                  </div>
                )}
                {otherFiltered.length > 0 && (
                  <div>
                    {usedFiltered.length > 0 && otherFiltered.length > 0 && (
                      <p className="bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Other
                      </p>
                    )}
                    {usedFiltered.length === 0 && otherFiltered.length > 0 && (
                      <p className="bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        All currencies
                      </p>
                    )}
                    {otherFiltered.map((c) => (
                      <CurrencyRow
                        key={`s-${c.value}`}
                        c={c}
                        selected={value === c.value}
                        onSelect={() => {
                          onValueChange(c.value);
                          handleOpenChange(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface PersonBottomSheetProps {
  id?: string;
  value: string | null;
  onValueChange: (id: string) => void;
  people: Person[];
  label: string;
  placeholder: string;
  title?: string;
}

export function PersonBottomSheet({
  id,
  value,
  onValueChange,
  people,
  label,
  placeholder,
  title = "Select who paid",
}: PersonBottomSheetProps) {
  const [open, setOpen] = useState(false);
  const selected = people.find((p) => p.id === value);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Button
        id={id}
        type="button"
        variant="outline"
        className="h-auto min-h-12 w-full justify-between gap-2 px-3 py-2.5 text-left font-normal"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          {selected ? (
            <>
              <PersonAvatar name={selected.name} seed={selected.avatarSeed} size="sm" />
              <span className="truncate text-base font-medium text-foreground">
                {selected.name}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[min(94dvh,760px)] flex-col gap-0 rounded-t-2xl border-border p-0"
        >
          <div className="w-full shrink-0 border-b border-border">
            <SheetHeader className="px-4 py-4 text-left">
              <SheetTitle className="text-left">{title}</SheetTitle>
            </SheetHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {people.map((person) => {
              const isSelected = value === person.id;
              return (
                <button
                  key={person.id}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-4 border-b border-border py-4 pl-4 pr-4 text-left transition-colors last:border-0",
                    "hover:bg-muted/50",
                    isSelected && "bg-primary/5"
                  )}
                  onClick={() => {
                    onValueChange(person.id);
                    setOpen(false);
                  }}
                >
                  <PersonAvatar name={person.name} seed={person.avatarSeed} />
                  <span className="min-w-0 flex-1 text-base font-medium text-foreground">
                    {person.name}
                  </span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
