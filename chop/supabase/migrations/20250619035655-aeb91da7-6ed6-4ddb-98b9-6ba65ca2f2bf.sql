
-- Add emoji column to events table
ALTER TABLE public.events ADD COLUMN emoji TEXT DEFAULT '🍽️';

-- Create individual settlement tracking table
CREATE TABLE public.individual_settlements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    from_person_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    to_person_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    currency TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    settled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for individual settlements
ALTER TABLE public.individual_settlements ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to individual settlements
CREATE POLICY "Allow public access to individual_settlements" ON public.individual_settlements FOR ALL USING (true);

-- Create index for better performance
CREATE INDEX idx_individual_settlements_event_id ON public.individual_settlements(event_id);
CREATE INDEX idx_individual_settlements_from_person ON public.individual_settlements(from_person_id);
CREATE INDEX idx_individual_settlements_to_person ON public.individual_settlements(to_person_id);

-- For existing events, we'll keep their current IDs but update the landing page to generate 6-digit codes for new events
-- The current event "test_mv" will continue to work, and new events will use 6-digit numeric codes
