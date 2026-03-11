import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminComplaintsList } from '@/components/admin/admin-complaints-list'

export default async function AdminComplaintsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const role = user.user_metadata?.role || 'citizen'
  if (role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: complaints } = await supabase
    .from('complaints')
    .select(`
      *,
      citizen:profiles!complaints_citizen_id_fkey(id, full_name),
      assigned_officer:profiles!complaints_assigned_officer_id_fkey(id, full_name)
    `)
    .order('created_at', { ascending: false })

  const { data: officers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'officer')

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">All Complaints</h1>
        <p className="text-muted-foreground">
          Manage and assign complaints to officers
        </p>
      </div>
      <AdminComplaintsList complaints={complaints || []} officers={officers || []} />
    </div>
  )
}
