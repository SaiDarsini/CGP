import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ComplaintDetail } from '@/components/complaints/complaint-detail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ComplaintDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: complaint } = await supabase
    .from('complaints')
    .select(`
      *,
      assigned_officer:profiles!complaints_assigned_officer_id_fkey(id, full_name)
    `)
    .eq('id', id)
    .single()

  if (!complaint) {
    notFound()
  }

  // Check if user has access to this complaint
  const role = user.user_metadata?.role || 'citizen'
  if (role === 'citizen' && complaint.citizen_id !== user.id) {
    redirect('/dashboard')
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
      <ComplaintDetail 
        complaint={complaint} 
        history={history || []} 
        userRole={role}
        userId={user.id}
      />
    </div>
  )
}
