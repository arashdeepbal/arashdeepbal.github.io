
-- Create events table to store trip/event information
CREATE TABLE public.events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participants table to store people in each event
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_seed TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bill_items table to store expenses
CREATE TABLE public.bill_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  paid_by UUID REFERENCES public.participants(id),
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bill_item_shares table to track who shares each bill item
CREATE TABLE public.bill_item_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_item_id UUID NOT NULL REFERENCES public.bill_items(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  UNIQUE(bill_item_id, participant_id)
);

-- Enable Row Level Security (RLS) - making all tables publicly accessible for this use case
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_item_shares ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (since this is a collaborative bill splitting app)
CREATE POLICY "Allow public access to events" ON public.events FOR ALL USING (true);
CREATE POLICY "Allow public access to participants" ON public.participants FOR ALL USING (true);
CREATE POLICY "Allow public access to bill_items" ON public.bill_items FOR ALL USING (true);
CREATE POLICY "Allow public access to bill_item_shares" ON public.bill_item_shares FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_participants_event_id ON public.participants(event_id);
CREATE INDEX idx_bill_items_event_id ON public.bill_items(event_id);
CREATE INDEX idx_bill_item_shares_bill_item_id ON public.bill_item_shares(bill_item_id);
CREATE INDEX idx_bill_item_shares_participant_id ON public.bill_item_shares(participant_id);
