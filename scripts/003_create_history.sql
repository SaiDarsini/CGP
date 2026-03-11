-- Create complaint_history table for tracking status changes
CREATE TABLE IF NOT EXISTS public.complaint_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  remarks TEXT,
  changed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.complaint_history ENABLE ROW LEVEL SECURITY;

-- History follows complaint visibility
CREATE POLICY "history_select" ON public.complaint_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_id AND (
        c.citizen_id = auth.uid() OR
        c.assigned_officer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('officer', 'admin'))
      )
    )
  );

-- Officers and admins can insert history
CREATE POLICY "history_insert" ON public.complaint_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('citizen', 'officer', 'admin'))
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_history_complaint_id ON public.complaint_history(complaint_id);

-- Function to auto-update complaints.updated_at
CREATE OR REPLACE FUNCTION update_complaint_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.complaints SET updated_at = NOW() WHERE id = NEW.complaint_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_history_insert ON public.complaint_history;

CREATE TRIGGER on_history_insert
  AFTER INSERT ON public.complaint_history
  FOR EACH ROW
  EXECUTE FUNCTION update_complaint_timestamp();
