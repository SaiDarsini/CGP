-- Create complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_number TEXT UNIQUE NOT NULL,
  citizen_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('road', 'water', 'electricity', 'garbage', 'streetlight')),
  image_pathname TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved')),
  assigned_officer_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Citizens can view their own complaints
CREATE POLICY "complaints_citizen_select" ON public.complaints
  FOR SELECT USING (
    auth.uid() = citizen_id OR
    auth.uid() = assigned_officer_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('officer', 'admin'))
  );

-- Citizens can insert their own complaints
CREATE POLICY "complaints_citizen_insert" ON public.complaints
  FOR INSERT WITH CHECK (auth.uid() = citizen_id);

-- Officers can update assigned complaints, admins can update all
CREATE POLICY "complaints_update" ON public.complaints
  FOR UPDATE USING (
    auth.uid() = assigned_officer_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_complaints_citizen_id ON public.complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_officer_id ON public.complaints(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_number ON public.complaints(complaint_number);
