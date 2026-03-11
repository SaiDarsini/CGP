-- Allow public tracking of complaints by complaint_number (no auth required)
-- This is a separate function that can be called via RPC

CREATE OR REPLACE FUNCTION public.track_complaint(p_complaint_number TEXT)
RETURNS TABLE (
  id UUID,
  complaint_number TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  status TEXT,
  address TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.complaint_number,
    c.title,
    c.description,
    c.category,
    c.status,
    c.address,
    c.created_at,
    c.updated_at
  FROM public.complaints c
  WHERE c.complaint_number = p_complaint_number;
END;
$$;

-- Function to get complaint history for public tracking
CREATE OR REPLACE FUNCTION public.get_complaint_history(p_complaint_number TEXT)
RETURNS TABLE (
  id UUID,
  status TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.status,
    h.remarks,
    h.created_at
  FROM public.complaint_history h
  JOIN public.complaints c ON c.id = h.complaint_id
  WHERE c.complaint_number = p_complaint_number
  ORDER BY h.created_at DESC;
END;
$$;
