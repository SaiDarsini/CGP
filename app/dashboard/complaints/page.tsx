import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ComplaintsList } from '@/components/complaints/complaints-list'

export default async function ComplaintsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: complaints } = await supabase
    .from('complaints')
    .select('*')
    .eq('citizen_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Complaints</h1>
        <p className="text-muted-foreground">
          View and track all your submitted grievances
        </p>
      </div>
      <ComplaintsList complaints={complaints || []} />
    </div>
  )
}
