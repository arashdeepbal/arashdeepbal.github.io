-- Per-person shares live in person_splits only; split_mode is redundant.

ALTER TABLE public.bill_items
  DROP CONSTRAINT IF EXISTS bill_items_split_mode_check;

ALTER TABLE public.bill_items
  DROP COLUMN IF EXISTS split_mode;
