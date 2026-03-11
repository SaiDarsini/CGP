import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ComplaintsList } from '@/components/complaints/complaints-list'

export default async function OfficerAssignedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const role = user.user_metadata?.role || 'citizen'
  if (role !== 'officer' && role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: complaints } = await supabase
    .from('complaints')
    .select(`
      *,
      citizen:profiles!complaints_citizen_id_fkey(id, full_name)
    `)
    .eq('assigned_officer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Assigned Complaints</h1>
        <p className="text-muted-foreground">
          Complaints assigned to you for resolution
        </p>
      </div>
      <ComplaintsList complaints={complaints || []} showCitizen />
    </div>
  )
}
