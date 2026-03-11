import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { OfficerComplaintDetail } from '@/components/complaints/officer-complaint-detail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OfficerComplaintDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const role = user.user_metadata?.role || 'citizen'
  if (role !== 'officer' && role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: complaint } = await supabase
    .from('complaints')
    .select(`
      *,
      citizen:profiles!complaints_citizen_id_fkey(id, full_name),
      assigned_officer:profiles!complaints_assigned_officer_id_fkey(id, full_name)
    `)
    .eq('id', id)
    .single()

  if (!complaint) {
    notFound()
  }

  // Officers can only see complaints assigned to them
  if (role === 'officer' && complaint.assigned_officer_id !== user.id) {
    redirect('/dashboard/officer/assigned')
  }

  // Get complaint history
  const { data: history } = await supabase
    .from('complaint_history')
    .select(`
      *,
      changed_by_profile:profiles!complaint_history_changed_by_fkey(id, full_name, role)
    `)
    .eq('complaint_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <OfficerComplaintDetail 
        complaint={complaint} 
        history={history || []} 
        userId={user.id}
      />
    </div>
  )
}
