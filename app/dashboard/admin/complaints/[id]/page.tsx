import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AdminComplaintDetail } from '@/components/admin/admin-complaint-detail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminComplaintDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const role = user.user_metadata?.role || 'citizen'
  if (role !== 'admin') {
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

  const { data: history } = await supabase
    .from('complaint_history')
    .select(`
      *,
      changed_by_profile:profiles!complaint_history_changed_by_fkey(id, full_name, role)
    `)
    .eq('complaint_id', id)
    .order('created_at', { ascending: true })

  const { data: officers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'officer')

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <AdminComplaintDetail 
        complaint={complaint} 
        history={history || []} 
        officers={officers || []}
        userId={user.id}
      />
    </div>
  )
}
