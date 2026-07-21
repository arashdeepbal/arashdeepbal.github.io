-- Per-person share amounts for each line item (who is assigned how much).

ALTER TABLE public.bill_items
  ADD COLUMN IF NOT EXISTS person_splits JSONB;

COMMENT ON COLUMN public.bill_items.person_splits IS 'JSON array of { "personId", "amount" } per share';
